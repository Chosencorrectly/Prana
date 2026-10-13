import type { Category, Product } from './catalog-model';

// Same matching and stable demo assortment as the desktop catalogue.
export const normalizeSearch = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
export function createMenuSearch(products: Product[], categories: Category[]) {
  const index = products.map(product => ({ product, text: normalizeSearch(`${product.name} ${product.description} ${categories.find(category => category.id === product.categoryId)?.name ?? ''}`) }));
  return (query: string) => {
    const normalized = normalizeSearch(query);
    return index.filter(({ text }) => text.includes(normalized)).map(({ product }) => product);
  };
}
export function searchSuggestions(products: Product[], categories: Category[]) {
  return categories.flatMap(category => products.find(product => product.categoryId === category.id) ?? []).slice(0, 8);
}
export function cartSummary(products: Product[], quantities: Record<string, number>) {
  return products.reduce((total, product) => {
    const quantity = quantities[product.id] ?? 0;
    return { count: total.count + quantity, cents: total.cents + product.priceCents * quantity };
  }, { count: 0, cents: 0 });
}
