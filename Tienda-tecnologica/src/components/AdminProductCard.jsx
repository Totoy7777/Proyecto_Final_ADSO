import React from "react";

const fallbackImage =
  "https://static.thenounproject.com/png/4987873-200.png";

const formatCurrency = (value = 0) => {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) {
    return "$0";
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

const AdminProductCard = ({ product, onEdit, onDelete }) => {
  if (!product) {
    return null;
  }

  const image = product.imageUrl || product.image || fallbackImage;

  return (
    <article
      style={{
        border: "1px solid #e9ecef",
        borderRadius: "12px",
        overflow: "hidden",
        width: "100%",
        maxWidth: "320px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingTop: "60%",
          position: "relative",
          backgroundColor: "#f1f3f5",
        }}
      >
        <img
          src={image}
          alt={product.name ?? "Producto"}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#212529" }}>{product.name}</h3>
          <p style={{ margin: "0.25rem 0", color: "#6c757d", fontSize: "0.9rem" }}>{product.description}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontWeight: 600, color: "#198754" }}>{formatCurrency(product.price)}</span>
          <span style={{ color: "#495057", fontSize: "0.9rem" }}>Stock: {product.stock ?? 0}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.85rem" }}>
          <span>Categoría principal: {product.category?.parent?.name ?? product.parentCategory?.name ?? product.parentName ?? "-"}</span>
          <span>Subcategoría: {product.category?.name ?? product.categoryName ?? "-"}</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          borderTop: "1px solid #e9ecef",
          backgroundColor: "#f8f9fa",
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          style={{
            border: "none",
            backgroundColor: "#0d6efd",
            color: "#fff",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          style={{
            border: "none",
            backgroundColor: "#b02a37",
            color: "#fff",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};

export default AdminProductCard;
