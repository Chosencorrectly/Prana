import type { Product } from './catalog-model';
import type { SavedAddress } from './address-model';
import { type PromoStatus } from './promo-model.ts';
import { orderTotals, type Allergen, type PaymentMethod, type Tip } from './checkout-options.ts';
import { cartItems } from './cart-model.ts';

export type OrderOptions = { leaveAtDoor: boolean; time: number; payment: number; paymentCardId?: string; paymentMethod?: PaymentMethod; paymentLabel?: string; allergens?: Allergen[]; tip?: Tip; courierNote?: string };
export type OrderItem = { id: string; name: string; description: string; quantity: number; priceCents: number };
export type ActiveOrder = {
  items: OrderItem[]; address: SavedAddress; phone: string; options: OrderOptions;
  count: number; subtotalCents: number; discountCents: number; totalCents: number;
  deliveryCents: number; taxCents: number; tipCents: number;
  // Presentation fixtures from Figma, not a live delivery estimate or rewards rule.
  eta: string; status: string; stage: number; points: number;
};
export function createOrder(products: Product[], quantities: Record<string, number>, address: SavedAddress, phone: string | null, promo: PromoStatus, options: OrderOptions): ActiveOrder | null {
  if (!phone) return null;
  const items = cartItems(products, quantities).map(({ product, quantity }) => ({ id: product.id, name: product.name, description: product.description, quantity, priceCents: product.priceCents }));
  if (!items.length) return null;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  return { items, count, ...orderTotals(subtotal, promo, options.tip), phone,
    address: { ...address, location: { ...address.location, point: { ...address.location.point } }, details: { ...address.details } },
    options: { ...options, ...(options.allergens ? { allergens: [...options.allergens] } : {}), ...(options.tip ? { tip: { ...options.tip } } : {}) }, eta: '12:20–12:35 PM', status: 'Looking for courier', stage: 1, points: 200 };
}

export type OrderSnap = 0 | 1;
export const orderSnapNames = ['Order details', 'Full map'] as const;
export function orderSnapPoints(height: number, safeBottom = 34) {
  const detail = Math.round(height * 297 / 932);
  const minimal = height - Math.max(164, 130 + safeBottom);
  return [detail, minimal] as const;
}
export function settleOrderSnap(y: number, velocity: number, points: readonly number[]): OrderSnap {
  const projected = y + Math.max(-1.8, Math.min(1.8, velocity)) * 160;
  return points.reduce((best, point, index) => Math.abs(point - projected) < Math.abs(points[best] - projected) ? index : best, 0) as OrderSnap;
}
export type OrderPresentation = { snap: OrderSnap; scroll: number; expanded: boolean };
export const initialOrderPresentation = (): OrderPresentation => ({ snap: 0, scroll: 0, expanded: false });
