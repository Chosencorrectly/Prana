import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { getProductDetails } from "../data/product-details.js";
import { motion as timings } from "../motion/tokens.js";
import { isPlainClick } from "../navigation/useNavigation.js";
import { Icon } from "./Icon.jsx";
import { ClearCartDialog } from "./ClearCartDialog.jsx";
import { AnimatedValue } from "./AnimatedValue.jsx";
import { PromoCodeField } from "./PromoCodeField.jsx";

const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

function CartState({ children }) {
  const reduced = useReducedMotion();
  const present = useIsPresent();
  return <motion.div className="cart-state" inert={!present} aria-hidden={!present || undefined}
    initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, transition: reduced ? { duration: 0 } : timings.cartStateExit }}
    transition={reduced ? { duration: 0 } : timings.cartStateEnter}>{children}</motion.div>;
}

function CartItem({ product, quantity, onChange }) {
  const details = getProductDetails(product);
  const reduced = useReducedMotion();
  const present = useIsPresent();
  return <motion.li className="cart-item" data-product-id={product.id} inert={!present} aria-hidden={!present || undefined}
    layout={reduced ? false : "position"} initial={false} exit={{ opacity: 0 }}
    transition={reduced ? { duration: 0 } : { ...timings.cartStateExit, layout: timings.cartStateEnter }}>
    <img className="cart-item-photo" src={`/assets/${product.image}`} alt={product.imageAlt} width="104" height="104" />
    <div className="cart-item-information">
      <h2>{details.title}</h2>
      <p className="cart-item-options" title={details.summary}>{details.summary}</p>
      <p>{money(product.priceCents)} each</p>
      <button className="cart-edit" type="button" disabled>Edit</button>
    </div>
    <div className="cart-item-purchase">
      <p className="cart-item-total"><AnimatedValue value={product.priceCents * quantity}>{money(product.priceCents * quantity)}</AnimatedValue></p>
      <div className="cart-quantity" role="group" aria-label={`Quantity for ${details.title}`}>
        <button className="quantity-button quantity-decrease" type="button" onClick={(event) => onChange(-1, event)}
          aria-label={quantity === 1 ? `Remove ${details.title} from cart` : `Decrease quantity of ${details.title}`}>
          <span className="quantity-icon-window" aria-hidden="true"><AnimatePresence initial={false}>
            <motion.span key={quantity === 1 ? "trash" : "minus"} className="quantity-icon-state"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : timings.quantityChange}>
              <Icon name={quantity === 1 ? "trash" : "minus"} />
            </motion.span>
          </AnimatePresence></span>
        </button>
        <output aria-live="polite" aria-label={`Quantity of ${details.title}`}><AnimatedValue value={quantity} /></output>
        <button className="quantity-button quantity-increase" type="button" onClick={(event) => onChange(1, event)} aria-label={`Increase quantity of ${details.title}`}><Icon name="plus" /></button>
      </div>
    </div>
  </motion.li>;
}

function CartSummary({ cart, promo, onCheckout }) {
  const reduced = useReducedMotion();
  return <aside className="cart-summary" aria-labelledby="cart-summary-title">
    <h2 id="cart-summary-title">Order summary</h2>
    <PromoCodeField promo={promo} />
    <div className="cart-divider" />
    <dl className="cart-calculation">
      <div><dt>Subtotal · {cart.quantity} {cart.quantity === 1 ? "item" : "items"}</dt><dd><AnimatedValue value={cart.subtotalCents}>{money(cart.subtotalCents)}</AnimatedValue></dd></div>
      <AnimatePresence initial={false}>
        {cart.discountCents > 0 && <motion.div key="discount" className="cart-discount"
          initial={{ opacity: reduced ? 1 : 0, height: reduced ? "auto" : 0, marginTop: reduced ? 16 : 0 }} animate={{ opacity: 1, height: "auto", marginTop: 16 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={reduced ? { duration: 0 } : timings.quantityChange}>
          <dt>Discount · 10%</dt><dd>−{money(cart.discountCents)}</dd>
        </motion.div>}
      </AnimatePresence>
      <div><dt>Delivery</dt><dd>Free</dd></div>
    </dl>
    <div className="cart-divider" />
    <div className="cart-total" aria-live="polite" aria-atomic="true"><span>Total</span><strong><AnimatedValue value={cart.totalCents}>{money(cart.totalCents)}</AnimatedValue></strong></div>
    <a className="cart-button cart-checkout" href="/checkout" onClick={(event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault(); onCheckout();
    }}>Proceed to checkout</a>
  </aside>;
}

function EmptyCart({ onBrowse }) {
  const titleRef = useRef(null);
  useLayoutEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, []);
  return <section className="cart-empty" aria-labelledby="cart-empty-title">
    <img src="/assets/cart-empty-bag.png" alt="" width="80" height="80" />
    <h2 ref={titleRef} id="cart-empty-title" tabIndex={-1}>It's empty for now</h2>
    <a className="cart-button cart-button-primary cart-browse" href="/" onClick={(event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault(); onBrowse();
    }}>Add food to cart</a>
  </section>;
}

export function CartPage({ cart, promo, onQuantityChange, onClear, onBack, onBrowse, onCheckout }) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const focusAfterRemoval = useRef(null);
  const empty = cart.items.length === 0;
  useLayoutEffect(() => {
    if (focusAfterRemoval.current) {
      document.querySelector(`[data-product-id="${focusAfterRemoval.current}"] .quantity-decrease`)?.focus({ preventScroll: true });
      focusAfterRemoval.current = null;
    }
  }, [cart.items.length]);
  function changeItem(item, index, delta, event) {
    if (item.quantity === 1 && delta < 0 && event.currentTarget.matches(":focus-visible")) {
      focusAfterRemoval.current = (cart.items[index + 1] ?? cart.items[index - 1])?.product.id;
    }
    onQuantityChange(item.product.id, delta);
  }
  return <main className="page-container cart-page">
    <a className="back-to-menu" href="/" onClick={(event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault(); onBack();
    }}>Back to menu</a>
    <div className="cart-heading">
      <h1 className="cart-title" tabIndex={-1}>Cart</h1>
      {!empty && <button className="cart-clear" type="button" onClick={() => setConfirmationOpen(true)}>
        <Icon name="cart-trash" /><span>Clear cart</span>
      </button>}
    </div>
    <AnimatePresence initial={false} mode="wait">
      {empty ? <CartState key="empty"><EmptyCart onBrowse={onBrowse} /></CartState> : <CartState key="filled">
        <div className="cart-layout">
          <ul className="cart-items" aria-label="Cart items"><AnimatePresence initial={false}>
            {cart.items.map((item, index) => <CartItem key={item.product.id} {...item} onChange={(delta, event) => changeItem(item, index, delta, event)} />)}
          </AnimatePresence></ul>
          <CartSummary cart={cart} promo={promo} onCheckout={onCheckout} />
        </div>
      </CartState>}
    </AnimatePresence>
    {confirmationOpen && <ClearCartDialog onCancel={() => setConfirmationOpen(false)} onConfirm={() => {
      setConfirmationOpen(false);
      onClear();
    }} />}
  </main>;
}
