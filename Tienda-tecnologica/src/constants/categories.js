export const normalizeName = (name = "") =>
  name.normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();

const DEFAULT_CATEGORIES = [
  { slug: "computadoras", label: "Computadoras" },
  { slug: "celulares", label: "Celulares" },
  { slug: "tv", label: "TV" },
  { slug: "videojuegos", label: "Videojuegos" },
  { slug: "audio", label: "Audio" },
];

export const findBySlug = (categories = [], slug) => {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase();
  return categories.find((cat) => normalizeName(cat.name) === normalized);
};

export default DEFAULT_CATEGORIES;
