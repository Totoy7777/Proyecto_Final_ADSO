import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeName } from "../constants/categories";
import { getCategories, createCategory } from "../api/categories";
import { API_BASE, NGROK_SKIP_HEADER } from "../api/axios";
import {
  getCategoryKey,
  getParentKey,
  normalizeCategoryList,
  saveCategoriesToCache,
  splitCategoriesByParent,
  loadCategoriesFromCache,
  parseIdentifier,
} from "../utils/categoryUtils";
import AdminProductCard from "../components/AdminProductCard";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  parentCategoryId: "",
  categoryId: "",
};

const sanitizePriceValue = (value) => {
  if (value == null) return "";
  const asString = String(value).replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  if (asString === "") return "";

  const parts = asString.split(".");
  const integer = parts[0]?.replace(/^0+(?=\d)/, "") ?? "";
  const decimalsRaw = parts.slice(1).join("");
  const decimals = decimalsRaw ? decimalsRaw.slice(0, 2) : "";

  if (asString.endsWith(".")) {
    return `${integer || "0"}.`;
  }

  if (decimals.length > 0) {
    return `${integer || "0"}.${decimals}`;
  }

  return integer || "0";
};

const formatPriceDisplay = (value) => {
  if (!value) return "";
  const cleaned = sanitizePriceValue(value);
  if (!cleaned || cleaned.endsWith(".")) return cleaned.replace(/^0+(?=\d)/, "");
  const numeric = Number(cleaned);
  if (Number.isNaN(numeric)) return "";

  const hasDecimals = cleaned.includes(".");
  return `$${numeric.toLocaleString("es-CO", {
    minimumFractionDigits: hasDecimals ? Math.min(2, cleaned.split(".")[1]?.length ?? 0) : 0,
    maximumFractionDigits: 2,
  })}`;
};

const sanitizeStockValue = (value) => {
  if (value == null) return "";
  const digitsOnly = String(value).replace(/[^0-9]/g, "");
  return digitsOnly.replace(/^0+(?=\d)/, "") || (digitsOnly ? "0" : "");
};


const AdminProducts = () => {
  const { isAuthenticated, isAdmin, authHeader } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(() => loadCategoriesFromCache());
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPriceFocused, setIsPriceFocused] = useState(false);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategorySubmitting, setSubCategorySubmitting] = useState(false);
  const [subCategoryFeedback, setSubCategoryFeedback] = useState({ error: "", success: "" });
  const [newParentCategoryName, setNewParentCategoryName] = useState("");
  const [parentCategorySubmitting, setParentCategorySubmitting] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState({ error: "", success: "" });

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...NGROK_SKIP_HEADER,
      Authorization: authHeader ?? "",
    }),
    [authHeader]
  );

  const isLoadingCategories = useMemo(() => categories.length === 0, [categories]);

  const { parents: parentCategories, subcategoriesByParent } = useMemo(
    () => splitCategoriesByParent(categories),
    [categories]
  );

  const selectedParentKey = form.parentCategoryId ? String(form.parentCategoryId) : "";
  const availableSubcategories = selectedParentKey
    ? subcategoriesByParent.get(selectedParentKey) ?? []
    : [];
  const requiresSubcategory = Boolean(selectedParentKey && availableSubcategories.length > 0);

  const isFormValid = useMemo(() => {
    if (!form.name.trim()) return false;

    const sanitizedPrice = sanitizePriceValue(form.price);
    const priceNumeric = Number(sanitizedPrice);
    if (!sanitizedPrice || Number.isNaN(priceNumeric) || priceNumeric <= 0) {
      return false;
    }

    const sanitizedStock = sanitizeStockValue(form.stock);
    const stockNumeric = Number(sanitizedStock);
    if (sanitizedStock === "" || Number.isNaN(stockNumeric) || stockNumeric < 0) {
      return false;
    }

    if (!form.parentCategoryId) {
      return false;
    }

    if (requiresSubcategory && !form.categoryId) {
      return false;
    }

    if (!requiresSubcategory && !form.categoryId && !form.parentCategoryId) {
      return false;
    }

    if (isLoadingCategories) {
      return false;
    }

    return true;
  }, [form, requiresSubcategory, isLoadingCategories]);

  const fetchCategories = useCallback(async () => {
    console.log("[AdminProducts] fetchCategories:start");
    const categoriesInitial = await getCategories().catch((error) => {
      console.error("[AdminProducts] fetchCategories:getCategories:error", error);
      return [];
    });
    console.log("[AdminProducts] fetchCategories:getCategories:response", categoriesInitial);
    const normalizedCategories = normalizeCategoryList(Array.isArray(categoriesInitial) ? categoriesInitial : []);
    console.log("[AdminProducts] fetchCategories:normalized", normalizedCategories);
    return normalizedCategories;
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const categoriesResult = await fetchCategories();
      console.log("[AdminProducts] loadData:categoriesResult", categoriesResult);
      setCategories(categoriesResult);
      saveCategoriesToCache(categoriesResult);

      let productsData = [];
      let productsError = null;
      const productsRes = await fetch(`${API_BASE}/products`, {
        headers: { ...NGROK_SKIP_HEADER },
      }).catch(() => null);
      if (productsRes) {
        if (productsRes.ok) {
          productsData = await productsRes.json().catch(() => []);
        } else {
          productsError = "No se pudieron cargar los productos";
        }
      }

      if (productsError) {
        setError(productsError);
      }

      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando datos iniciales");
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const resolveCategoryId = (value) => {
    if (!value) return null;
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    const normalizedValue = normalizeName(String(value));
    const match = categories.find((category) => {
      const key = getCategoryKey(category);
      if (key != null && String(key) === String(value)) {
        return true;
      }
      return normalizeName(category.name ?? "") === normalizedValue;
    });

    if (!match) return null;

    const fallbackId = getCategoryKey(match);
    if (fallbackId == null) {
      return null;
    }

    const parsed = parseIdentifier(fallbackId);
    if (parsed == null) {
      return null;
    }

    const numericFallback = Number(parsed);
    return Number.isNaN(numericFallback) ? null : numericFallback;
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    loadData();
  }, [isAuthenticated, isAdmin, loadData]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "price") {
      const sanitized = sanitizePriceValue(value);
      setForm((prev) => ({ ...prev, price: sanitized }));
      return;
    }

    if (name === "stock") {
      const sanitized = sanitizeStockValue(value);
      setForm((prev) => ({ ...prev, stock: sanitized }));
      return;
    }

    if (name === "parentCategoryId") {
      if (!value) {
        setForm((prev) => ({ ...prev, parentCategoryId: "", categoryId: "" }));
        setSubCategoryName("");
        setSubCategoryFeedback({ error: "", success: "" });
        return;
      }

      setForm((prev) => ({
        ...prev,
        parentCategoryId: value,
        categoryId: "",
      }));
      setSubCategoryName("");
      setSubCategoryFeedback({ error: "", success: "" });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceFocus = () => {
    setIsPriceFocused(true);
  };

  const handlePriceBlur = () => {
    setIsPriceFocused(false);
    setForm((prev) => {
      const current = prev.price;
      if (!current) {
        return { ...prev, price: "" };
      }

      const sanitized = sanitizePriceValue(current);
      if (sanitized.endsWith(".")) {
        return { ...prev, price: sanitized.slice(0, -1) };
      }

      return { ...prev, price: sanitized };
    });
  };

  const handleCreateSubcategory = async () => {
    setSubCategoryFeedback({ error: "", success: "" });
    setCategoryFeedback({ error: "", success: "" });

    if (!form.parentCategoryId) {
      setSubCategoryFeedback({
        error: "Selecciona una categoría principal antes de agregar una subcategoría.",
        success: "",
      });
      return;
    }

    const trimmedName = subCategoryName.trim();
    if (!trimmedName) {
      setSubCategoryFeedback({
        error: "Ingresa un nombre para la subcategoría.",
        success: "",
      });
      return;
    }

    const parentId = resolveCategoryId(form.parentCategoryId);
    if (parentId == null) {
      setSubCategoryFeedback({
        error: "Selecciona una categoría principal válida.",
        success: "",
      });
      return;
    }

    const duplicate = availableSubcategories.some(
      (category) => normalizeName(category.name) === normalizeName(trimmedName)
    );
    if (duplicate) {
      setSubCategoryFeedback({
        error: "Ya existe una subcategoría con ese nombre para la categoría seleccionada.",
        success: "",
      });
      return;
    }

    try {
      setSubCategorySubmitting(true);
      console.log("[AdminProducts] handleCreateSubcategory:request", {
        name: trimmedName,
        parentId,
      });
      const created = await createCategory({ name: trimmedName, parentId })
        .then((response) => {
          console.log("[AdminProducts] handleCreateSubcategory:success", response);
          return response;
        })
        .catch((error) => {
          console.error("[AdminProducts] handleCreateSubcategory:error", error);
          throw error;
        });
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      saveCategoriesToCache(updatedCategories);

      const createdId = getCategoryKey(created);
      setForm((prev) => ({
        ...prev,
        categoryId: createdId != null ? String(createdId) : prev.categoryId,
      }));

      setSubCategoryName("");
      setSubCategoryFeedback({ error: "", success: "Subcategoría creada correctamente." });
      setCategoryFeedback({ error: "", success: "" });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "No se pudo crear la subcategoría.";
      setSubCategoryFeedback({ error: message, success: "" });
    } finally {
      setSubCategorySubmitting(false);
    }
  };

  const handleRenameSubcategory = async (subcategory) => {
    if (!authHeader) {
      setSubCategoryFeedback({
        error: "No hay credenciales válidas para operar como administrador.",
        success: "",
      });
      return;
    }

    const categoryId = getCategoryKey(subcategory);
    if (categoryId == null) {
      setSubCategoryFeedback({ error: "No se pudo identificar la subcategoría.", success: "" });
      return;
    }

    const currentName = subcategory?.name ?? "";
    const input = window.prompt("Nuevo nombre para la subcategoría:", currentName);
    if (input == null) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      setSubCategoryFeedback({ error: "El nombre no puede estar vacío.", success: "" });
      return;
    }

    if (normalizeName(trimmed) === normalizeName(currentName)) {
      setSubCategoryFeedback({ error: "No se detectaron cambios en el nombre.", success: "" });
      return;
    }

    const parentKey = getParentKey(subcategory);
    const siblings = parentKey != null ? subcategoriesByParent.get(String(parentKey)) ?? [] : [];
    const duplicate = siblings.some((cat) => {
      if (getCategoryKey(cat) === categoryId) return false;
      return normalizeName(cat.name ?? "") === normalizeName(trimmed);
    });
    if (duplicate) {
      setSubCategoryFeedback({
        error: "Ya existe una subcategoría con ese nombre en la categoría seleccionada.",
        success: "",
      });
      return;
    }

    try {
      setSubCategorySubmitting(true);
      setSubCategoryFeedback({ error: "", success: "" });

      const payload = { name: trimmed };
      if (parentKey != null) {
        payload.parent = { categoryId: parentKey };
        payload.parentId = parentKey;
        payload.parentCategoryId = parentKey;
      }

      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: "PUT",
        headers: { ...authHeaders },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const message = data?.message || "No fue posible renombrar la subcategoría.";
        throw new Error(message);
      }

      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      saveCategoriesToCache(updatedCategories);

      if (String(form.categoryId) === String(categoryId)) {
        setForm((prev) => ({ ...prev, categoryId: String(categoryId) }));
      }

      setSubCategoryFeedback({
        error: "",
        success: `Subcategoría actualizada a "${trimmed}".`,
      });
      setCategoryFeedback({ error: "", success: "" });
    } catch (error) {
      setSubCategoryFeedback({
        error: error?.message || "No fue posible renombrar la subcategoría.",
        success: "",
      });
    } finally {
      setSubCategorySubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory) => {
    if (!authHeader) {
      setSubCategoryFeedback({
        error: "No hay credenciales válidas para operar como administrador.",
        success: "",
      });
      return;
    }

    const categoryId = getCategoryKey(subcategory);
    if (categoryId == null) {
      setSubCategoryFeedback({ error: "No se pudo identificar la subcategoría.", success: "" });
      return;
    }

    const confirmation = window.confirm(
      `Vas a eliminar la subcategoría "${subcategory?.name ?? ""}". ` +
        "Esta acción eliminará los productos asociados a ella. ¿Deseas continuar?"
    );
    if (!confirmation) {
      return;
    }

    try {
      setSubCategorySubmitting(true);
      setSubCategoryFeedback({ error: "", success: "" });

      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          ...NGROK_SKIP_HEADER,
          Authorization: authHeader ?? "",
        },
      });

      if (!response.ok) {
        let message = "No fue posible eliminar la subcategoría.";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          /* noop */
        }
        throw new Error(message);
      }

      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      saveCategoriesToCache(updatedCategories);

      if (String(form.categoryId) === String(categoryId)) {
        setForm((prev) => ({ ...prev, categoryId: "" }));
      }

      setSubCategoryFeedback({
        error: "",
        success: "Subcategoría eliminada correctamente.",
      });
      setCategoryFeedback({ error: "", success: "" });
    } catch (error) {
      setSubCategoryFeedback({
        error: error?.message || "No fue posible eliminar la subcategoría.",
        success: "",
      });
    } finally {
      setSubCategorySubmitting(false);
    }
  };

  const handleCreateParentCategory = async () => {
    const trimmedName = newParentCategoryName.trim();
    if (!trimmedName) {
      setCategoryFeedback({ error: "El nombre de la categoría es obligatorio.", success: "" });
      return;
    }

    const duplicate = parentCategories.some(
      (category) => normalizeName(category.name) === normalizeName(trimmedName)
    );
    if (duplicate) {
      setCategoryFeedback({ error: "Ya existe una categoría con ese nombre.", success: "" });
      return;
    }

    try {
      setParentCategorySubmitting(true);
      setCategoryFeedback({ error: "", success: "" });

      await createCategory({ name: trimmedName, parentId: null });
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      saveCategoriesToCache(updatedCategories);
      setNewParentCategoryName("");
      setCategoryFeedback({ error: "", success: "Categoría creada correctamente." });
    } catch (error) {
      setCategoryFeedback({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "No fue posible crear la categoría.",
        success: "",
      });
    } finally {
      setParentCategorySubmitting(false);
    }
  };

  const handleRenameParentCategory = async (category) => {
    if (!authHeader) {
      setCategoryFeedback({ error: "No hay credenciales válidas para operar como administrador.", success: "" });
      return;
    }

    const categoryId = getCategoryKey(category);
    if (categoryId == null) {
      setCategoryFeedback({ error: "No se pudo identificar la categoría.", success: "" });
      return;
    }

    const currentName = category?.name ?? "";
    const input = window.prompt("Nuevo nombre para la categoría:", currentName);
    if (input == null) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      setCategoryFeedback({ error: "El nombre no puede estar vacío.", success: "" });
      return;
    }

    if (normalizeName(trimmed) === normalizeName(currentName)) {
      setCategoryFeedback({ error: "No se detectaron cambios en el nombre.", success: "" });
      return;
    }

    const duplicate = parentCategories.some((cat) => {
      if (getCategoryKey(cat) === categoryId) return false;
      return normalizeName(cat.name ?? "") === normalizeName(trimmed);
    });
    if (duplicate) {
      setCategoryFeedback({ error: "Ya existe una categoría con ese nombre.", success: "" });
      return;
    }

    try {
      setParentCategorySubmitting(true);
      setCategoryFeedback({ error: "", success: "" });
      setSubCategoryFeedback({ error: "", success: "" });

      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: "PUT",
        headers: { ...authHeaders },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const message = data?.message || "No fue posible renombrar la categoría.";
        throw new Error(message);
      }

      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      saveCategoriesToCache(updatedCategories);

      if (String(form.parentCategoryId) === String(categoryId)) {
        setForm((prev) => ({ ...prev, parentCategoryId: String(categoryId) }));
      }

      setCategoryFeedback({ error: "", success: `Categoría actualizada a "${trimmed}".` });
    } catch (error) {
      setCategoryFeedback({
        error: error?.message || "No fue posible renombrar la categoría.",
        success: "",
      });
    } finally {
      setParentCategorySubmitting(false);
    }
  };

  const handleDeleteParentCategory = async (category) => {
    if (!authHeader) {
      setCategoryFeedback({ error: "No hay credenciales válidas para operar como administrador.", success: "" });
      return;
    }

    const categoryId = getCategoryKey(category);
    if (categoryId == null) {
      setCategoryFeedback({ error: "No se pudo identificar la categoría.", success: "" });
      return;
    }

    const confirmation = window.confirm(
      `Vas a eliminar la categoría "${category?.name ?? ""}" y sus subcategorías.` +
        " Todos los productos asociados se verán afectados. ¿Deseas continuar?"
    );
    if (!confirmation) {
      return;
    }

    try {
      setParentCategorySubmitting(true);
      setCategoryFeedback({ error: "", success: "" });
      setSubCategoryFeedback({ error: "", success: "" });

      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          ...NGROK_SKIP_HEADER,
          Authorization: authHeader ?? "",
        },
      });

      if (!response.ok) {
        let message = "No fue posible eliminar la categoría.";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          /* noop */
        }
        throw new Error(message);
      }

      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      saveCategoriesToCache(updatedCategories);

      if (String(form.parentCategoryId) === String(categoryId)) {
        resetForm();
      }

      setCategoryFeedback({ error: "", success: "Categoría eliminada correctamente." });
    } catch (error) {
      setCategoryFeedback({
        error: error?.message || "No fue posible eliminar la categoría.",
        success: "",
      });
    } finally {
      setParentCategorySubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setIsPriceFocused(false);
    setSubCategoryName("");
    setSubCategoryFeedback({ error: "", success: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!authHeader) {
      setError("No hay credenciales válidas para operar como administrador.");
      return;
    }

    const name = form.name.trim();
    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }

    const sanitizedPrice = sanitizePriceValue(form.price);
    const priceNumber = Number(sanitizedPrice);
    if (!sanitizedPrice || Number.isNaN(priceNumber) || priceNumber <= 0) {
      setError("El precio debe ser un número mayor a cero.");
      return;
    }

    const sanitizedStock = sanitizeStockValue(form.stock);
    const stockNumber = Number(sanitizedStock);
    if (sanitizedStock === "" || Number.isNaN(stockNumber) || stockNumber < 0) {
      setError("El stock debe ser un número igual o mayor a cero.");
      return;
    }

    if (!Number.isInteger(stockNumber)) {
      setError("El stock debe ser un número entero.");
      return;
    }

    if (!form.parentCategoryId) {
      setError("Selecciona la categoría principal.");
      return;
    }

    if (requiresSubcategory && !form.categoryId) {
      setError("Selecciona una subcategoría para la categoría elegida.");
      return;
    }

    const finalCategoryValue = form.categoryId || form.parentCategoryId;
    const resolvedCategoryId = resolveCategoryId(finalCategoryValue);
    const resolvedParentCategoryId = resolveCategoryId(form.parentCategoryId);

    if (resolvedCategoryId == null) {
      setError("Selecciona una categoría válida.");
      return;
    }

    if (resolvedParentCategoryId == null) {
      setError("Selecciona una categoría principal válida.");
      return;
    }

    const payload = {
      name,
      description: form.description?.trim() || "",
      price: priceNumber,
      stock: stockNumber,
      imageUrl: form.imageUrl?.trim() || "",
      categoryId: resolvedCategoryId,
      parentCategoryId: resolvedParentCategoryId,
    };

    if (payload.categoryId == null) {
      setError("Selecciona una categoría válida.");
      return;
    }

    const endpoint = editingId
      ? `${API_BASE}/admin/products/${editingId}`
      : `${API_BASE}/admin/products`;
    const method = editingId ? "PUT" : "POST";

    try {
      setSubmitting(true);
      const response = await fetch(endpoint, {
        method,
        headers: { ...authHeaders },
        body: JSON.stringify(payload),
      });

      const saved = await response.json().catch(() => null);

      if (!response.ok || !saved) {
        const message = saved?.message || "No fue posible guardar el producto";
        throw new Error(message);
      }

      setSuccess(editingId ? "Producto actualizado" : "Producto creado");
      resetForm();

      setProducts((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (editingId) {
          return list.map((item) =>
            item.productId === editingId ? saved : item
          );
        }
        return [saved, ...list];
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.productId);
    const categoryKey = getCategoryKey(product.category);
    const parentKey = getParentKey(product.category);
    const parentSelection = parentKey != null ? parentKey : categoryKey;
    const parentValue = parentSelection != null ? String(parentSelection) : "";
    const categoryValue = categoryKey != null ? String(categoryKey) : "";
    const children = parentValue ? subcategoriesByParent.get(parentValue) ?? [] : [];
    const resolvedCategoryValue = children.length === 0 ? "" : categoryValue;
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price:
        product.price !== undefined && product.price !== null
          ? sanitizePriceValue(product.price)
          : "",
      stock:
        product.stock !== undefined && product.stock !== null
          ? sanitizeStockValue(product.stock)
          : "",
      imageUrl: product.imageUrl ?? "",
      parentCategoryId: parentValue,
      categoryId: resolvedCategoryValue,
    });
    setSubCategoryName("");
    setSubCategoryFeedback({ error: "", success: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    if (!authHeader) {
      setError("No hay credenciales válidas para operar como administrador.");
      return;
    }

    const confirmDelete = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          ...NGROK_SKIP_HEADER,
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        throw new Error("No fue posible eliminar el producto");
      }

      setSuccess("Producto eliminado");
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
      if (editingId === productId) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al eliminar el producto");
    }
  };

  return (
    <section style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Gestión de productos</h1>

      {error && (
        <div style={{ marginBottom: "1rem", color: "#b02a37" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: "1rem", color: "#0a7c28" }}>
          {success}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          justifyContent: products.length > 0 ? "flex-start" : "center",
        }}
      >
        {products.length === 0 ? (
          <span style={{ color: "#6c757d" }}>No hay productos registrados todavía.</span>
        ) : (
          products.map((product) => {
            const id = product.productId ?? product.id;
            return (
              <AdminProductCard
                key={`card-${id}`}
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product.productId ?? product.id)}
              />
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          marginBottom: "2rem",
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Precio</label>
          <input
            name="price"
            value={isPriceFocused ? form.price : formatPriceDisplay(form.price)}
            onChange={handleChange}
            onFocus={handlePriceFocus}
            onBlur={handlePriceBlur}
            type="text"
            inputMode="decimal"
            required
            placeholder="$0"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Stock</label>
          <input name="stock" value={form.stock} onChange={handleChange} type="number" min="0" required />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>URL de la imagen</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Categoría principal</label>
          <select
            name="parentCategoryId"
            value={form.parentCategoryId}
            onChange={handleChange}
            required
          >
            <option value="">
              {isLoadingCategories ? "Cargando categorías..." : "Selecciona una categoría principal"}
            </option>
            {parentCategories.map((category) => {
              const key = getCategoryKey(category);
              const optionValue = key != null
                ? String(key)
                : normalizeName(category.name ?? "");
              return (
                <option key={key ?? category.name} value={optionValue}>
                  {category.name}
                </option>
              );
            })}
          </select>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "1rem",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <span style={{ fontWeight: 600 }}>Gestionar categorías principales</span>
          {categoryFeedback.error && (
            <span style={{ color: "#b02a37" }}>{categoryFeedback.error}</span>
          )}
          {categoryFeedback.success && (
            <span style={{ color: "#0a7c28" }}>{categoryFeedback.success}</span>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={newParentCategoryName}
              onChange={(event) => setNewParentCategoryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCreateParentCategory();
                }
              }}
              placeholder="Nombre de la nueva categoría"
              style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #ced4da" }}
              disabled={parentCategorySubmitting}
            />
            <button
              type="button"
              onClick={handleCreateParentCategory}
              disabled={parentCategorySubmitting}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#198754",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {parentCategorySubmitting ? "Guardando..." : "Agregar categoría"}
            </button>
          </div>
          {parentCategories.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {parentCategories.map((category) => {
                const key = getCategoryKey(category) ?? normalizeName(category.name ?? "");
                return (
                  <li
                    key={`parent-${key}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.35rem 0",
                    }}
                  >
                    <span>{category.name}</span>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => handleRenameParentCategory(category)}
                        disabled={parentCategorySubmitting}
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                          color: "#0d6efd",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Renombrar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteParentCategory(category)}
                        disabled={parentCategorySubmitting}
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                          color: "#b02a37",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <span style={{ color: "#6c757d" }}>
              No hay categorías registradas todavía.
            </span>
          )}
        </div>
        {form.parentCategoryId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label>Subcategoría</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required={requiresSubcategory}
            >
              <option value="">
                {availableSubcategories.length === 0
                  ? "Esta categoría no tiene subcategorías"
                  : "Selecciona una subcategoría"}
              </option>
              {availableSubcategories.length > 0 && (
                <option value={form.parentCategoryId}>Usar categoría principal</option>
              )}
              {availableSubcategories.map((category) => {
                const key = getCategoryKey(category);
                const optionValue = key != null
                  ? String(key)
                  : normalizeName(category.name ?? "");
                return (
                  <option key={`${key ?? category.name}-sub`} value={optionValue}>
                    {category.name}
                  </option>
                );
              })}
            </select>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontWeight: 500 }}>Agregar subcategoría</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value={subCategoryName}
                  onChange={(event) => setSubCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleCreateSubcategory();
                    }
                  }}
                  placeholder="Nombre de la subcategoría"
                  style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #ced4da" }}
                />
                <button
                  type="button"
                  onClick={handleCreateSubcategory}
                  disabled={subCategorySubmitting}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#198754",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {subCategorySubmitting ? "Agregando..." : "Agregar"}
                </button>
              </div>
              {subCategoryFeedback.error && (
                <span style={{ color: "#b02a37" }}>{subCategoryFeedback.error}</span>
              )}
              {subCategoryFeedback.success && (
                <span style={{ color: "#0a7c28" }}>{subCategoryFeedback.success}</span>
              )}
              <div style={{ marginTop: "0.25rem" }}>
                <strong>Subcategorías registradas:</strong>
                {availableSubcategories.length > 0 ? (
                  <ul style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
                    {availableSubcategories.map((category) => {
                      const key = getCategoryKey(category);
                      return (
                        <li
                          key={`${key ?? category.name}-list`}
                          style={{
                            marginBottom: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span>{category.name}</span>
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => handleRenameSubcategory(category)}
                              disabled={subCategorySubmitting}
                              style={{
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#0d6efd",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              Renombrar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(category)}
                              disabled={subCategorySubmitting}
                              style={{
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#b02a37",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div style={{ color: "#6c757d", marginTop: "0.25rem" }}>
                    Esta categoría no tiene subcategorías.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#0d6efd",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
            disabled={submitting || !isFormValid}
          >
            {submitting ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#6c757d",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "0.75rem" }}>Nombre</th>
              <th style={{ padding: "0.75rem" }}>Precio</th>
              <th style={{ padding: "0.75rem" }}>Stock</th>
              <th style={{ padding: "0.75rem" }}>Categoría</th>
              <th style={{ padding: "0.75rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "1rem" }}>
                  Cargando productos...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "1rem" }}>
                  No hay productos registrados.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.productId} style={{ borderBottom: "1px solid #f1f3f5" }}>
                  <td style={{ padding: "0.75rem" }}>{product.name}</td>
                  <td style={{ padding: "0.75rem" }}>${Number(product.price).toLocaleString()}</td>
                  <td style={{ padding: "0.75rem" }}>{product.stock}</td>
                  <td style={{ padding: "0.75rem" }}>{product.category?.name ?? "Sin categoría"}</td>
                  <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #0d6efd",
                        backgroundColor: "transparent",
                        color: "#0d6efd",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.productId)}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #d9534f",
                        backgroundColor: "transparent",
                        color: "#d9534f",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminProducts;
