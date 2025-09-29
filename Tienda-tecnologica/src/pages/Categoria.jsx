import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductList from "../components/ProductList";
import "../Css/ProductList.css";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import { findBySlug, normalizeName } from "../constants/categories";
import {
  buildFallbackCategories,
  getCategoryKey,
  loadCategoriesFromCache,
  normalizeCategoryList,
  saveCategoriesToCache,
  areCategoryListsEqual,
  getCategorySlug,
} from "../utils/categoryUtils";

const Categoria = () => {
  const { categoria, subcategoria } = useParams();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryLabel, setCategoryLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const cached = loadCategoriesFromCache();
        let categoriesSource = cached.length > 0 ? cached : buildFallbackCategories();

        const data = await getCategories().catch(() => []);
        if (cancelled) return;
        const normalized = normalizeCategoryList(data);
        if (normalized.length > 0) {
          if (!areCategoryListsEqual(categoriesSource, normalized)) {
            categoriesSource = normalized;
            saveCategoriesToCache(normalized);
          } else {
            categoriesSource = normalized;
          }
        }

        const parentSlug = categoria;
        const parentCategoryRow =
          findBySlug(categoriesSource, parentSlug) ||
          categoriesSource.find(
            (cat) => getCategorySlug(cat) === parentSlug && (cat.parentId == null || cat.parentId === undefined)
          );

        const parentCategoryId = getCategoryKey(parentCategoryRow);

        const normalizedParentLabel = parentCategoryRow?.name ?? categoria ?? "Categoría";
        let subcategoryRow = null;

        if (subcategoria && parentCategoryId != null) {
          subcategoryRow = categoriesSource.find(
            (cat) => getCategorySlug(cat) === subcategoria && String(cat.parentId ?? "") === String(parentCategoryId)
          );
        }

        if (!parentCategoryRow || parentCategoryId == null) {
          setCategoryLabel(normalizedParentLabel);
        } else if (subcategoryRow) {
          setCategoryLabel(`${parentCategoryRow.name || categoria} - ${subcategoryRow.name}`);
        } else {
          setCategoryLabel(parentCategoryRow.name || categoria);
        }

        const allProducts = await getProducts().catch(() => []);
        if (cancelled) return;

        const childIds = parentCategoryId != null
          ? categoriesSource
              .filter((cat) => String(cat.parentId ?? "") === String(parentCategoryId))
              .map((cat) => String(getCategoryKey(cat)))
          : [];

        const activeSubcategoryId = subcategoryRow ? String(getCategoryKey(subcategoryRow)) : null;

        const filteredProducts = (Array.isArray(allProducts) ? allProducts : []).filter((product) => {
          const categoryId = product.category?.categoryId ?? product.categoryId ?? product.category?.id ?? null;
          const parentId = product.category?.parent?.categoryId ?? product.category?.parentId ?? product.parentCategoryId ?? null;

          const categoryIdStr = categoryId != null ? String(categoryId) : null;
          const parentIdStr = parentId != null ? String(parentId) : null;

          if (activeSubcategoryId) {
            return categoryIdStr === activeSubcategoryId;
          }

          if (parentCategoryId == null) {
            return categoryIdStr ? normalizeName(product.category?.name ?? "") === normalizeName(parentSlug) : false;
          }

          if (categoryIdStr === String(parentCategoryId)) {
            return true;
          }

          if (childIds.includes(categoryIdStr ?? "")) {
            return true;
          }

          return parentIdStr === String(parentCategoryId);
        });

        setProducts(filteredProducts);
        if (filteredProducts.length === 0) {
          setError("No se encontraron productos para la categoría seleccionada.");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("No fue posible cargar los productos de esta categoría.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [categoria, subcategoria]);

  return (
    <div className="categoria">
      <h1 className="title-categori">
        {categoryLabel} {subcategoria && `- ${subcategoria}`}
      </h1>
      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: "#b02a37" }}>{error}</p>}
      {!loading && (
        <ProductList products={products} onProductsChange={setProducts} />
      )}
    </div>
  );
};

export default Categoria;
