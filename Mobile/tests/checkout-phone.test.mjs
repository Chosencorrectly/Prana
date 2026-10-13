import test from 'node:test';
import assert from 'node:assert/strict';
import { initialPhoneVerification as empty, phoneVerificationReducer as reduce, CHECKOUT_RESEND_SECONDS, canConfirmPhone } from '../src/catalog/phone-verification.ts';

const typed = () => reduce(empty, { type: 'phone', value: '+1 (305) 555-0147' });
const sent = () => reduce(typed(), { type: 'send', now: 1000 });
test('default account is missing phone; incomplete input cannot start SMS', () => {
  assert.equal(empty.confirmedPhone, null);
  assert.equal(reduce(empty, { type: 'send', now: 1000 }), empty);
  assert.equal(typed().phone, '+13055550147');
});
test('only four-digit 1111 confirms the number actually sent', () => {
  let state = reduce(sent(), { type: 'code', value: '11' });
  assert.equal(reduce(state, { type: 'confirm' }), state);
  state = reduce(state, { type: 'code', value: '2222' });
  state = reduce(state, { type: 'confirm' });
  assert.equal(state.error, true); assert.equal(state.confirmedPhone, null);
  state = reduce(state, { type: 'code', value: '1a11199' });
  assert.equal(state.code, '1111'); assert.equal(state.error, false);
  assert.equal(canConfirmPhone(state), true);
  assert.equal(reduce(state, { type: 'confirm' }).confirmedPhone, '+13055550147');
});
test('editing the phone invalidates the old challenge and prevents stale confirmation', () => {
  let state = reduce(sent(), { type: 'code', value: '1111' });
  state = reduce(state, { type: 'phone', value: '+13055550148' });
  assert.equal(state.sentPhone, null); assert.equal(state.code, '');
  state = reduce(state, { type: 'code', value: '1111' });
  assert.equal(canConfirmPhone(state), false);
  assert.equal(reduce(state, { type: 'confirm' }).confirmedPhone, null);
});
test('back/continue and resend cannot bypass cooldown; permitted resend clears error and code', () => {
  let state = reduce(reduce(sent(), { type: 'code', value: '3333' }), { type: 'confirm' });
  for (const type of ['send', 'resend']) assert.equal(reduce(state, { type, now: state.deadline - 1 }), state);
  const now = state.deadline;
  state = reduce(state, { type: 'resend', now });
  assert.equal(state.code, ''); assert.equal(state.error, false);
  assert.equal(state.deadline, now + CHECKOUT_RESEND_SECONDS * 1000);
  assert.equal(state.phone, '+13055550147');
});
