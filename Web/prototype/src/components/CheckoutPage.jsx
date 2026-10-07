import { getProductDetails } from "../data/product-details.js";
import { isPlainClick } from "../navigation/useNavigation.js";
import { AnimatedValue } from "./AnimatedValue.jsx";
import { PromoCodeField } from "./PromoCodeField.jsx";
import { SwitchThumb } from "./SwitchThumb.jsx";

const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

function BackToCart({ onBack }) {
  return <a className="back-to-menu" href="/cart" onClick={(event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault(); onBack();
  }}><span className="icon back-to-menu-arrow" aria-hidden="true" />Back to cart</a>;
}

function PreviewField({ label, value, multiline = false }) {
  return <label className="checkout-field">
    <span className="checkout-label">{label}</span>
    {multiline ? <textarea className="checkout-input" value={value} readOnly rows={3} /> : <input className="checkout-input" value={value} readOnly />}
  </label>;
}

function OrderDetails({ cart }) {
  return <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
    <h2 id="checkout-summary-title">Order details</h2>
    <div className="cart-divider" />
    <ul className="checkout-items" aria-label="Order items">
      {cart.items.map(({ product, quantity }) => {
        const details = getProductDetails(product);
        return <li key={product.id}>
          <div className="checkout-item-copy"><h3>{details.title}</h3><p>{details.summary}</p></div>
          <div className="checkout-item-price"><span>{quantity} ×</span><strong>{money(product.priceCents * quantity)}</strong></div>
        </li>;
      })}
    </ul>
    {!cart.items.length && <p className="checkout-no-items">Your cart is empty</p>}
    <div className="cart-divider" />
    <dl className="cart-calculation checkout-calculation">
      <div><dt>Subtotal · {cart.quantity} {cart.quantity === 1 ? "item" : "items"}</dt><dd>{money(cart.subtotalCents)}</dd></div>
      <div><dt>Delivery · <span className="checkout-free">free</span></dt><dd className="checkout-muted">$0</dd></div>
      <div><dt>Discount</dt><dd><AnimatedValue value={cart.discountCents}>−{money(cart.discountCents)}</AnimatedValue></dd></div>
      <div><dt>Accrual bonuses</dt><dd>+$2</dd></div>
    </dl>
    <div className="cart-divider" />
    <div className="cart-total checkout-total" aria-live="polite" aria-atomic="true"><span>Total</span><strong><AnimatedValue value={cart.totalCents}>{money(cart.totalCents)}</AnimatedValue></strong></div>
  </aside>;
}

// The supplied Figma values are visual examples. Only navigation and the shared
// promo field work here; delivery, loyalty, payment and order submission are deferred.
export function CheckoutPage({ cart, promo, onBack }) {
  return <main className="page-container checkout-page">
    <BackToCart onBack={onBack} />
    <div className="checkout-layout">
      <section className="checkout-form" aria-labelledby="checkout-title">
        <h1 id="checkout-title" className="checkout-title" tabIndex={-1}>Delivery</h1>
        <div className="checkout-delivery-tabs" role="group" aria-label="Delivery method">
          <button type="button" aria-pressed="true" aria-disabled="true">Delivery</button>
          <button type="button" aria-pressed="false" aria-disabled="true">Pickup</button>
        </div>
        <div className="checkout-contact-fields">
          <div className="checkout-field-row">
            <PreviewField label="Name" value="Alex" />
            <PreviewField label="Phone" value="+625585854455" />
          </div>
          <div className="checkout-field-row">
            <PreviewField label="Address" value="Jl. Raya Padonan No.41a, Tibubeneng..." />
            <button className="checkout-leave" type="button" role="switch" aria-checked="true" aria-disabled="true">
              <span>Leave at the door</span><SwitchThumb />
            </button>
          </div>
          <PreviewField label="Note for courier" value="Leave at the gate, call on arrival" multiline />
        </div>
        <fieldset className="checkout-time">
          <legend className="checkout-label">Delivery time</legend>
          <div className="checkout-time-options">
            {["As soon as possible", "11:20 - 12:30 PM", "11:20 - 12:30 PM", "Another time"].map((label, index) =>
              <button key={index} type="button" aria-pressed={index === 0} aria-disabled="true">{label}</button>)}
          </div>
        </fieldset>
        <div className="checkout-promo-section">
          <div className="cart-divider" />
          <PromoCodeField promo={promo} />
        </div>
        <section className="checkout-bonuses" aria-label="Prana points">
          <div className="checkout-points-top">
            <span className="checkout-points-icon"><img src="/assets/checkout-points-mark.svg" alt="" width="20" height="20" /></span>
            <div className="checkout-points-balance"><strong>476</strong><span>Prana points</span></div>
            <button type="button" className="cart-button cart-button-primary" aria-disabled="true">Apply</button>
          </div>
          <div className="cart-divider" />
          <div className="checkout-points-bottom"><p>Apply 300 Prana Points<br />and save $20 on this order.</p><span>Valid until June 7</span></div>
        </section>
        <fieldset className="checkout-payment">
          <legend className="checkout-label">Payment method</legend>
          <div className="checkout-payment-options">
            {[0, 1, 2].map((index) => <button key={index} type="button" aria-label={`Mastercard ending in 4344, card ${index + 1}`} aria-pressed={index === 0} aria-disabled="true">
              <img src="/assets/checkout-mastercard.svg" alt="" width="22" height="14" /><span>*4344</span>
            </button>)}
            <button type="button" className="checkout-add-card" aria-disabled="true">+ Add card</button>
          </div>
        </fieldset>
        <div className="checkout-actions">
          <BackToCart onBack={onBack} />
          <button className="cart-button cart-checkout checkout-place-order" type="button" aria-disabled="true">
            Place order <AnimatedValue value={cart.totalCents}>{money(cart.totalCents)}</AnimatedValue>
          </button>
        </div>
      </section>
      <OrderDetails cart={cart} />
    </div>
  </main>;
}
