import type { Product } from './catalog-model';

export type PhotoRect = { x: number; y: number; width: number; height: number; borderRadius: string };
export const dishMotion = {
  open: 0.42, close: 0.32, swipe: 0.22, reduced: 0.08,
  ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
};

// Same title presentation as desktop product-details.js; factual description stays intact.
export function dishTitle(product: Pick<Product, 'name'>) {
  return product.name.replace(/\([^()]*\)/g, '').replace(/\s+/g, ' ').trim() || product.name;
}

// Only this supplied Figma dish has a weight. Never propagate the fixture to other products.
export function dishWeight(product: Pick<Product, 'id'>) {
  return product.id === '884bb3d4-573a-44dd-b370-25277a9b8580' ? '345 g' : null;
}

export function dishNutrition(product: Product) {
  return [
    { label: 'Kcal', value: product.kcal },
    { label: 'Protein', value: product.nutrition.protein },
    { label: 'Fat', value: product.nutrition.fat },
    { label: 'Car', value: product.nutrition.carbs },
  ].filter(item => item.value != null);
}

export function swipeAxis(x: number, y: number): 'pending' | 'horizontal' | 'vertical' | 'blocked' {
  if (Math.max(Math.abs(x), Math.abs(y)) < 8) return 'pending';
  if (Math.abs(y) >= Math.abs(x)) return 'vertical';
  return x > 0 ? 'horizontal' : 'blocked';
}

export function shouldDismissDish(distance: number, velocity: number, width: number) {
  return distance >= width * 0.28 || (distance >= 24 && velocity >= 0.55);
}

export function photoRect(rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  screen: Pick<DOMRect, 'left' | 'top' | 'width'>, canvasWidth: number, panelTop: number): PhotoRect {
  const scale = screen.width / canvasWidth;
  return { x: (rect.left - screen.left) / scale, y: (rect.top - screen.top) / scale - panelTop,
    width: rect.width / scale, height: rect.height / scale, borderRadius: '20px 20px 20px 20px' };
}
