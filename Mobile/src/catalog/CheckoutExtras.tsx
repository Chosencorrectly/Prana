import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Carousel, useFlow, useKeyboard, type FlowControls, type FlowScreen } from '../mobile';
import { useCheckout } from './checkout-context';
import { useProfileSession } from '../profile/profile-session';
import { ProfileBody, ProfileButton, ProfileDock, ProfileField, ProfileHeading, ProfileIcon } from '../profile/ProfileUI';
import { CardBankScreen, CardErrorScreen, CardFormScreen } from '../profile/ProfilePayments';
import { DiscardScreen } from '../profile/ProfileDetails';
import { blankCard } from '../profile/profile-model';
import { useProfile } from '../profile/ProfileState';
import { CartQuantity, CartValue } from './CartQuantity';
import { CartPhoto } from './CartStates';
import { cartItems } from './cart-model';
import { money } from './catalog-model';
import { allergens, allergySummary, noTip, orderTotals, parseTip, paymentCardIndex, paymentMethods, type Allergen, type PaymentMethod } from './checkout-options';
import { useAddressBook } from './AddressBook';
import data from './catalog.json';

export function checkoutBack(flow: FlowControls, session: ReturnType<typeof useProfileSession>) {
  if (flow.current.id === 'card-form') { session.guard(flow.pop); return; }
  session.cancelOperation(); flow.pop();
}
function ExtraHeader({ title }: { title: string }) {
  const flow = useFlow(), session = useProfileSession(), keyboard = useKeyboard();
  return <div className="profile-toolbar checkout-extra-toolbar"><button type="button" aria-label="Back" onPointerDown={event => event.preventDefault()} onClick={() => { keyboard.hide(); checkoutBack(flow, session); }}><img src="/assets/checkout/phone-back.svg" className="profile-back-icon" alt="" width={18} height={18} /></button><span>{title}</span></div>;
}

function AllergensScreen() {
  const { options, setOptions } = useCheckout(), flow = useFlow();
  const [draft, setDraft] = useState<Allergen[]>(() => [...(options.allergens ?? [])]);
  return <><ProfileBody className="checkout-allergens"><p className="checkout-allergy-disclaimer">All meals are prepared in a shared kitchen, so we can’t guarantee dishes are completely free from allergens.</p>
    <div className="checkout-allergen-list" role="group" aria-label="Allergens">{allergens.map(([id, label]) => <button key={id} type="button" role="checkbox" aria-checked={draft.includes(id)} onClick={() => setDraft(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])}>
      <span className="checkout-allergen-icon"><img src={`/assets/checkout/allergens/${id}.svg`} alt="" /></span><span>{label}</span><span className="checkout-checkbox" aria-hidden="true">{draft.includes(id) && <img src="/assets/checkout/allergens/check.svg" alt="" />}</span>
    </button>)}</div>
  </ProfileBody><ProfileDock route="allergens"><ProfileButton onClick={() => { setOptions({ ...options, allergens: draft }); flow.pop(); }}>Apply</ProfileButton></ProfileDock></>;
}
function CustomTipScreen() {
  const { options, setOptions } = useCheckout(), flow = useFlow(), keyboard = useKeyboard();
  const [value, setValue] = useState(options.tip?.kind === 'custom' ? (options.tip.cents / 100).toFixed(2) : '');
  const cents = parseTip(value);
  function submit(event: FormEvent) { event.preventDefault(); if (cents === null) return; setOptions({ ...options, tip: cents ? { kind: 'custom', cents } : noTip }); keyboard.hide(); flow.pop(); }
  return <><ProfileBody><ProfileHeading description="You can change or remove your tip before placing your order.">Custom tip</ProfileHeading><form id="checkout-tip-form" onSubmit={submit} noValidate><ProfileField label="Tip amount, $" inputMode="decimal" placeholder="0.00" value={value} maxLength={10} error={value && cents === null ? 'Enter an amount with up to 2 decimal places.' : undefined} onChange={event => setValue(event.target.value)} /></form></ProfileBody><ProfileDock route="custom-tip"><ProfileButton form="checkout-tip-form" type="submit" disabled={cents === null}>Apply tip</ProfileButton></ProfileDock></>;
}
function CourierNoteScreen() {
  const { options, setOptions } = useCheckout(), { state } = useAddressBook(), flow = useFlow(), keyboard = useKeyboard();
  const [value, setValue] = useState(options.courierNote ?? state.current.details.instructions);
  function submit(event: FormEvent) { event.preventDefault(); setOptions({ ...options, courierNote: value.trim() }); keyboard.hide(); flow.pop(); }
  return <><ProfileBody><ProfileHeading description="Add delivery instructions for this order.">Note for the courier</ProfileHeading><form id="checkout-note-form" onSubmit={submit}><ProfileField label="Delivery instructions" placeholder="Add a note for the courier" maxLength={240} value={value} onChange={event => setValue(event.target.value)} /></form></ProfileBody><ProfileDock route="courier-note"><ProfileButton type="submit" form="checkout-note-form">Save note</ProfileButton></ProfileDock></>;
}

function extraStep(id: string, title: string, render: FlowScreen['render'], focusSelector = '.checkout-extra-toolbar button'): FlowScreen {
  return { id, title, headerHeight: 61, header: () => <ExtraHeader title={title} />, render, focusSelector };
}
export const checkoutExtraSteps: Record<string, FlowScreen> = {
  allergens: extraStep('allergens', 'Select allergens', () => <AllergensScreen />),
  'custom-tip': extraStep('custom-tip', 'Tip the team', () => <CustomTipScreen />, '.profile-field input'),
  'courier-note': extraStep('courier-note', 'Delivery instructions', () => <CourierNoteScreen />, '.profile-field input'),
  'card-form': extraStep('card-form', 'Payment method', () => <CardFormScreen />),
  'card-bank': extraStep('card-bank', 'Card verification', () => <CardBankScreen />),
  'card-error': extraStep('card-error', 'Payment method', () => <CardErrorScreen />),
  discard: extraStep('discard', 'Unsaved changes', () => <DiscardScreen />),
};

export function CheckoutItems() {
  const { quantities, onQuantityChange, onClose } = useCheckout(), reduced = !!useReducedMotion();
  const items = cartItems(data.products, quantities), flow = useFlow(), empty = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => { if (!items.length && flow.current.id === 'delivery') empty.current?.focus({ preventScroll: true }); }, [items.length, flow.current.id]);
  return <section className="checkout-items" aria-labelledby="checkout-items-title"><h2 id="checkout-items-title">Order details</h2>{items.length ? <ul><AnimatePresence initial={false}>{items.map(({ product, quantity }) => <motion.li key={product.id} initial={{ opacity: 0, gridTemplateRows: '0fr' }} animate={{ opacity: 1, gridTemplateRows: '1fr' }} exit={{ opacity: 0, gridTemplateRows: '0fr' }} transition={{ duration: reduced ? 0 : .24, ease: [.2, .8, .2, 1] }}>
    <div className="checkout-item-clip"><div className="checkout-item"><CartPhoto product={product} /><div className="checkout-item-copy"><h3>{product.name}</h3><div className="checkout-item-bottom"><CartQuantity title={product.name} quantity={quantity} onChange={delta => onQuantityChange(product.id, delta)} /><strong><CartValue value={product.priceCents * quantity}>{money(product.priceCents * quantity)}</CartValue></strong></div></div></div></div>
  </motion.li>)}</AnimatePresence></ul> : <div className="checkout-empty"><p ref={empty} tabIndex={-1}>Your cart is empty.</p><ProfileButton secondary onClick={onClose}>Browse menu</ProfileButton></div>}</section>;
}
export function CheckoutAllergyRow() {
  const { options } = useCheckout(), flow = useFlow();
  const selected = !!options.allergens?.length;
  return <button type="button" className="checkout-allergy-row" onClick={() => flow.push(checkoutExtraSteps.allergens)}><ProfileIcon name="shield" /><span><strong>Allergies</strong><small>{allergySummary(options.allergens)}</small></span><span className="checkout-row-action">{selected ? 'Edit' : 'Tell the kitchen'}</span></button>;
}
export function CheckoutTips() {
  const { options, setOptions } = useCheckout(), flow = useFlow(), tip = options.tip ?? noTip;
  return <section className="checkout-tips" aria-labelledby="checkout-tips-title"><h2 id="checkout-tips-title">Tip the team</h2><div className="checkout-tip-options" role="group" aria-label="Tip the team">{([0, 10, 15, 20] as const).map(value => <button key={value} type="button" aria-pressed={tip.kind === 'percent' && tip.value === value} onClick={() => setOptions({ ...options, tip: { kind: 'percent', value } })}>{value ? `${value}%` : 'No tip'}</button>)}<button type="button" className="checkout-custom-tip" aria-pressed={tip.kind === 'custom'} onClick={() => flow.push(checkoutExtraSteps['custom-tip'])}>{tip.kind === 'custom' ? money(tip.cents) : 'Custom'}</button></div></section>;
}
export function CheckoutSummary() {
  const { count, cents, promo, options } = useCheckout(), totals = orderTotals(cents, promo.status, options.tip);
  return <dl className="delivery-calculation checkout-calculation" aria-label="Order total breakdown">
    <div><dt>Subtotal · {count} {count === 1 ? 'item' : 'items'}</dt><dd>{money(cents)}</dd></div>
    {!!totals.discountCents && <div><dt>Discount</dt><dd>−{money(totals.discountCents)}</dd></div>}
    <div><dt>Delivery · <span className="delivery-free">free</span></dt><dd>$0.00</dd></div>
    <div><dt>Tax</dt><dd>$0.00</dd></div>
    {!!totals.tipCents && <div><dt>Tip{options.tip?.kind === 'percent' ? ` · ${options.tip.value}%` : ''}</dt><dd>{money(totals.tipCents)}</dd></div>}
  </dl>;
}
export function CheckoutPayment() {
  const { options, setOptions } = useCheckout(), { data: profile } = useProfile(), s = useProfileSession();
  const selected = options.paymentMethod ?? 'card';
  return <section className="delivery-payment" aria-labelledby="delivery-payment-label"><h2 id="delivery-payment-label" className="delivery-label">Payment method</h2>
    <div className="checkout-payment-options" role="radiogroup" aria-labelledby="delivery-payment-label">{(Object.entries(paymentMethods) as [PaymentMethod, string][]).map(([id, label]) => <label key={id}><input type="radio" name="checkout-payment-method" value={id} checked={selected === id} onChange={() => setOptions({ ...options, paymentMethod: id })} /><span className="checkout-payment-radio" aria-hidden="true" /><span>{label}</span></label>)}</div>
    {selected === 'card' && <div className="checkout-card-selection"><Carousel className="delivery-payment-rail" contentClassName="delivery-payment-track" ariaLabel="Saved cards">
      {profile.cards.map((card, index) => <button className="delivery-choice" key={card.id} type="button" aria-label={`${card.brand} ending in ${card.last4}`} aria-pressed={paymentCardIndex(profile.cards, options) === index} onClick={() => setOptions({ ...options, payment: index, paymentCardId: card.id })}>{card.brand === 'Mastercard' ? <img src="/assets/checkout/mastercard.svg" alt="" width={22} height={14} /> : <b className="delivery-card-brand">{card.brand}</b>}<span>•••• {card.last4}</span></button>)}
      <button className="delivery-add-card" type="button" onClick={() => { s.setEditingCard(undefined); s.setCardDraft(blankCard()); s.setCardBaseline(blankCard()); s.push('card-form'); }}>+ Add card</button>
    </Carousel>{paymentCardIndex(profile.cards, options) < 0 || !profile.cards.length ? <p className="delivery-empty-cards">Choose a saved card, add a card or use another payment method.</p> : null}</div>}
  </section>;
}
