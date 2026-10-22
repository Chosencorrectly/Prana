import { checkoutTotals, type PromoStatus } from './promo-model.ts';

export const allergens = [
  ['milk', 'Milk'], ['eggs', 'Eggs'], ['fish', 'Fish'], ['shellfish', 'Shellfish'],
  ['tree-nuts', 'Tree nuts'], ['peanuts', 'Peanuts'], ['wheat', 'Wheat'],
  ['soy', 'Soy'], ['sesame', 'Sesame'], ['gluten', 'Gluten'],
] as const;
export type Allergen = typeof allergens[number][0];
export type Tip = { kind: 'percent'; value: 0 | 10 | 15 | 20 } | { kind: 'custom'; cents: number };
export type PaymentMethod = 'card' | 'apple' | 'google';
export const paymentMethods = { card: 'Pay by card', apple: 'Apple Pay', google: 'Google Pay' } as const;
export const noTip: Tip = { kind: 'percent', value: 0 };
export const paymentCardIndex = (cards: { id: string }[], options: { payment: number; paymentCardId?: string }) => options.paymentCardId ? cards.findIndex(card => card.id === options.paymentCardId) : options.payment;
export const allergySummary = (selected: readonly Allergen[] = []) => allergens.filter(([id]) => selected.includes(id)).map(([, label]) => label).join(', ') || 'None declared';

// D-75: explicitly keep delivery and tax at zero in this local prototype.
// Percentage tips use the discounted meal subtotal, rounded once in cents.
export function orderTotals(subtotalCents: number, promo: PromoStatus, tip: Tip = noTip) {
  const base = checkoutTotals(subtotalCents, promo);
  const tipCents = subtotalCents <= 0 ? 0 : tip.kind === 'percent' ? Math.round(base.totalCents * tip.value / 100) : Math.max(0, Math.round(tip.cents));
  return { ...base, deliveryCents: 0, taxCents: 0, tipCents, totalCents: base.totalCents + tipCents };
}
export function parseTip(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d{1,6}(?:\.\d{0,2})?$/.test(normalized)) return null;
  const [dollars, cents = ''] = normalized.split('.');
  return Number(dollars) * 100 + Number(cents.padEnd(2, '0'));
}
