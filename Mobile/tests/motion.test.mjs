import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStep, createStepTimeline, stepTiming } from '../src/mobile/step-motion.ts';
import { authStep } from '../src/auth-motion.ts';

const signIn = { id: 'sign-in' }, phone = { id: 'phone' }, code = { id: 'code' };
const start = () => ({ stack: [signIn], scenes: [signIn], direction: 1, revision: 0 });
const push = (state, screen) => advanceStep(state, { type: 'push', screen });
const pop = state => advanceStep(state, { type: 'pop' });

test('double tap cannot duplicate a step or restart its pending focus', () => {
  const first = push(start(), phone);
  assert.equal(push(first, { ...phone }), first);
  assert.deepEqual(first.stack, [signIn, phone]);
});
test('quick forward/back/forward reuses the same scene and one form instance', () => {
  const first = push(start(), phone);
  const back = pop(first);
  const again = push(back, { ...phone });
  assert.equal(back.direction, -1);
  assert.equal(again.direction, 1);
  assert.equal(again.stack[1], first.stack[1]);
  assert.equal(again.scenes.length, 2);
});
test('return to an existing step unwinds the stack; root Back is a no-op', () => {
  const state = push(push(start(), phone), code);
  const back = push(state, phone);
  assert.deepEqual(back.stack, [signIn, phone]);
  assert.equal(back.direction, -1);
  const root = pop(back);
  assert.equal(pop(root), root);
});
test('splash replacement does not leave a navigable loading screen', () => {
  const splash = { id: 'splash' };
  const state = advanceStep({ stack: [splash], scenes: [splash], direction: 1, revision: 0 }, { type: 'replace', screen: signIn });
  assert.deepEqual(state.stack, [signIn]);
  assert.equal(pop(state), state);
});
test('completing authorization keeps the outgoing scene for motion but clears navigable auth history', () => {
  const authorized = push(push(start(), phone), code);
  const catalog = { id: 'catalog' };
  const state = advanceStep(authorized, { type: 'reset', screen: catalog });
  assert.deepEqual(state.stack, [catalog]);
  assert.ok(state.scenes.includes(code));
  assert.equal(state.direction, 1);
  assert.equal(pop(state), state);
  assert.equal(advanceStep(state, { type: 'reset', screen: catalog }), state);
  const sameTop = advanceStep(authorized, { type: 'reset', screen: code });
  assert.deepEqual(sameTop.stack, [code]);
  assert.equal(pop(sameTop), sameTop);
});
test('focus cancellation rejects even an already-queued callback after Back', () => {
  const queued = [], calls = [];
  const timeline = createStepTimeline(callback => { queued.push(callback); return queued.length; }, () => {});
  timeline.start([{ at: 180, run: () => calls.push('phone focus') }, { at: 440, run: () => calls.push('phone complete') }]);
  timeline.start([{ at: 320, run: () => calls.push('sign-in complete') }]);
  queued.forEach(callback => callback());
  assert.deepEqual(calls, ['sign-in complete']);
});
test('unmount cancellation clears every remaining timer and prevents focus', () => {
  const queued = [], cleared = [];
  const timeline = createStepTimeline(callback => { queued.push(callback); return queued.length; }, handle => cleared.push(handle));
  let focused = false;
  timeline.start([{ at: 180, run: () => { focused = true; } }, { at: 440, run: () => {} }]);
  timeline.cancel();
  queued.forEach(callback => callback());
  assert.equal(focused, false);
  assert.deepEqual(cleared, [1, 2]);
});
test('field-to-field transfer focuses immediately, with no second keyboard entrance', () => {
  const timing = stepTiming(authStep, false, true);
  const calls = [];
  createStepTimeline(() => {}).start([{ at: timing.focusMs, run: () => calls.push('transfer') }]);
  assert.deepEqual(calls, ['transfer']);
  assert.equal(timing.endMs, 320);
  assert.equal(stepTiming(authStep, false, false).endMs, 440);
});
test('reduced motion has no travel, delayed focus or long entrance', () => {
  for (const keyboardOpen of [false, true]) {
    const timing = stepTiming(authStep, true, keyboardOpen);
    assert.equal(timing.distance, 0);
    assert.equal(timing.focusMs, 0);
    assert.equal(timing.enterDelayMs, 0);
    assert.ok(timing.endMs <= 100 && timing.enterMs <= 100 && timing.exitMs <= 100);
  }
});
