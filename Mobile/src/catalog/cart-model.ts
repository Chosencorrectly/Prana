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
