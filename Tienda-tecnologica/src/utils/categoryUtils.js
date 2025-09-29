import DEFAULT_CATEGORIES, { normalizeName, findBySlug } from "../constants/categories";

export { findBySlug };

export const CATEGORY_ID_PROPS = ["categoryId", "category_id", "id", "categoryID"];
export const PARENT_ID_PROPS = [
  "parentId",
  "parent_id",
  "parentID",
  "parentCategoryId",
  "parentCategory_id",
  "parentCategoryID",
];

const CATEGORY_STORAGE_KEY = "adso_categories_cache";
const UPDATE_EVENT = "adso:categories-updated";

export const parseIdentifier = (value) => {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const asString = String(value).trim();
  if (!asString) return null;
  const lower = asString.toLowerCase();
  if (lower === "null" || lower === "undefined") {
    return null;
  }
  const numeric = Number(asString);
  return Number.isNaN(numeric) ? asString : numeric;
};

export const pickFirstAvailable = (source, propNames) => {
  if (!source) return null;
  for (const prop of propNames) {
    if (Object.prototype.hasOwnProperty.call(source, prop) && source[prop] != null) {
      return source[prop];
    }
  }
  return null;
};

export const getCategoryKey = (category) => parseIdentifier(pickFirstAvailable(category, CATEGORY_ID_PROPS));

export const getParentKey = (category) => {
  if (!category) return null;
  const direct = parseIdentifier(pickFirstAvailable(category, PARENT_ID_PROPS));
  if (direct != null) {
    return direct;
  }
  if (category.parent) {
    return getCategoryKey(category.parent);
  }
  if (category.parentCategory) {
    return getCategoryKey(category.parentCategory);
  }
  return null;
};

export const dedupeCategories = (list = []) => {
  const byCompositeKey = new Map();
  list.forEach((item) => {
    if (!item) return;
    const slug = normalizeName(item?.name ?? "");
    if (!slug) return;
    const parentKey = getParentKey(item);
    const compositeKey = `${slug}::${parentKey != null ? String(parentKey) : "root"}`;
    const existing = byCompositeKey.get(compositeKey);
    if (!existing) {
      byCompositeKey.set(compositeKey, item);
      return;
    }

    const existingId = getCategoryKey(existing);
    const currentId = getCategoryKey(item);

    if (existingId == null && currentId != null) {
      byCompositeKey.set(compositeKey, item);
      return;
    }

    if (existingId != null && currentId != null && Number(currentId) < Number(existingId)) {
      byCompositeKey.set(compositeKey, item);
    }
  });

  return Array.from(byCompositeKey.values());
};

export const normalizeCategoryRecord = (category) => {
  if (!category) {
    return null;
  }

  const categoryId = getCategoryKey(category);
  if (categoryId == null) {
    return null;
  }

  const parentId = getParentKey(category);
  const { children: _children, parent: _parent, parentCategory: _parentCategory, ...rest } = category ?? {};

  return {
    ...rest,
    categoryId,
    parentId,
  };
};

export const normalizeCategoryList = (list = []) => {
  if (!Array.isArray(list)) {
    return [];
  }

  const deduped = dedupeCategories(list);
  const normalized = deduped
    .map(normalizeCategoryRecord)
    .filter(Boolean);

  normalized.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return normalized;
};

export const splitCategoriesByParent = (list = []) => {
  const normalized = normalizeCategoryList(list);
  const parents = [];
  const subcategoriesByParent = new Map();

  normalized.forEach((category) => {
    if (category.parentId == null) {
      parents.push(category);
      return;
    }

    const key = String(category.parentId);
    const bucket = subcategoriesByParent.get(key);
    if (bucket) {
      bucket.push(category);
    } else {
      subcategoriesByParent.set(key, [category]);
    }
  });

  parents.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  subcategoriesByParent.forEach((bucket, key) => {
    bucket.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    subcategoriesByParent.set(key, bucket);
  });

  return { normalized, parents, subcategoriesByParent };
};

export const getCategorySlug = (category) => {
  const slug = normalizeName(category?.name ?? "");
  if (slug) return slug;
  const key = getCategoryKey(category);
  return key != null ? String(key).toLowerCase() : "";
};

export const areCategoryListsEqual = (a = [], b = []) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    const current = a[index];
    const next = b[index];
    const currentKey = getCategoryKey(current);
    const nextKey = getCategoryKey(next);
    if (currentKey !== nextKey) {
      return false;
    }
    const currentName = normalizeName(current?.name ?? "");
    const nextName = normalizeName(next?.name ?? "");
    if (currentName !== nextName) {
      return false;
    }
    const currentParent = current?.parentId ?? null;
    const nextParent = next?.parentId ?? null;
    if (String(currentParent ?? "") !== String(nextParent ?? "")) {
      return false;
    }
  }
  return true;
};

export const buildFallbackCategories = () =>
  normalizeCategoryList(
    DEFAULT_CATEGORIES.map((cat) => ({
      categoryId: cat.slug,
      name: cat.label,
    }))
  );

export const loadCategoriesFromCache = () => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return normalizeCategoryList(parsed);
  } catch (error) {
    console.warn("No fue posible leer las categorías en caché", error);
    return [];
  }
};

export const saveCategoriesToCache = (categories) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const normalized = normalizeCategoryList(categories);
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: normalized }));
  } catch (error) {
    console.warn("No fue posible almacenar las categorías", error);
  }
};

export const subscribeToCategoryUpdates = (handler) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const updateListener = (event) => {
    const detail = Array.isArray(event.detail) ? event.detail : loadCategoriesFromCache();
    handler(detail);
  };

  const storageListener = (event) => {
    if (event.key === CATEGORY_STORAGE_KEY) {
      handler(loadCategoriesFromCache());
    }
  };

  window.addEventListener(UPDATE_EVENT, updateListener);
  window.addEventListener("storage", storageListener);

  return () => {
    window.removeEventListener(UPDATE_EVENT, updateListener);
    window.removeEventListener("storage", storageListener);
  };
};

export const CATEGORY_CACHE_KEY = CATEGORY_STORAGE_KEY;
export const CATEGORY_UPDATE_EVENT = UPDATE_EVENT;
