export const promoTiming = { debounce: 400, validation: 650 };
export const emptyPromo = { value: "", status: "idle" };

// Local simulation only. Revision checks also reject already-queued stale callbacks.
export function createPromoController(onState, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  let revision = 0;
  let timer;
  let disposed = false;
  function setValue(value, { composing = false } = {}) {
    if (disposed) return;
    const current = ++revision;
    cancel(timer);
    const code = value.trim();
    onState({ value, status: code && !composing ? "debouncing" : "idle" });
    if (!code || composing) return;
    timer = schedule(() => {
      if (disposed || current !== revision) return;
      onState({ value, status: "validating" });
      timer = schedule(() => {
        if (disposed || current !== revision) return;
        onState({ value, status: code === "1111" ? "applied" : "invalid" });
      }, promoTiming.validation);
    }, promoTiming.debounce);
  }
  return {
    setValue,
    clear: () => setValue(""),
    dispose() { disposed = true; revision++; cancel(timer); },
  };
}
