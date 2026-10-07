import { lazy, Suspense } from "react";
import { AnimatedValue } from "./AnimatedValue.jsx";
import { SwitchThumb } from "./SwitchThumb.jsx";
import { getProductDetails } from "../data/product-details.js";
import { detailsChanged, formatBirthDate } from "../data/profile.js";

const BirthDatePicker = lazy(() => import("./BirthDatePicker.jsx").then((module) => ({ default: module.BirthDatePicker })));

const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const orderDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const orderTime = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

function PersonalDetails({ profile, dispatch }) {
  const dirty = detailsChanged(profile.draft, profile.saved);
  const label = profile.status === "saved" ? "Saved" : "Save changes";
  const edit = (field, value) => dispatch({ type: "edit", field, value });
  return <section className="profile-personal" aria-labelledby="personal-title">
    <h2 id="personal-title">Personal details</h2>
    <form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "save" }); }}>
      <div className="profile-fields">
        <label className="checkout-field"><span className="checkout-label">Name</span>
          <input className="checkout-input" autoComplete="given-name" name="name" required pattern=".*\S.*" maxLength={80} value={profile.draft.name} onChange={(event) => edit("name", event.target.value)} /></label>
        <Suspense fallback={<div className="checkout-field" aria-busy="true"><span className="checkout-label">Date of birth</span><div className="checkout-input birthday-trigger">{formatBirthDate(profile.draft.birthDate)}</div></div>}>
          <BirthDatePicker value={profile.draft.birthDate} onChange={(value) => edit("birthDate", value)} />
        </Suspense>
        <label className="checkout-field"><span className="checkout-label">Phone</span>
          <input className="checkout-input" type="tel" autoComplete="tel" name="phone" required pattern=".*\S.*" maxLength={30} value={profile.draft.phone} onChange={(event) => edit("phone", event.target.value)} /></label>
        <label className="checkout-field"><span className="checkout-label">Email</span>
          <input className="checkout-input" type="email" autoComplete="email" name="email" required maxLength={120} value={profile.draft.email} onChange={(event) => edit("email", event.target.value)} /></label>
      </div>
      <button type="submit" className="profile-button profile-save" aria-disabled={!dirty} onClick={(event) => { if (!dirty) event.preventDefault(); }} data-state={dirty ? "dirty" : profile.status}>
        <AnimatedValue value={label}>{label}</AnimatedValue>
      </button>
      <span className="sr-only" role="status">{profile.status === "saved" ? "Personal details saved" : ""}</span>
    </form>
  </section>;
}

function OrderCard({ order }) {
  return <article className="profile-order" aria-label={`Delivered order, ${orderDate.format(order.date)}`}>
    <p className="profile-order-date"><span>Delivered</span> <time dateTime={order.date.toISOString()}>{orderDate.format(order.date)} · {orderTime.format(order.date)}</time></p>
    <p className="profile-order-address"><span><img src="/assets/profile-home.svg" alt="" width="16" height="16" />Home</span>Jl. Raya Padonan No.41a, Tibubeneng</p>
    <div className="profile-order-divider" />
    <p className="profile-order-total"><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>Total: {money(order.totalCents)}</p>
    <div className="profile-order-products">
      {order.items.map(({ product, quantity }) => <div className="profile-order-product" key={product.id}>
        <img src={`/assets/${product.image}`} alt="" width="70" height="70" loading="lazy" />
        <div><h3>{getProductDetails(product).title}</h3><p>{quantity} × {money(product.priceCents)}</p></div>
      </div>)}
    </div>
    <button className="profile-button profile-reorder" type="button" aria-disabled="true">Reorder</button>
  </article>;
}

function AccountExtras() {
  return <aside className="profile-extras" aria-label="Prana app and points">
    <div className="profile-app">
      <h2>Get more in<br />the Prana app</h2>
      <p>Track orders, manage rewards<br />and get app-only offers.</p>
      <div className="profile-store-links">
        <a className="profile-button" href="https://apps.apple.com/us/app/id6803918738" target="_blank" rel="noreferrer"><img src="/assets/profile-appstore.svg" alt="" width="24" height="24" />Download for iOS</a>
        <a className="profile-button" href="https://play.google.com/store/apps/details?id=kitchen.prana.app" target="_blank" rel="noreferrer"><img src="/assets/profile-google-play.svg" alt="" width="24" height="24" />Download for Android</a>
      </div>
    </div>
    <div className="profile-points">
      <span className="checkout-points-icon"><img src="/assets/profile-points.svg" alt="" width="20" height="20" /></span>
      <div><strong>476</strong><span>Prana points</span></div><p>Valid until June 7</p>
    </div>
  </aside>;
}

export function ProfilePage({ profile, dispatch, orders }) {
  return <main className="page-container profile-page">
    <div className="profile-main">
      <h1 className="profile-title" tabIndex={-1}>Account</h1>
      <PersonalDetails profile={profile} dispatch={dispatch} />
      <section className="profile-section" aria-labelledby="orders-title">
        <h2 id="orders-title">Your orders</h2>
        <div className="profile-orders">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
        <button className="profile-button profile-section-action" type="button" aria-disabled="true">View all orders</button>
      </section>
      <section className="profile-section" aria-labelledby="addresses-title">
        <h2 id="addresses-title">Delivery addresses</h2>
        <div className="profile-addresses">{[1, 2].map((index) => <button type="button" className="profile-address" key={index} aria-label={`Edit home address ${index}`} aria-disabled="true">
          <span><span className="profile-address-line">Jl. Raya Padonan No.41a, Tibubeneng...</span><span className="profile-address-type"><img src="/assets/profile-address-home.svg" alt="" width="13" height="13" />Home</span></span>
          <img src="/assets/profile-edit.svg" alt="" width="24" height="24" />
        </button>)}</div>
        <button className="profile-button profile-section-action" type="button" aria-disabled="true">Add address</button>
      </section>
      <section className="profile-section" aria-labelledby="payment-title">
        <h2 id="payment-title">Payment method</h2>
        <div className="profile-payment-options">
          {[0, 1, 2].map((index) => <div className="profile-payment-card" data-selected={index === 0} key={index}>
            <img src="/assets/checkout-mastercard.svg" alt="Mastercard" width="22" height="14" /><span>*4344</span>
            <button type="button" aria-label={`Remove card ${index + 1} ending in 4344`} aria-disabled="true"><span className="profile-trash" aria-hidden="true" /></button>
          </div>)}
          <button type="button" className="profile-button profile-add-card" aria-disabled="true">+ Add card</button>
        </div>
      </section>
      <section className="profile-section" aria-labelledby="marketing-title">
        <h2 id="marketing-title">Marketing preferences</h2>
        <button type="button" className="profile-marketing" role="switch" aria-checked={profile.marketing} onClick={() => dispatch({ type: "marketing" })}>
          <span>Receive promotions and offers via push, SMS and email</span><SwitchThumb checked={profile.marketing} />
        </button>
      </section>
      <div className="profile-section profile-logout"><button type="button" aria-disabled="true"><img src="/assets/profile-logout.svg" alt="" width="16" height="16" />Log out</button></div>
    </div>
    <AccountExtras />
  </main>;
}
