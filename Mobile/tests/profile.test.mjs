import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cardErrors, validCardNumber, saveCard, removeCard, initialProfile, blankCard, personalErrors, cleanDetails, changed, demoHistory, reorderItems, mergeReorder } from '../src/profile/profile-model.ts';
import { initialAddressBook, addressReducer } from '../src/catalog/address-model.ts';
import { phoneVerificationReducer, initialPhoneVerification } from '../src/catalog/phone-verification.ts';
const catalog = JSON.parse(await readFile(new URL('../src/catalog/catalog.json', import.meta.url)));
const testCard = { number: '4242 4242 4242 4242', expiry: '12/29', cvc: '123', name: ' Test Person ', isDefault: true };
test('optional personal fields accept blanks, reject partial email and trim successful saves', () => {
  assert.deepEqual(personalErrors({ ...initialProfile.details, email: '' }), {});
  assert.ok(personalErrors({ ...initialProfile.details, email: 'mike@' }).email);
  const draft = { ...initialProfile.details, firstName: '  New name  ' };
  assert.ok(changed(draft, initialProfile.details));
  assert.equal(cleanDetails(draft).firstName, 'New name');
  assert.equal(initialProfile.details.firstName, 'Michael');
});
test('card validation checks checksum, month, expiry, security code and name', () => {
  assert.ok(validCardNumber(testCard.number));
  assert.ok(!validCardNumber('4242 4242 4242 4241'));
  assert.ok(!validCardNumber('0000 0000 0000 0000'));
  assert.ok(cardErrors({ ...testCard, expiry: '01/24' }, new Date(2026, 9, 22)).expiry);
  assert.ok(cardErrors({ ...testCard, expiry: '13/29' }, new Date(2026, 9, 22)).expiry);
  assert.ok(cardErrors({ ...testCard, cvc: '1', name: ' ' }).cvc);
  assert.ok(cardErrors({ ...testCard, cvc: '1', name: ' ' }).name);
  assert.deepEqual(cardErrors(testCard, new Date(2026, 9, 22)), {});
  assert.deepEqual(cardErrors({ ...testCard, number: '', cvc: '' }, new Date(2026, 9, 22), true), {});
});
test('saving a card retains only display details, never PAN or CVC, and updates one default', () => {
  const next = saveCard(initialProfile, testCard, 'new-card');
  assert.equal(next.cards.length, 3); assert.equal(next.defaultCardId, 'new-card');
  assert.deepEqual(next.cards.at(-1), { id: 'new-card', brand: 'Visa', last4: '4242', expiry: '12/29', name: 'Test Person' });
  assert.ok(!JSON.stringify(next).includes('4242 4242 4242 4242'));
  assert.equal('cvc' in next.cards.at(-1), false);
  assert.equal(initialProfile.cards.length, 2);
});
test('edit preserves token and last4; deletion falls back without corrupting other cards', () => {
  let next = saveCard(initialProfile, { ...blankCard(), expiry: '11/30', name: 'Changed', isDefault: false }, 'unused', 'card-7032');
  assert.equal(next.cards.length, 2); assert.equal(next.cards[0].last4, '7032'); assert.equal(next.cards[0].name, 'Changed');
  next = removeCard(next, 'card-7032'); assert.equal(next.defaultCardId, 'card-8034');
  next = removeCard(next, 'card-8034'); assert.equal(next.cards.length, 0); assert.equal(next.defaultCardId, '');
});
test('reorder resolves present prices, omits unavailable items and merges existing cart quantities', () => {
  const order = demoHistory(catalog.products)[0];
  const originalPrice = order.items[0].priceCents;
  const products = catalog.products.map(p => p.id === order.items[0].id ? { ...p, priceCents: originalPrice + 100 } : p);
  const withMissing = { ...order, items: [...order.items, { id: 'missing', name: 'Unavailable', quantity: 4, priceCents: 999 }] };
  const result = reorderItems(withMissing, products);
  assert.equal(result.unavailable.length, 1); assert.equal(result.count, 2);
  assert.equal(result.cents, order.items.reduce((n, i) => n + i.priceCents * i.quantity, 0) + 100);
  const before = { [order.items[0].id]: 2, untouched: 3 }, next = mergeReorder(before, withMissing, products);
  assert.equal(next[order.items[0].id], 3); assert.equal(next.untouched, 3); assert.equal(next.missing, undefined);
  assert.equal(before[order.items[0].id], 2); assert.equal(order.items[0].priceCents, originalPrice);
  assert.equal(reorderItems(withMissing, []).available.length, 0);
});
test('removing a saved address leaves the committed order/delivery snapshot intact', () => {
  const before = structuredClone(initialAddressBook), current = before.current;
  const next = addressReducer(before, { type: 'remove', id: 'home' });
  assert.equal(next.addresses.length, 1); assert.equal(next.selectedId, 'work'); assert.equal(next.defaultId, 'work');
  assert.equal(next.current, current); assert.equal(next.current.id, 'home');
  assert.equal(addressReducer(next, { type: 'begin' }).selectedId, 'work');
  assert.equal(before.addresses.length, 2);
});
test('profile verification feeds checkout, logout clears verification, auth default stays missing', () => {
  assert.equal(initialPhoneVerification.confirmedPhone, null);
  const confirmed = phoneVerificationReducer(initialPhoneVerification, { type: 'profile-confirmed', phone: '+12025550125' });
  assert.equal(confirmed.confirmedPhone, '+12025550125');
  const signedOut = phoneVerificationReducer(confirmed, { type: 'profile-confirmed', phone: '' });
  assert.equal(signedOut.confirmedPhone, null); assert.equal(signedOut.code, '');
});
