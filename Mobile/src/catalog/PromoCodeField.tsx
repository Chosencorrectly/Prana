import { useLayoutEffect, useRef } from 'react';
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { KeyboardInput, useKeyboard, useMobileDevice, useScreenPortal } from '../mobile';
import type { PromoCode } from './usePromoCode';

export function PromoCodeField({ promo }: { promo: PromoCode }) {
  const composing = useRef(false), keyboard = useKeyboard(), reduced = !!useReducedMotion();
  const input = useRef<HTMLInputElement>(null), { device } = useMobileDevice(), { screenRef } = useScreenPortal();
  useLayoutEffect(() => {
    const field = input.current, viewport = field?.closest<HTMLElement>('.mobile-scroll'), screen = screenRef.current;
    if (!keyboard.visible || keyboard.focusedElement !== field || !field || !viewport || !screen) return;
    const scale = screen.getBoundingClientRect().width / device.geometry.screen.width;
    const screenTop = screen.getBoundingClientRect().top, viewportTop = (viewport.getBoundingClientRect().top - screenTop) / scale;
    const fieldCenter = (field.getBoundingClientRect().top - screenTop + field.offsetHeight * scale / 2) / scale;
    const clearBottom = device.geometry.screen.height - keyboard.fullHeight - 211 + device.geometry.safeArea.bottom;
    const target = Math.max(0, viewport.scrollTop + fieldCenter - (viewportTop + clearBottom) / 2);
    const scroll = animate(viewport.scrollTop, target, { duration: reduced ? 0 : .26, ease: [.2, .8, .2, 1], onUpdate: value => { viewport.scrollTop = value; } });
    const stop = () => scroll.stop();
    viewport.addEventListener('wheel', stop, { passive: true }); viewport.addEventListener('pointerdown', stop);
    return () => { stop(); viewport.removeEventListener('wheel', stop); viewport.removeEventListener('pointerdown', stop); };
  }, [keyboard.visible, keyboard.focusedElement, keyboard.fullHeight, device, screenRef, reduced]);
  const { value, status, setValue } = promo;
  const message = status === 'applied' ? 'Applied: -10%' : status === 'invalid' ? 'Promo code not found' : status === 'validating' ? 'Checking promo code' : '';
  return <div className="delivery-promo" data-status={status}>
    <span className="delivery-promo-icon"><img src="/assets/checkout/promo.svg" alt="" width="24" height="24" /></span>
    <KeyboardInput ref={input} aria-label="Promo code" placeholder="Promo code" value={value} autoComplete="off" autoCapitalize="none" spellCheck={false}
      aria-invalid={status === 'invalid'} aria-describedby="delivery-promo-status" aria-busy={status === 'validating'}
      onChange={event => setValue(event.target.value, { composing: composing.current })}
      onCompositionStart={() => { composing.current = true; setValue(value, { composing: true }); }}
      onCompositionEnd={event => { composing.current = false; setValue(event.currentTarget.value); }}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); keyboard.hide();
        event.currentTarget.closest('.checkout-host')?.querySelector<HTMLButtonElement>('.delivery-toolbar button')?.focus({ preventScroll: true });
      } }} />
    <span className="delivery-promo-feedback" aria-hidden="true"><AnimatePresence initial={false}>
      {message && <motion.span key={status} className={`delivery-promo-state promo-${status}`} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .15, ease: [0, 0, .38, .9] }}>
        {status === 'validating' ? <img className="delivery-promo-loader" src="/assets/checkout/promo-loader.svg" alt="" width="24" height="24" /> : message}
      </motion.span>}
    </AnimatePresence><span className="delivery-promo-sizer">{status === 'validating' ? <span className="delivery-loader-space" /> : message}</span></span>
    <span id="delivery-promo-status" className="catalog-sr-only" role="status">{message}</span>
  </div>;
}
