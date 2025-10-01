import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeName } from "../constants/categories";
import { getCategories } from "../api/categories";
import "../Css/ProductList.css";
import {
  buildFallbackCategories,
  getCategoryKey,
  loadCategoriesFromCache,
  normalizeCategoryList,
  saveCategoriesToCache,
  splitCategoriesByParent,
  areCategoryListsEqual,
  parseIdentifier,
} from "../utils/categoryUtils";
import { API_BASE, NGROK_SKIP_HEADER } from "../api/axios";

const formatCurrency = (value) => {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(number);
};

const adaptProduct = (product) => {
  if (!product) return product;
  return {
    ...product,
    id: product.productId ?? product.id,
    image: product.imageUrl ?? product.image,
    price: Number(product.price ?? product.precio ?? 0),
    stock: product.stock ?? product.inventario ?? 0,
  };
};

const fallbackCategories = buildFallbackCategories();

const ProductList = ({ products = [], onProductsChange }) => {
  const { isAdmin, isSuperAdmin, authHeader } = useAuth();
  const canManage = isAdmin || isSuperAdmin;
  const [items, setItems] = useState(() =>
    (Array.isArray(products) ? products : []).map(adaptProduct)
  );
  const [categories, setCategories] = useState(() => {
    const cached = loadCategoriesFromCache();
    if (cached.length > 0) {
      return cached;
    }
    return fallbackCategories;
  });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
  const [feedback, setFeedback] = useState("");

  const { parents: parentCategories, subcategoriesByParent } = useMemo(
    () => splitCategoriesByParent(categories),
    [categories]
  );

  useEffect(() => {
    setItems((Array.isArray(products) ? products : []).map(adaptProduct));
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getCategories().catch(() => []);
        if (cancelled) return;
        const normalized = normalizeCategoryList(data);
        if (normalized.length > 0) {
          setCategories((current) =>
            areCategoryListsEqual(current, normalized) ? current : normalized
          );
          saveCategoriesToCache(normalized);
        } else {
          setCategories((current) =>
            current.length === 0 ? fallbackCategories : current
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("No se pudieron cargar categorías", error);
          setCategories((current) =>
            current.length === 0 ? fallbackCategories : current
          );
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const notifyChange = (nextItems) => {
    setItems(nextItems);
    onProductsChange?.(nextItems);
  };

  const startEdit = (product) => {
    const id = product.id;
    setEditingId(id);
    const categoryKey = getCategoryKey(product.category ?? { categoryId: product.categoryId });
    setDraft({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price !== undefined && product.price !== null ? String(product.price) : "",
      stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : "",
      imageUrl: product.imageUrl ?? product.image ?? "",
      categoryId: categoryKey != null ? String(categoryKey) : "",
    });
    setFeedback("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (product) => {
    if (!canManage || !authHeader) {
      setFeedback("No tienes permisos para eliminar productos.");
      return;
    }
    const id = product.productId ?? product.id;
    if (!id) return;

    const confirmed = window.confirm(`¿Eliminar "${product.name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          ...NGROK_SKIP_HEADER,
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        throw new Error("No fue posible eliminar el producto");
      }

      const next = items.filter((item) => (item.productId ?? item.id) !== id);
      notifyChange(next);
      setFeedback("Producto eliminado");
    } catch (error) {
      console.error(error);
      setFeedback(error.message || "Error al eliminar el producto");
    }
  };

  const resolveCategoryId = (value) => {
    if (!value) return null;
    const parsedDirect = parseIdentifier(value);
    const numericDirect = Number(parsedDirect);
    if (!Number.isNaN(numericDirect)) {
      return numericDirect;
    }

    const normalizedTarget = normalizeName(String(value));
    const match = categories.find((category) => {
      const key = getCategoryKey(category);
      if (key != null && String(key) === String(value)) {
        return true;
      }
      return normalizeName(category.name ?? "") === normalizedTarget;
    });
    if (!match) return null;

    const fallbackKey = parseIdentifier(getCategoryKey(match));
    if (fallbackKey == null) {
      return null;
    }

    const numericFallback = Number(fallbackKey);
    return Number.isNaN(numericFallback) ? null : numericFallback;
  };

  const handleSave = async (product) => {
    if (!canManage || !authHeader) {
      setFeedback("No tienes permisos para modificar productos.");
      return;
    }
    const id = product.productId ?? product.id;
    if (!id) return;

    const resolvedCategoryId = resolveCategoryId(draft.categoryId);

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      stock: Number(draft.stock),
      imageUrl: draft.imageUrl.trim(),
      categoryId: resolvedCategoryId,
    };

    if (payload.categoryId == null) {
      setFeedback("Selecciona una categoría válida.");
      return;
    }

    if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      setFeedback("Precio y stock deben ser números válidos.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_SKIP_HEADER,
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const saved = await response.json().catch(() => null);

      if (!response.ok || !saved) {
        const message = saved?.message || "No fue posible actualizar el producto";
        throw new Error(message);
      }

      const adapted = adaptProduct(saved);
      notifyChange(
        items.map((item) =>
          (item.productId ?? item.id) === id ? adapted : item
        )
      );
      setFeedback("Producto actualizado");
      cancelEdit();
    } catch (error) {
      console.error(error);
      setFeedback(error.message || "Error al actualizar el producto");
    }
  };

  const renderAdminControls = (product) => {
    if (!canManage) {
      return null;
    }

    const id = product.productId ?? product.id;
    const isEditing = editingId === id;

    if (isEditing) {
      return (
        <div className="admin-controls">
          {parentCategories.length === 0 && (
            <p className="admin-warning">No hay categorías registradas. Crea categorías antes de editar.</p>
          )}
          <div className="admin-edit-form">
            <input
              name="name"
              value={draft.name}
              onChange={handleDraftChange}
              placeholder="Nombre"
            />
            <textarea
              name="description"
              value={draft.description}
              onChange={handleDraftChange}
              placeholder="Descripción"
            />
            <input
              name="price"
              type="number"
              value={draft.price}
              onChange={handleDraftChange}
              placeholder="Precio"
            />
            <input
              name="stock"
              type="number"
              value={draft.stock}
              onChange={handleDraftChange}
              placeholder="Stock"
            />
            <input
              name="imageUrl"
              value={draft.imageUrl}
              onChange={handleDraftChange}
              placeholder="URL de la imagen"
            />
            <select
              name="categoryId"
              value={draft.categoryId}
              onChange={handleDraftChange}
              disabled={parentCategories.length === 0}
            >
              <option value="">
                {parentCategories.length === 0 ? "Cargando categorías..." : "Selecciona una categoría"}
              </option>
              {parentCategories.map((category) => {
                const parentId = getCategoryKey(category);
                const parentValue = parentId != null ? String(parentId) : normalizeName(category.name ?? "");
                const children = parentId != null ? subcategoriesByParent.get(String(parentId)) ?? [] : [];
                return (
                  <optgroup key={`group-${parentValue}`} label={category.name ?? "Categoría"}>
                    <option value={parentValue}>{category.name}</option>
                    {children.map((child) => {
                      const childId = getCategoryKey(child);
                      const childValue = childId != null ? String(childId) : normalizeName(child.name ?? "");
                      return (
                        <option key={`${parentValue}-${childValue}`} value={childValue}>
                          {`${category.name} / ${child.name}`}
                        </option>
                      );
                    })}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div className="admin-buttons">
            <button onClick={() => handleSave(product)} className="btn-primary">Guardar</button>
            <button onClick={cancelEdit} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-buttons">
        <button onClick={() => startEdit(product)} className="btn-secondary">
          Modificar
        </button>
        <button onClick={() => handleDelete(product)} className="btn-danger">
          Borrar
        </button>
      </div>
    );
  };

  const displayedItems = useMemo(() => items, [items]);

  return (
    <div className="product-list">
      {feedback && canManage && (
        <div className="admin-feedback">{feedback}</div>
      )}

      {displayedItems.length > 0 ? (
        displayedItems.map((product) => {
          const id = product.productId ?? product.id;
          const image = product.image ?? product.imageUrl;
          const categoryLabel = product.category?.name || product.categoryName;

          return (
            <div key={id} className="product-card">
              {image && (
                <img
                  src={image}
                  alt={product.name}
                  className="product-image"
                />
              )}

              <h3>{product.name}</h3>
              {product.description && <p>{product.description}</p>}
              <p className="product-price">{formatCurrency(product.price)}</p>
              {categoryLabel && (
                <p className="product-category">{categoryLabel}</p>
              )}

              <Link to={`/producto/${id}`} className="buy-button">
                Ver Detalles
              </Link>

              {renderAdminControls(product)}
            </div>
          );
        })
      ) : (
        <p>No hay productos en esta categoría.</p>
      )}
    </div>
  );
};

export default ProductList;
