import type { Category, Product } from './catalog-model';

export function cartItems(products: Product[], quantities: Record<string, number>) {
  const byId = new Map(products.map(product => [product.id, product]));
  // Keep the order in which dishes were added, including while quantities change.
  return Object.entries(quantities).flatMap(([id, quantity]) => {
    const product = byId.get(id);
    return product && quantity > 0 ? [{ product, quantity }] : [];
  });
}

export function cartSuggestions(products: Product[], categories: Category[], quantities: Record<string, number>) {
  const drinks = new Set(categories.filter(category => /refresh|liquids|energizers/i.test(category.name)).map(category => category.id));
  const available = products.filter(product => !quantities[product.id]);
  return [...available.filter(product => drinks.has(product.categoryId)), ...available.filter(product => !drinks.has(product.categoryId))].slice(0, 4);
}

// Missing nutrition is unknown, never zero. Each total requires complete data
// for that nutrient across every portion in the basket.
export function cartNutrition(products: Product[], quantities: Record<string, number>) {
  const items = cartItems(products, quantities);
  const sum = (read: (product: Product) => number | null) => {
    if (!items.length || items.some(({ product }) => read(product) == null)) return null;
    return Math.round(items.reduce((total, { product, quantity }) => total + read(product)! * quantity, 0) * 10) / 10;
  };
  return [
    { label: 'kcal', full: 'kilocalories', value: sum(product => product.kcal) },
    { label: 'pr', full: 'grams protein', value: sum(product => product.nutrition.protein) },
    { label: 'fa', full: 'grams fat', value: sum(product => product.nutrition.fat) },
    { label: 'ca', full: 'grams carbohydrates', value: sum(product => product.nutrition.carbs) },
  ];
}

export type CartAvailability = { offline: boolean; failed: boolean; limit?: number };
export function cartChangeIssue(quantity: number, delta: number, availability: CartAvailability) {
  if (availability.offline) return 'offline';
  if (availability.failed) return 'update-error';
  if (delta > 0 && availability.limit != null && quantity + delta > availability.limit) return 'stock';
  return null;
}
