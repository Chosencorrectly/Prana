import { categories, products } from "./catalog.js";

export const normalizeSearchQuery = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

const searchIndex = products.map((product) => ({
  product,
  text: normalizeSearchQuery(`${product.name} ${product.description} ${product.category}`),
}));

export function searchMenu(query) {
  const normalized = normalizeSearchQuery(query);
  return searchIndex.filter(({ text }) => text.includes(normalized)).map(({ product }) => product);
}

// Stable demo assortment: one actual dish from each of the first eight categories.
// This is not a personalized or backend recommendation system.
export const searchRecommendations = categories
  .map((category) => products.find((product) => product.categoryId === category.id))
  .filter(Boolean)
  .slice(0, 8);
