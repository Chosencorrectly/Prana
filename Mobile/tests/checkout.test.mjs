import test from 'node:test';
import assert from 'node:assert/strict';
import { createPromoController, checkoutTotals } from '../src/catalog/promo-model.ts';

function harness() {
  let now = 0, next = 0;
  const jobs = new Map(), states = [];
  const controller = createPromoController(state => states.push(state), {
    schedule(fn, delay) { const id = ++next; jobs.set(id, { fn, at: now + delay }); return id; },
    cancel(id) { jobs.delete(id); },
  });
  return { controller, jobs, states, get state() { return states.at(-1); }, tick(ms) {
    const end = now + ms;
    while (true) {
      const job = [...jobs].filter(([, value]) => value.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!job) break;
      now = job[1].at; jobs.delete(job[0]); job[1].fn();
    }
    now = end;
  } };
}
test('typing uses the desktop 400ms pause and 650ms loader before applying the demo code', () => {
  const h = harness();
  h.controller.setValue('1'); h.tick(300); h.controller.setValue('1111');
  h.tick(399); assert.equal(h.state.status, 'debouncing');
  h.tick(1); assert.equal(h.state.status, 'validating');
  h.tick(649); assert.equal(h.state.status, 'validating');
  h.tick(1); assert.deepEqual(h.state, { value: '1111', status: 'applied' });
});
test('edited or cleared input cannot receive a stale success response', () => {
  const h = harness();
  h.controller.setValue('1111'); h.tick(400); const stale = [...h.jobs.values()][0].fn;
  h.controller.setValue('wrong'); stale(); h.tick(1050); assert.equal(h.state.status, 'invalid');
  h.controller.setValue('1111'); h.tick(400); const staleClear = [...h.jobs.values()][0].fn;
  h.controller.clear(); staleClear(); h.tick(2000); assert.deepEqual(h.state, { value: '', status: 'idle' });
});
test('IME waits for committed text and optional whitespace does not validate', () => {
  const h = harness();
  h.controller.setValue('1111', { composing: true }); h.tick(2000); assert.equal(h.state.status, 'idle');
  h.controller.setValue(' 1111 '); h.tick(1050); assert.equal(h.state.status, 'applied');
  h.controller.setValue('   '); h.tick(2000); assert.equal(h.state.status, 'idle'); assert.equal(h.jobs.size, 0);
});
test('disposing the checkout controller rejects pending and already queued responses', () => {
  const h = harness();
  h.controller.setValue('1111'); h.tick(400); const stale = [...h.jobs.values()][0].fn, count = h.states.length;
  h.controller.dispose(); stale(); h.controller.setValue('1111'); h.tick(2000);
  assert.equal(h.states.length, count); assert.equal(h.jobs.size, 0);
});
test('discount rounds once in cents, disappears immediately on editing, and follows changed quantities', () => {
  assert.deepEqual(checkoutTotals(3190, 'applied'), { subtotalCents: 3190, discountCents: 319, totalCents: 2871 });
  assert.equal(checkoutTotals(4985, 'applied').discountCents, 499);
  assert.equal(checkoutTotals(4785, 'applied').totalCents, 4306);
  for (const status of ['idle', 'debouncing', 'validating', 'invalid']) assert.equal(checkoutTotals(3190, status).totalCents, 3190);
  assert.equal(checkoutTotals(0, 'applied').totalCents, 0);
});
