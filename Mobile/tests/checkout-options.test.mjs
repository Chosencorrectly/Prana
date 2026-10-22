import test from 'node:test';
import assert from 'node:assert/strict';
import { allergySummary, orderTotals, parseTip, paymentCardIndex } from '../src/catalog/checkout-options.ts';
import { createOrder } from '../src/catalog/order-model.ts';
import { initialAddressBook } from '../src/catalog/address-model.ts';

test('checkout keeps delivery and tax free by explicit user choice', () => {
  assert.deepEqual(orderTotals(9170, 'idle'), { subtotalCents: 9170, discountCents: 0, deliveryCents: 0, taxCents: 0, tipCents: 0, totalCents: 9170 });
});
test('percentage tip rounds once on discounted meals and follows quantities/promo changes', () => {
  assert.equal(orderTotals(1595, 'idle', { kind: 'percent', value: 15 }).tipCents, 239);
  const result = orderTotals(3190, 'applied', { kind: 'percent', value: 15 });
  assert.equal(result.discountCents, 319); assert.equal(result.tipCents, 431); assert.equal(result.totalCents, 3302);
  assert.equal(orderTotals(3190, 'validating', { kind: 'percent', value: 15 }).totalCents, 3669);
});
test('custom tip stays fixed and an empty cart never retains a payable tip', () => {
  assert.equal(orderTotals(1595, 'idle', { kind: 'custom', cents: 250 }).totalCents, 1845);
  assert.equal(orderTotals(3190, 'applied', { kind: 'custom', cents: 250 }).totalCents, 3121);
  assert.equal(orderTotals(0, 'idle', { kind: 'custom', cents: 250 }).totalCents, 0);
});
test('custom money input accepts cents/comma/zero and rejects ambiguous or invalid amounts', () => {
  for (const [value, cents] of [['2.50',250],['2,5',250],['0',0],['0.01',1],['10.',1000]]) assert.equal(parseTip(value), cents);
  for (const value of ['', '-1', '1.234', '1,2.3', '1e2', 'Infinity', 'NaN', '$2', '1234567']) assert.equal(parseTip(value), null);
});
test('allergy summary uses a stable display order and a clear empty state', () => {
  assert.equal(allergySummary(), 'None declared');
  assert.equal(allergySummary(['tree-nuts','milk','fish']), 'Milk, Fish, Tree nuts');
});
test('saved checkout card follows its ID and never silently switches after removal', () => {
  const options = { payment: 1, paymentCardId: 'selected' };
  assert.equal(paymentCardIndex([{ id: 'selected' }, { id: 'other' }], options), 0);
  assert.equal(paymentCardIndex([{ id: 'other' }], options), -1);
});
test('placed receipt independently snapshots tip, allergens, payment, and courier note', () => {
  const options = { leaveAtDoor: true, time: 0, payment: 0, paymentMethod: 'apple', paymentLabel: 'Apple Pay', allergens: ['milk'], tip: { kind: 'custom', cents: 250 }, courierNote: 'Please ring once' };
  const order = createOrder([{ id: 'a', name: 'A', description: '', priceCents: 1595 }], { a: 2 }, initialAddressBook.current, '+14155550123', 'applied', options);
  options.allergens.push('eggs'); options.tip.cents = 999; options.courierNote = 'Changed'; options.paymentMethod = 'google';
  assert.deepEqual(order.options.allergens, ['milk']); assert.equal(order.options.tip.cents, 250);
  assert.equal(order.options.paymentMethod, 'apple'); assert.equal(order.options.courierNote, 'Please ring once');
  assert.equal(order.count, 2); assert.equal(order.totalCents, 3121); assert.equal(order.tipCents, 250);
});
