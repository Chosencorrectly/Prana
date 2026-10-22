import type { Product } from '../catalog/catalog-model';

export type PersonalDetails = { firstName: string; lastName: string; email: string; birthday: string };
export type Preferences = { push: boolean; email: boolean; sms: boolean };
export type SavedCard = { id: string; brand: string; last4: string; expiry: string; name: string };
export type CardDraft = { number: string; expiry: string; cvc: string; name: string; isDefault: boolean };
export type ProfileData = { signedIn: boolean; details: PersonalDetails; phone: string; cards: SavedCard[]; defaultCardId: string; preferences: Preferences; devicePush: boolean };
export const initialProfile: ProfileData = {
  signedIn: false, details: { firstName: 'Michael', lastName: 'Jerlis', email: 'brooks.06@prana.kitchen', birthday: '1985-06-12' }, phone: '+6282100001122',
  cards: [{ id: 'card-7032', brand: 'Mastercard', last4: '7032', expiry: '12/28', name: 'Michael Jerlis' }, { id: 'card-8034', brand: 'Mastercard', last4: '8034', expiry: '09/29', name: 'Michael Jerlis' }],
  defaultCardId: 'card-7032', preferences: { push: true, email: false, sms: false }, devicePush: true,
};
export const blankCard = (): CardDraft => ({ number: '', expiry: '', cvc: '', name: '', isDefault: false });
export const initials = (details: PersonalDetails) => `${details.firstName.trim()[0] ?? ''}${details.lastName.trim()[0] ?? ''}`.toUpperCase();
export const changed = (a: object, b: object) => JSON.stringify(a) !== JSON.stringify(b);
export const cleanDetails = (details: PersonalDetails): PersonalDetails => ({ ...details, firstName: details.firstName.trim(), lastName: details.lastName.trim(), email: details.email.trim() });
export function personalErrors(details: PersonalDetails) {
  const errors: Partial<Record<keyof PersonalDetails, string>> = {};
  if (details.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) errors.email = 'Enter a complete email, like name@example.com.';
  if (details.firstName.length > 60 || details.lastName.length > 60) errors.firstName = 'Use 60 characters or fewer.';
  return errors;
}
export function validCardNumber(value: string) {
  const digits = value.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = digits.length - 1, double = false; i >= 0; i--, double = !double) { let n = Number(digits[i]); if (double && (n *= 2) > 9) n -= 9; sum += n; }
  return sum % 10 === 0;
}
export function cardErrors(draft: CardDraft, now = new Date(), editing = false) {
  const errors: Partial<Record<keyof CardDraft, string>> = {};
  if (!editing && !validCardNumber(draft.number)) errors.number = 'Enter a complete, valid card number.';
  const match = /^(\d{2})\/(\d{2})$/.exec(draft.expiry);
  if (!match || +match[1] < 1 || +match[1] > 12 || 2000 + +match[2] < now.getFullYear() || (2000 + +match[2] === now.getFullYear() && +match[1] < now.getMonth() + 1)) errors.expiry = 'Enter a valid expiry date in the future.';
  if (!editing && !/^\d{3,4}$/.test(draft.cvc)) errors.cvc = 'Enter the security code on your card.';
  if (!draft.name.trim()) errors.name = 'Enter the name on your card.';
  return errors;
}
// Only a display token survives a simulated save. PAN and CVC never enter account state.
export function saveCard(profile: ProfileData, draft: CardDraft, id: string, editingId?: string): ProfileData {
  const existing = profile.cards.find(card => card.id === editingId);
  const card: SavedCard = existing ? { ...existing, name: draft.name.trim(), expiry: draft.expiry } : { id, brand: draft.number.startsWith('4') ? 'Visa' : 'Mastercard', last4: draft.number.replace(/\D/g, '').slice(-4), expiry: draft.expiry, name: draft.name.trim() };
  const cards = existing ? profile.cards.map(item => item.id === existing.id ? card : item) : [...profile.cards, card];
  return { ...profile, cards, defaultCardId: draft.isDefault || !profile.cards.length ? card.id : profile.defaultCardId };
}
export function removeCard(profile: ProfileData, id: string): ProfileData {
  const cards = profile.cards.filter(card => card.id !== id);
  return { ...profile, cards, defaultCardId: profile.defaultCardId === id ? cards[0]?.id ?? '' : profile.defaultCardId };
}
export type HistoryOrder = { id: string; date: string; status: 'Delivered' | 'Cancelled'; items: { id: string; name: string; quantity: number; priceCents: number }[]; address: string; payment: string };
export function demoHistory(products: Product[]): HistoryOrder[] {
  const selected = [products.find(p => /^acai bowl/i.test(p.name))!, products.find(p => /^buddha bowl/i.test(p.name)) ?? products[1]];
  const items = selected.map(p => ({ id: p.id, name: p.name, quantity: 1, priceCents: p.priceCents }));
  return [
    { id: '138', date: '16 Oct 2026', status: 'Delivered', items, address: 'Jl. Raya Padonan No.41a, Tibubeneng, Bali', payment: 'Mastercard •••• 7032' },
    { id: '137', date: '14 Oct 2026', status: 'Cancelled', items: items.map(item => ({ ...item })), address: 'Jl. Raya Padonan No.41a, Tibubeneng, Bali', payment: 'Unavailable' },
  ];
}
export function reorderItems(order: HistoryOrder, products: Product[]) {
  const available = order.items.flatMap(item => { const product = products.find(p => p.id === item.id); return product ? [{ product, quantity: item.quantity }] : []; });
  return { available, unavailable: order.items.filter(item => !products.some(p => p.id === item.id)), count: available.reduce((n, item) => n + item.quantity, 0), cents: available.reduce((n, item) => n + item.quantity * item.product.priceCents, 0) };
}
export function mergeReorder(quantities: Record<string, number>, order: HistoryOrder, products: Product[]) {
  const next = { ...quantities };
  for (const { product, quantity } of reorderItems(order, products).available) next[product.id] = (next[product.id] ?? 0) + quantity;
  return next;
}

export const profileScenarios = [
  ['ready', 'Профиль с данными'], ['no-name', 'Без имени и адресов'], ['loading', 'Загрузка профиля'], ['offline', 'Профиль офлайн'], ['promos', 'Промокоды'],
  ['personal', 'Личные данные'], ['personal-dirty', 'Несохранённые изменения'], ['personal-invalid', 'Ошибка email'], ['birthday', 'Дата рождения'], ['phone', 'Смена телефона'], ['code', 'Подтверждение SMS'], ['personal-error', 'Ошибка сохранения'], ['discard', 'Подтверждение отмены'], ['personal-saved', 'Данные сохранены'],
  ['orders', 'История заказов'], ['orders-empty', 'Нет заказов'], ['orders-error', 'Ошибка истории'], ['order', 'Доставленный заказ'], ['tracking', 'Отслеживание заказа'], ['reorder', 'Повтор: часть недоступна'], ['reorder-empty', 'Повтор: всё недоступно'], ['cancelled', 'Отменённый заказ'],
  ['places-empty', 'Нет адресов'], ['places', 'Адреса'], ['address-map', 'Новый адрес на карте'], ['address-search', 'Поиск адреса'], ['address-selected', 'Выбранный адрес'], ['address-details', 'Детали адреса'], ['address-remove', 'Удаление адреса'],
  ['cards-empty', 'Нет карт'], ['cards', 'Сохранённые карты'], ['card-form', 'Добавление карты'], ['card-invalid', 'Ошибки реквизитов'], ['card-verifying', 'Проверка карты'], ['card-bank', 'Подтверждение банка'], ['card-error', 'Карта не сохранена'], ['card', 'Детали карты'], ['card-remove', 'Удаление карты'],
  ['points', 'Баланс баллов'], ['points-empty', 'Нулевой баланс'], ['activity', 'История баллов'], ['loyalty-error', 'Условия программы недоступны'], ['points-error', 'Ошибка баланса'], ['loyalty', 'Условия программы'],
  ['settings', 'Настройки'], ['notifications', 'Уведомления'], ['notifications-error', 'Ошибка предпочтений'], ['permission', 'Нет разрешения устройства'], ['credits', 'О приложении'], ['licenses-error', 'Лицензии недоступны'], ['privacy-error', 'Политика недоступна'], ['terms-error', 'Условия сервиса недоступны'],
  ['logout', 'Выход из аккаунта'], ['guest', 'Гость'], ['logout-error', 'Ошибка выхода'],
] as const;
export type ProfileScenario = typeof profileScenarios[number][0];
