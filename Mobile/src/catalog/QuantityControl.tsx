// TypeScript/mobile adaptation of the approved desktop QuantityControl.
import { useLayoutEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { money, type Product } from './catalog-model';
import { purchaseMotion } from './purchase-motion';

const icon = (name: string) => <img className={`purchase-icon icon-${name}`} src={`/assets/catalog/${name}.svg`} alt="" aria-hidden="true" />;
function PurchaseState({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const present = useIsPresent();
  return <motion.div className="catalog-purchase-state" inert={!present} aria-hidden={!present || undefined}
    initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: reduced ? 0 : -4, transition: reduced ? { duration: 0 } : purchaseMotion.exit }}
    transition={reduced ? { duration: 0 } : purchaseMotion.enter}>{children}</motion.div>;
}
export function QuantityControl({ product, quantity, large, detail = false, onChange }: {
  product: Product; quantity: number; large: boolean; detail?: boolean; onChange: (id: string, delta: number) => void;
}) {
  const reduced = !!useReducedMotion();
  const [direction, setDirection] = useState(1);
  const addRef = useRef<HTMLButtonElement>(null), plusRef = useRef<HTMLButtonElement>(null);
  const focusAfterChange = useRef<'add' | 'plus' | null>(null);
  useLayoutEffect(() => {
    if (focusAfterChange.current) (focusAfterChange.current === 'add' ? addRef : plusRef).current?.focus({ preventScroll: true });
    focusAfterChange.current = null;
  }, [quantity]);
  const change = (delta: number, event: MouseEvent<HTMLButtonElement>) => {
    setDirection(delta);
    if (event.currentTarget.matches(':focus-visible')) {
      if (quantity === 0) focusAfterChange.current = 'plus';
      else if (quantity === 1 && delta < 0) focusAfterChange.current = 'add';
    }
    onChange(product.id, delta);
  };
  const buttonMotion = {
    initial: { opacity: 0, scale: reduced ? 1 : 0.94 }, animate: { opacity: 1, scale: 1 },
    transition: reduced ? { duration: 0 } : purchaseMotion.enter,
  };
  const total = money(product.priceCents * quantity);
  return <div className={`catalog-purchase${detail ? ' dish-purchase' : ''}`} data-quantity={quantity}>
    <AnimatePresence initial={false}>
      {quantity === 0 ? <PurchaseState key="empty" reduced={reduced}>
        <button ref={addRef} className="catalog-add" type="button" onClick={event => change(1, event)} aria-label={`Add ${product.name} to cart for ${money(product.priceCents)}`}>
          {detail ? <img className="purchase-icon" src="/assets/dish/basket.svg" alt="" aria-hidden="true" /> : icon(large ? 'basket-dark' : 'basket')}<span className="catalog-price"><span>{detail ? 'Add to Cart' : 'From'}</span> {money(product.priceCents)}</span>
        </button>
      </PurchaseState> : <PurchaseState key="filled" reduced={reduced}>
        <div className="catalog-quantity" role="group" aria-label={`Quantity for ${product.name}`}>
          <motion.button {...buttonMotion} type="button" onClick={event => change(-1, event)} aria-label={quantity === 1 ? `Remove ${product.name} from cart` : `Decrease quantity of ${product.name}`}>
            <span className="catalog-icon-window" aria-hidden="true"><AnimatePresence initial={false}>
              <motion.span key={quantity === 1 ? 'trash' : 'minus'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : purchaseMotion.value}>
                {icon(quantity === 1 ? 'trash' : 'minus')}
              </motion.span>
            </AnimatePresence></span>
          </motion.button>
          <output className="catalog-quantity-summary" aria-live="polite" aria-atomic="true">
            <span className="catalog-sr-only">{quantity} {quantity === 1 ? 'item' : 'items'}, {total}</span>
            <span className="catalog-value-window" aria-hidden="true"><AnimatePresence initial={false} custom={direction}>
              <motion.span key={quantity} custom={direction} className="catalog-value"
                variants={{ enter: (sign: number) => ({ opacity: 0, y: reduced ? 0 : sign * 4 }), visible: { opacity: 1, y: 0 }, exit: (sign: number) => ({ opacity: 0, y: reduced ? 0 : -sign * 4 }) }}
                initial="enter" animate="visible" exit="exit" transition={reduced ? { duration: 0 } : purchaseMotion.value}>
                <span>{quantity} {quantity === 1 ? 'item' : 'items'}</span><span>{total}</span>
              </motion.span>
            </AnimatePresence></span>
          </output>
          <motion.button {...buttonMotion} ref={plusRef} type="button" onClick={event => change(1, event)} aria-label={`Increase quantity of ${product.name}`}>{icon('plus')}</motion.button>
        </div>
      </PurchaseState>}
    </AnimatePresence>
  </div>;
}
