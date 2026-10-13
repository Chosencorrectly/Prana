// Port of the desktop promo controller: identical timing, code and cancellation.
export const promoTiming = { debounce: 400, validation: 650 };
export type PromoStatus = 'idle' | 'debouncing' | 'validating' | 'applied' | 'invalid';
export type PromoState = { value: string; status: PromoStatus };
export const emptyPromo: PromoState = { value: '', status: 'idle' };
type Scheduler = { schedule: (callback: () => void, delay: number) => unknown; cancel: (handle: unknown) => void };
export function createPromoController(onState: (state: PromoState) => void, { schedule = setTimeout, cancel = handle => clearTimeout(handle as ReturnType<typeof setTimeout>) }: Partial<Scheduler> = {}) {
  let revision = 0, timer: unknown, disposed = false;
  function setValue(value: string, { composing = false } = {}) {
    if (disposed) return;
    const current = ++revision;
    cancel(timer);
    const code = value.trim();
    onState({ value, status: code && !composing ? 'debouncing' : 'idle' });
    if (!code || composing) return;
    timer = schedule(() => {
      if (disposed || current !== revision) return;
      onState({ value, status: 'validating' });
      timer = schedule(() => {
        if (disposed || current !== revision) return;
        onState({ value, status: code === '1111' ? 'applied' : 'invalid' });
      }, promoTiming.validation);
    }, promoTiming.debounce);
  }
  return { setValue, clear: () => setValue(''), dispose() { disposed = true; revision++; cancel(timer); } };
}
export function checkoutTotals(subtotalCents: number, status: PromoStatus) {
  const discountCents = status === 'applied' ? Math.round(subtotalCents * .1) : 0;
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}
