import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { motion as timings } from "../motion/tokens.js";
import { Icon } from "./Icon.jsx";

const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const transition = (intent, reduced) => reduced ? { duration: 0 } : timings[intent];

function PurchaseState({ children, reduced, ...props }) {
  const present = useIsPresent();
  return (
    <motion.div {...props} className="purchase-state" inert={!present} aria-hidden={!present || undefined}
      initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -4, transition: transition("purchaseExit", reduced) }}
      transition={transition("purchaseEnter", reduced)}>
      {children}
    </motion.div>
  );
}

export function QuantityControl({ product, quantity = 0, onChange, variant = "preview" }) {
  const reduced = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const addRef = useRef(null);
  const plusRef = useRef(null);
  const focusAfterChange = useRef(null);

  useLayoutEffect(() => {
    if (focusAfterChange.current) {
      (focusAfterChange.current === "add" ? addRef : plusRef).current?.focus({ preventScroll: true });
      focusAfterChange.current = null;
    }
  }, [quantity]);

  function change(delta, event) {
    setDirection(delta);
    if (event.currentTarget.matches(":focus-visible")) {
      if (quantity === 0) focusAfterChange.current = "plus";
      else if (quantity === 1 && delta < 0) focusAfterChange.current = "add";
    }
    onChange(delta);
  }

  const buttonMotion = {
    initial: { opacity: 0, scale: reduced ? 1 : 0.94 },
    animate: { opacity: 1, scale: 1 },
    transition: transition("purchaseEnter", reduced),
  };
  const total = money(product.priceCents * quantity);
  return (
    <div className={`purchase-row${variant === "detail" ? " purchase-row-detail" : ""}`}>
      <AnimatePresence initial={false}>
        {quantity === 0 ? (
          <PurchaseState key="empty" reduced={reduced}>
            <button ref={addRef} className="add-button" type="button" onClick={(event) => change(1, event)}
              aria-label={`Add ${product.name} to cart for ${money(product.priceCents)}`}>
              <Icon name={variant === "detail" ? "header-basket" : "basket"} />{variant === "detail" ? <><span>Add to cart</span><span>{money(product.priceCents)}</span></> : <span className="button-price"><span>From</span> {money(product.priceCents)}</span>}
            </button>
          </PurchaseState>
        ) : (
          <PurchaseState key="filled" reduced={reduced}>
            <div className="quantity-control" role="group" aria-label={`Quantity for ${product.name}`}>
              <motion.button {...buttonMotion} className="quantity-button quantity-decrease" type="button"
                onClick={(event) => change(-1, event)}
                aria-label={quantity === 1 ? `Remove ${product.name} from cart` : `Decrease quantity of ${product.name}`}>
                <span className="quantity-icon-window" aria-hidden="true">
                  <AnimatePresence initial={false}>
                    <motion.span key={quantity === 1 ? "trash" : "minus"} className="quantity-icon-state"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={transition("quantityChange", reduced)}>
                      <Icon name={quantity === 1 ? "trash" : "minus"} />
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.button>
              <output className="quantity-summary" aria-live="polite" aria-atomic="true">
                <span className="sr-only">{quantity} {quantity === 1 ? "item" : "items"}, {total}</span>
                <span className="quantity-value-window" aria-hidden="true">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.span key={quantity} custom={direction} className="quantity-value"
                      variants={{ enter: (sign) => ({ opacity: 0, y: reduced ? 0 : sign * 4 }), visible: { opacity: 1, y: 0 }, exit: (sign) => ({ opacity: 0, y: reduced ? 0 : -sign * 4 }) }}
                      initial="enter" animate="visible" exit="exit" transition={transition("quantityChange", reduced)}>
                      <span>{quantity} {quantity === 1 ? "item" : "items"}</span><span className="quantity-total">{total}</span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </output>
              <motion.button {...buttonMotion} ref={plusRef} className="quantity-button quantity-increase" type="button"
                onClick={(event) => change(1, event)} aria-label={`Increase quantity of ${product.name}`}><Icon name="plus" /></motion.button>
            </div>
          </PurchaseState>
        )}
      </AnimatePresence>
    </div>
  );
}
