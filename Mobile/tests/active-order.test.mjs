import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, orderSnapPoints, settleOrderSnap } from '../src/catalog/order-model.ts';
import { initialAddressBook } from '../src/catalog/address-model.ts';

const products = [{ id: 'a', name: 'Dish A', description: 'A', priceCents: 1243 }, { id: 'b', name: 'Dish B', description: 'B', priceCents: 721 }];
const options = { leaveAtDoor: true, time: 1, payment: 1 };
test('order requires a confirmed phone and actual dishes', () => {
  assert.equal(createOrder(products, { a: 2 }, initialAddressBook.current, null, 'applied', options), null);
  assert.equal(createOrder(products, {}, initialAddressBook.current, '+15551234567', 'idle', options), null);
  assert.equal(createOrder(products, { unknown: 1 }, initialAddressBook.current, '+15551234567', 'idle', options), null);
});
test('receipt freezes the purchased quantities, delivery details, options and integer-cent discount', () => {
  const quantities = { a: 2, b: 1 }, address = structuredClone(initialAddressBook.current), selections = { ...options };
  const order = createOrder(products, quantities, address, '+15551234567', 'applied', selections);
  assert.equal(order.count, 3); assert.equal(order.subtotalCents, 3207); assert.equal(order.discountCents, 321); assert.equal(order.totalCents, 2886);
  quantities.a = 99; address.details.instructions = 'Different note'; address.location.point.x = 0; selections.time = 2;
  assert.equal(order.items[0].quantity, 2); assert.equal(order.address.details.instructions, 'Call when you deliver');
  assert.equal(order.address.location.point.x, initialAddressBook.current.location.point.x); assert.equal(order.options.time, 1);
});
test('pending and invalid promos do not reduce a placed order', () => {
  for (const status of ['idle', 'debouncing', 'validating', 'invalid']) {
    const order = createOrder(products, { b: 1 }, initialAddressBook.current, '+15551234567', status, options);
    assert.equal(order.totalCents, 721); assert.equal(order.discountCents, 0);
  }
});
test('receipt keeps the cart insertion order', () => {
  const order = createOrder(products, { b: 1, a: 2 }, initialAddressBook.current, '+15551234567', 'idle', options);
  assert.deepEqual(order.items.map(item => item.id), ['b', 'a']);
});
test('two endpoint snaps preserve the minimal status and safe-area height', () => {
  assert.deepEqual(orderSnapPoints(932), [297, 768]);
  for (const [height, safe] of [[874, 0], [932, 34], [840, 40]]) {
    const points = orderSnapPoints(height, safe);
    assert.equal(points.length, 2);
    assert.ok(points[0] < points[1]); assert.ok(height - points[1] >= 130 + safe);
  }
});
test('snap release respects position and bounded directional velocity', () => {
  const points = orderSnapPoints(932);
  assert.equal(settleOrderSnap(520, 0, points), 0);
  assert.equal(settleOrderSnap(550, 0, points), 1);
  assert.equal(settleOrderSnap(400, -1, points), 0);
  assert.equal(settleOrderSnap(660, 1, points), 1);
  assert.equal(settleOrderSnap(760, 100, points), 1);
  assert.equal(settleOrderSnap(300, -100, points), 0);
});
