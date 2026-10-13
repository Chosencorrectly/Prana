import test from 'node:test';
import assert from 'node:assert/strict';
import { addressReducer as reduce, initialAddressBook as initial, addressSuggestions, deliveryAvailable, reverseDemoPoint, findAddresses } from '../src/catalog/address-model.ts';

test('selection and an unfinished add never change the committed delivery address', () => {
  let state = reduce(initial, { type: 'select', id: 'work' });
  state = reduce(state, { type: 'add' });
  state = reduce(state, { type: 'location', location: addressSuggestions[2] });
  state = reduce(state, { type: 'detail', field: 'unit', value: '2401' });
  assert.equal(state.current, initial.current);
  state = reduce(state, { type: 'begin' });
  assert.equal(state.selectedId, 'home'); assert.equal(state.draft, null); assert.equal(state.addresses.length, 2);
});
test('save selects a new profile address; only Deliver here commits it', () => {
  let state = reduce(initial, { type: 'add' });
  state = reduce(state, { type: 'location', location: addressSuggestions[2] });
  state = reduce(state, { type: 'detail', field: 'label', value: ' Work ' });
  state = reduce(state, { type: 'detail', field: 'instructions', value: 'Meet at reception' });
  state = reduce(state, { type: 'save' });
  assert.equal(state.addresses.length, 3); assert.equal(state.selectedId, 'address-1');
  assert.equal(state.current, initial.current); assert.equal(state.draft, null);
  state = reduce(state, { type: 'deliver' });
  assert.equal(state.current.location.street, '1000 Brickell Plaza');
  assert.equal(state.current.details.label, 'Work'); assert.equal(state.current.details.instructions, 'Meet at reception');
});
test('editing a saved active address is isolated until Save and Deliver here', () => {
  let state = reduce(initial, { type: 'edit', id: 'home' });
  state = reduce(state, { type: 'detail', field: 'unit', value: 'B2' });
  state = reduce(state, { type: 'location', location: addressSuggestions[0] });
  assert.equal(state.draft.details.unit, 'B2');
  state = reduce(state, { type: 'save' });
  assert.equal(state.addresses.length, 2); assert.equal(state.current.details.unit, '');
  assert.equal(state.current.location.street, initial.current.location.street);
  state = reduce(state, { type: 'deliver' });
  assert.equal(state.current.details.unit, 'B2'); assert.equal(state.current.location.street, '701 Brickell Ave');
});
test('pin coordinates govern availability independently of the reverse-geocoded label', () => {
  const point = reverseDemoPoint({ x: 640, y: 466 });
  assert.ok(point.street); assert.equal(deliveryAvailable(point), false);
  let state = reduce(initial, { type: 'add' });
  state = reduce(state, { type: 'location', location: point });
  assert.equal(reduce(state, { type: 'save' }), state);
  assert.equal(deliveryAvailable(reverseDemoPoint({ x: 609, y: 466 })), true);
  assert.equal(deliveryAvailable(reverseDemoPoint({ x: NaN, y: 466 })), false);
});
test('local search handles case, words and no matches; unique IDs survive repeated saves', () => {
  assert.equal(findAddresses('  BRICKELL   Miami ').length, 6);
  assert.equal(findAddresses('1000 plaza')[0].street, '1000 Brickell Plaza');
  assert.equal(findAddresses('zzzzz').length, 0);
  let state = initial;
  for (let i = 0; i < 3; i++) state = reduce(reduce(state, { type: 'add' }), { type: 'save' });
  assert.equal(new Set(state.addresses.map(address => address.id)).size, 5);
  assert.equal(state.current, initial.current);
});
