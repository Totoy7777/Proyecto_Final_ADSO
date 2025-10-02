import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProduct } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { getReviews, createReview, respondReview, removeReview } from "../api/reviews";
import { FaStar, FaStarHalfAlt, FaTruck, FaStore, FaHeart, FaBalanceScale } from "react-icons/fa";
import "../Css/ProductDetail.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, authHeader, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({ puntuacion: 5, comentario: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeResponse, setActiveResponse] = useState(null);
  const [responseDrafts, setResponseDrafts] = useState({});
  const [respondingReviewId, setRespondingReviewId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [qty, setQty] = useState(1);

  const maxQty = useMemo(() => {
    const raw = Number(product?.stock ?? product?.inventario ?? 0);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  }, [product?.stock, product?.inventario]);

  const reloadReviews = useCallback(async () => {
    if (!productId) {
      return;
    }
    setReviewsLoading(true);
    setReviewError("");
    try {
      const data = await getReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[ProductDetail] reloadReviews", err);
      setReviewError("No fue posible cargar las reseñas. Intenta más tarde.");
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const data = await getProduct(productId);
        setProduct(data ? {
          ...data,
          id: data.productId ?? data.id,
          image: data.imageUrl ?? data.image,
          price: Number(data.price ?? 0),
        } : null);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar la información del producto.");
        setProduct(null);
      }
    };

    load();
  }, [productId]);

  useEffect(() => {
    reloadReviews();
  }, [reloadReviews]);

  const existingUserReview = isAuthenticated
    ? reviews.find((item) => item.userId === user?.id)
    : null;

  useEffect(() => {
    if (!existingUserReview) {
      return;
    }
    setReviewForm((prev) => {
      if (prev.comentario || submittingReview) {
        return prev;
      }
      return {
        puntuacion: existingUserReview.puntuacion ?? 5,
        comentario: existingUserReview.comentario ?? "",
      };
    });
  }, [existingUserReview, submittingReview]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    if (canManage) {
      alert("Los administradores gestionan los pedidos desde el panel, no desde el carrito.");
      return;
    }
    const available = Number(product.stock ?? product.inventario ?? 0);
    if (Number.isFinite(available) && available <= 0) {
      alert("Este producto no tiene stock disponible por el momento.");
      return;
    }
    const selected = Math.max(1, Math.min(qty, available));
    const added = await addToCart(product, selected);
    if (added) {
      navigate("/carrito");
    }
  };

  const handleReviewFieldChange = (field) => (event) => {
    const value = event.target.value;
    setReviewForm((prev) => ({
      ...prev,
      [field]: field === "puntuacion" ? Number(value) : value,
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setReviewError("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      await createReview(
        productId,
        {
          puntuacion: Number(reviewForm.puntuacion),
          comentario: reviewForm.comentario.trim(),
        },
        authHeader
      );
      setReviewForm({ puntuacion: 5, comentario: "" });
      await reloadReviews();
    } catch (err) {
      console.error("[ProductDetail] handleReviewSubmit", err);
      const message =
        err?.response?.data?.message ??
        "No pudimos guardar tu reseña. Intenta nuevamente.";
      setReviewError(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStartResponse = (reviewId, currentText) => {
    setActiveResponse(reviewId);
    setResponseDrafts((prev) => ({
      ...prev,
      [reviewId]: currentText ?? "",
    }));
    setReviewError("");
  };

  const handleResponseDraftChange = (reviewId, value) => {
    setResponseDrafts((prev) => ({
      ...prev,
      [reviewId]: value,
    }));
  };

  const handleResponseSubmit = async (reviewId) => {
    const text = (responseDrafts[reviewId] ?? "").trim();
    if (!text) {
      setReviewError("La respuesta del administrador no puede estar vacía.");
      return;
    }

    setRespondingReviewId(reviewId);
    setReviewError("");

    try {
      const updated = await respondReview(
        productId,
        reviewId,
        { respuesta: text },
        authHeader
      );
      setReviews((prev) =>
        prev.map((review) =>
          review.reviewId === reviewId ? updated : review
        )
      );
      setActiveResponse(null);
    } catch (err) {
      console.error("[ProductDetail] handleResponseSubmit", err);
      const message =
        err?.response?.data?.message ??
        "No fue posible guardar la respuesta.";
      setReviewError(message);
    } finally {
      setRespondingReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("¿Quieres eliminar esta reseña?")) {
      return;
    }

    setDeletingReviewId(reviewId);
    setReviewError("");

    try {
      await removeReview(productId, reviewId, authHeader);
      setReviews((prev) => prev.filter((review) => review.reviewId !== reviewId));
      if (activeResponse === reviewId) {
        setActiveResponse(null);
      }
    } catch (err) {
      console.error("[ProductDetail] handleDeleteReview", err);
      const message =
        err?.response?.data?.message ??
        "No pudimos eliminar la reseña. Intenta nuevamente.";
      setReviewError(message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }
    try {
      return new Date(value).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (err) {
      console.warn("[ProductDetail] formatDate", err);
      return value;
    }
  };

  const renderAverageStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      if (value >= i) {
        stars.push(<FaStar key={i} />);
      } else if (value >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaStar key={i} className="empty" />);
      }
    }
    return stars;
  };

  const averageRating = reviews.length
    ? reviews.reduce(
        (sum, current) => sum + Number(current?.puntuacion ?? 0),
        0
      ) / reviews.length
    : 0;

  const ratingLabel = reviews.length
    ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reseñas)`
    : "Sin reseñas todavía";

  if (error) {
    return (
      <div className="product-detail-container">
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <p>Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="top-section">
        <div className="image-gallery-single">
          <div className="main-image-single">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          
          <div className="rating">
            <span className="rating-stars">{renderAverageStars(averageRating)}</span>
            <span>{ratingLabel}</span>
          </div>

          <div className="price-section">
            <p className="final-price">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(product.price ?? 0)}</p>
            <p className="installments">Hasta 48 cuotas</p>
          </div>

          <div className="stock-status">
            {Number(product.stock ?? 0) > 0 ? (
              <span>
                Stock disponible: <strong>{product.stock}</strong> unidades
              </span>
            ) : (
              <span className="stock-status-out">Sin existencias</span>
            )}
          </div>
          {Number(product.stock ?? 0) > 0 && (
            <p style={{ marginTop: 6, color: "#6c757d", fontSize: "0.9rem" }}>
              Máximo por compra: <strong>{Number(product.stock)}</strong>
            </p>
          )}
          {canManage && (
            <p className="stock-status-out">
              El carrito está deshabilitado para administradores y superadministradores.
            </p>
          )}

          <div className="shipping-options">
            <div className="option"><FaTruck className="icon" /><span>Envío <strong>GRATIS</strong></span></div>
            <div className="option"><FaStore className="icon" /><span>Recoge en tienda</span></div>
          </div>

          <div className="actions">
            {maxQty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <label>
                  Cantidad
                  <select
                    value={Math.min(qty, maxQty)}
                    onChange={(e) => setQty(Number(e.target.value))}
                    disabled={canManage}
                    style={{ marginLeft: 8 }}
                  >
                    {Array.from({ length: Math.min(maxQty, 20) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={Number(product.stock ?? 0) <= 0 || canManage}
            >
              Agregar al carrito
            </button>
          </div>

          <div className="extra-actions">
            <a href="#"><FaHeart /> Favorito</a>
            <a href="#"><FaBalanceScale /> Comparar</a>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reseñas de clientes</h2>
        {reviewError && <p className="review-feedback error">{reviewError}</p>}

        {isAuthenticated ? (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            {existingUserReview && (
              <p className="review-feedback info">
                Ya publicaste una reseña. Puedes actualizarla y reemplazaremos la anterior.
              </p>
            )}

            <label htmlFor="review-score">Tu puntuación</label>
            <select
              id="review-score"
              value={reviewForm.puntuacion}
              onChange={handleReviewFieldChange("puntuacion")}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} puntos
                </option>
              ))}
            </select>

            <label htmlFor="review-comment">Tu comentario</label>
            <textarea
              id="review-comment"
              value={reviewForm.comentario}
              onChange={handleReviewFieldChange("comentario")}
              placeholder="Cuéntanos tu experiencia con este producto"
              rows={4}
            />

            <button type="submit" disabled={submittingReview}>
              {submittingReview
                ? "Guardando reseña..."
                : existingUserReview
                ? "Actualizar reseña"
                : "Publicar reseña"}
            </button>
          </form>
        ) : (
          <p className="review-feedback info">
            Inicia sesión para dejar un comentario y tu puntuación.
          </p>
        )}

        <div className="reviews-list">
          {reviewsLoading ? (
            <p>Cargando reseñas...</p>
          ) : reviews.length === 0 ? (
            <p>Este producto aún no tiene reseñas.</p>
          ) : (
            reviews.map((review) => {
              const isOwner = user?.id === review.userId;
              return (
                <div
                  key={review.reviewId}
                  className={`review-card${isOwner ? " own-review" : ""}`}
                >
                  <div className="review-header">
                    <strong>
                      {review.userNombre ?? "Usuario"}
                      {isOwner ? " (tú)" : ""}
                    </strong>
                    <span className="review-score">{review.puntuacion} / 5</span>
                    <span className="review-date">{formatDate(review.fecha)}</span>
                  </div>

                  <p className="review-comment">{review.comentario}</p>

                  {review.respuestaAdmin && (
                    <div className="admin-response">
                      <div className="admin-response-header">
                        <strong>
                          {review.respuestaAdminNombre
                            ? `Respuesta de ${review.respuestaAdminNombre}`
                            : "Respuesta del administrador"}
                        </strong>
                        <span className="review-date">
                          {formatDate(review.respuestaFecha)}
                        </span>
                      </div>
                      <p>{review.respuestaAdmin}</p>
                    </div>
                  )}

                  {canManage && (
                    <div className="admin-controls">
                      {activeResponse === review.reviewId ? (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleResponseSubmit(review.reviewId);
                          }}
                        >
                          <textarea
                            value={responseDrafts[review.reviewId] ?? ""}
                            onChange={(event) =>
                              handleResponseDraftChange(
                                review.reviewId,
                                event.target.value
                              )
                            }
                            rows={3}
                            placeholder="Escribe la respuesta del administrador"
                          />
                          <div className="admin-actions">
                            <button
                              type="submit"
                              disabled={respondingReviewId === review.reviewId}
                            >
                              {respondingReviewId === review.reviewId
                                ? "Guardando..."
                                : "Guardar respuesta"}
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              disabled={respondingReviewId === review.reviewId}
                              onClick={() => setActiveResponse(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="admin-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleStartResponse(
                                review.reviewId,
                                review.respuestaAdmin
                              )
                            }
                          >
                            {review.respuestaAdmin
                              ? "Editar respuesta"
                              : "Responder"}
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        className="admin-delete"
                        onClick={() => handleDeleteReview(review.reviewId)}
                        disabled={deletingReviewId === review.reviewId}
                      >
                        {deletingReviewId === review.reviewId
                          ? "Eliminando..."
                          : "Eliminar reseña"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
