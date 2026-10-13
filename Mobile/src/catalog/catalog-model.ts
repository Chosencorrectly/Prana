export type Product = {
  id: string; categoryId: string; name: string; description: string; image: string; imageAlt: string;
  priceCents: number; kcal: number | null;
  nutrition: { protein: number | null; fat: number | null; carbs: number | null };
  descriptionSource?: string;
};
export type Category = { id: string; name: string };
export type CatalogItem = { product: Product; large: boolean };
export type CatalogSection = Category & { items: CatalogItem[] };

export function createCatalogLayout(categories: Category[], products: Product[], random = Math.random): CatalogSection[] {
  return categories.map(category => {
    const remaining = products.filter(product => product.categoryId === category.id);
    const items: CatalogItem[] = [];
    while (remaining.length) {
      if (remaining.length === 2) {
        items.push(...remaining.splice(0).map(product => ({ product, large: false })));
        break;
      }
      const size = remaining.length >= 5 && random() >= 0.5 ? 5 : Math.min(3, remaining.length);
      const group = remaining.splice(0, size);
      const selected = Math.min(group.length - 1, Math.floor(random() * group.length));
      items.push({ product: group.splice(selected, 1)[0], large: true });
      items.push(...group.map(product => ({ product, large: false })));
    }
    return { ...category, items };
  });
}

export function changeQuantity(quantities: Record<string, number>, id: string, delta: number) {
  const next = { ...quantities };
  const quantity = Math.max(0, (next[id] ?? 0) + delta);
  if (quantity) next[id] = quantity;
  else delete next[id];
  return next;
}

export function menuFades(position: number, max: number, width = 127) {
  const left = Math.max(0, Math.min(position, max));
  return { left: Math.min(left, width), right: Math.min(Math.max(0, max - left), width) };
}
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
