// Same controller anatomy and value motion as the desktop CartPage.
import { type MouseEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { purchaseMotion } from './purchase-motion';

export function CartValue({ value, children = value }: { value: number; children?: ReactNode }) {
  const reduced = !!useReducedMotion();
  return <span className="cart-value">
    <span className="cart-value-sizer" aria-hidden="true">{children}</span>
    <span className="catalog-sr-only">{children}</span>
    <AnimatePresence initial={false}><motion.span key={value} className="cart-value-layer" aria-hidden="true"
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -4 }}
      transition={reduced ? { duration: 0 } : purchaseMotion.value}>{children}</motion.span></AnimatePresence>
  </span>;
}

export function CartQuantity({ title, quantity, onChange }: {
  title: string; quantity: number; onChange: (delta: number, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const reduced = !!useReducedMotion();
  return <div className="mobile-cart-quantity" role="group" aria-label={`Quantity for ${title}`}>
    <button className="cart-decrease" type="button" aria-label={quantity === 1 ? `Remove ${title} from cart` : `Decrease quantity of ${title}`} onClick={event => onChange(-1, event)}>
      <span className="catalog-icon-window" aria-hidden="true"><AnimatePresence initial={false}>
        <motion.span key={quantity === 1 ? 'trash' : 'minus'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : purchaseMotion.value}>
          <img src={`/assets/catalog/${quantity === 1 ? 'trash' : 'minus'}.svg`} alt="" />
        </motion.span>
      </AnimatePresence></span>
    </button>
    <output aria-live="polite" aria-label={`Quantity of ${title}`}><CartValue value={quantity} /></output>
    <button type="button" aria-label={`Increase quantity of ${title}`} onClick={event => onChange(1, event)}><img className="cart-plus" src="/assets/catalog/plus.svg" alt="" /></button>
  </div>;
}
