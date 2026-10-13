import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { BottomSheet, MobileScroll, useMobileDevice, useScreenPortal } from '../mobile';
import data from './catalog.json';
import { money, type Product } from './catalog-model';
import { cartItems, cartSuggestions } from './cart-model';
import { cartSummary } from './search-model';
import { CartQuantity, CartValue } from './CartQuantity';
import { ProductCard } from './ProductCard';
import { DishDetail, type DishSelection } from './DishDetail';
import { dishTitle, dishWeight, photoRect } from './dish-model';
import { purchaseMotion } from './purchase-motion';
import './cart.css';

type CartProps = {
  quantities: Record<string, number>; onChange: (id: string, delta: number) => void;
  onClear: () => void; onClose: () => void; onExited: () => void;
};

function CartRow({ product, quantity, onChange }: { product: Product; quantity: number; onChange: (delta: number, event: MouseEvent<HTMLButtonElement>) => void }) {
  const present = useIsPresent(), reduced = !!useReducedMotion();
  const title = dishTitle(product), weight = dishWeight(product);
  return <motion.li className="mobile-cart-row" data-cart-product={product.id} inert={!present} aria-hidden={!present || undefined}
    layout={reduced ? false : 'position'} initial={false} exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}
    transition={reduced ? { duration: 0 } : { duration: .24, ease: [.2, .8, .2, 1] }}>
    <img className="mobile-cart-photo" src={`/assets/${product.image}`} alt={product.imageAlt} width="101" height="101" />
    <div className="mobile-cart-info">
      <div className="mobile-cart-heading"><h2>{title}</h2><button type="button" className="mobile-cart-edit" disabled>Edit</button></div>
      <p className="mobile-cart-description">{product.description}</p>
      <div className="mobile-cart-buy"><p className="mobile-cart-price"><strong>{money(product.priceCents)}</strong>{weight && <span> · {weight}</span>}</p>
        <CartQuantity title={title} quantity={quantity} onChange={onChange} />
      </div>
    </div>
  </motion.li>;
}

function ClearConfirmation({ cancelRef, onCancel, onClear }: { cancelRef: RefObject<HTMLButtonElement | null>; onCancel: () => void; onClear: () => void }) {
  const present = useIsPresent(), reduced = !!useReducedMotion();
  return <motion.div className="cart-confirm-cover" inert={!present} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .08 : .16 }}
    onKeyDownCapture={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onCancel(); } }}>
    <motion.section className="cart-confirm" role="alertdialog" aria-modal="true" aria-labelledby="cart-confirm-title" aria-describedby="cart-confirm-description"
      initial={{ y: reduced ? 0 : 12 }} animate={{ y: 0 }} exit={{ y: reduced ? 0 : 4 }} transition={{ duration: reduced ? .08 : .24, ease: [.2, .8, .2, 1] }}>
      <h2 id="cart-confirm-title">Clear your cart?</h2><p id="cart-confirm-description">All dishes will be removed from your cart.</p>
      <button ref={cancelRef} type="button" onClick={onCancel}>Keep dishes</button><button className="cart-confirm-remove" type="button" onClick={onClear}>Clear cart</button>
    </motion.section>
  </motion.div>;
}

function CartBody({ quantities, onChange, onClear, onClose, onExited, nestedModal }: CartProps & { nestedModal: RefObject<boolean> }) {
  const { device } = useMobileDevice();
  const { screenRef } = useScreenPortal();
  const reduced = !!useReducedMotion();
  const root = useRef<HTMLDivElement>(null), closeButton = useRef<HTMLButtonElement>(null), emptyTitle = useRef<HTMLHeadingElement>(null);
  const clearButton = useRef<HTMLButtonElement>(null), cancelButton = useRef<HTMLButtonElement>(null);
  const exitRef = useRef(onExited); exitRef.current = onExited;
  const [confirmation, setConfirmation] = useState(false);
  const wasConfirmation = useRef(false);
  const [selection, setSelection] = useState<DishSelection | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null), focusAfterRemoval = useRef<string | null>(null);
  const items = cartItems(data.products, quantities), summary = cartSummary(data.products, quantities);
  // Stable assortment for this presentation; an added suggestion stays in place.
  const [suggestions] = useState(() => cartSuggestions(data.products, data.categories, quantities));
  const empty = items.length === 0;

  useEffect(() => {
    document.title = 'Prana — Cart';
    return () => { document.title = 'Prana — Menu'; exitRef.current(); };
  }, []);
  useLayoutEffect(() => {
    const viewport = root.current?.querySelector<HTMLElement>('.cart-scroll .mobile-scroll');
    const sheet = root.current?.closest<HTMLElement>('.bottom-sheet');
    if (!viewport || !sheet) return;
    const update = () => {
      const collapse = Math.min(53, Math.max(0, viewport.scrollTop));
      sheet.style.setProperty('--cart-collapse', `${collapse}px`);
      sheet.style.setProperty('--cart-address-opacity', `${collapse / 53}`);
    };
    viewport.addEventListener('scroll', update, { passive: true }); update();
    return () => viewport.removeEventListener('scroll', update);
  }, []);
  useLayoutEffect(() => {
    if (confirmation) cancelButton.current?.focus({ preventScroll: true });
    else if (wasConfirmation.current) clearButton.current?.focus({ preventScroll: true });
    wasConfirmation.current = confirmation;
  }, [confirmation]);
  useLayoutEffect(() => { nestedModal.current = !!selection || confirmation; return () => { nestedModal.current = false; }; }, [selection, confirmation, nestedModal]);
  useLayoutEffect(() => {
    if (empty) emptyTitle.current?.focus({ preventScroll: true });
    else if (focusAfterRemoval.current) root.current?.querySelector<HTMLButtonElement>(`[data-cart-product="${focusAfterRemoval.current}"] .cart-decrease`)?.focus({ preventScroll: true });
    focusAfterRemoval.current = null;
  }, [items.length, empty]);
  useLayoutEffect(() => {
    if (!selection && opener.current) { opener.current.focus({ preventScroll: true }); opener.current = null; }
  }, [selection]);
  const openProduct = useCallback((product: Product, trigger: HTMLButtonElement) => {
    const photo = trigger.closest('.catalog-card')?.querySelector<HTMLElement>('.catalog-photo'), screen = screenRef.current;
    if (!photo || !screen) return;
    opener.current = trigger; setReturning(null);
    setSelection({ product, photo, trigger, origin: photoRect(photo.getBoundingClientRect(), screen.getBoundingClientRect(), device.geometry.screen.width, device.geometry.safeArea.top + 53) });
  }, [screenRef, device]);
  const closeProduct = useCallback(() => { setSelection(null); setReturning(null); }, []);
  const cancelClear = () => setConfirmation(false);
  const changeItem = (id: string, index: number, quantity: number, delta: number, event: MouseEvent<HTMLButtonElement>) => {
    if (quantity === 1 && delta < 0 && event.currentTarget.matches(':focus-visible')) focusAfterRemoval.current = (items[index + 1] ?? items[index - 1])?.product.id ?? null;
    onChange(id, delta);
  };
  return <div className="cart-view" ref={root} style={{ '--cart-safe-top': `${device.geometry.safeArea.top}px` } as CSSProperties}>
    <div className="cart-panel" inert={!!selection || confirmation} aria-hidden={!!selection || confirmation || undefined}>
      <header className="cart-toolbar">
        <button ref={closeButton} className="cart-close" type="button" aria-label="Close cart" onClick={onClose}><span className="cart-close-icon"><img src="/assets/cart/close.svg" alt="" /></span>Close</button>
        <p className="cart-address">Jl.Paya Padonan No21a</p>
        {!empty && <button ref={clearButton} className="cart-clear" type="button" aria-label="Clear cart" onClick={() => setConfirmation(true)}><span><img src="/assets/cart/clear.svg" alt="" /></span></button>}
      </header>
      <MobileScroll className="cart-scroll"><div className="cart-scroll-content">
        {empty ? <motion.section className="mobile-cart-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={reduced ? { duration: 0 } : purchaseMotion.enter}>
          <img src="/assets/cart/empty-bag.png" alt="" width="80" height="80" />
          <h2 ref={emptyTitle} tabIndex={-1}>It's empty for now</h2>
          <button type="button" className="cart-browse" onClick={onClose}>Add food to cart</button>
        </motion.section> : <ul className="mobile-cart-items" aria-label="Cart items"><AnimatePresence initial={false}>
          {items.map(({ product, quantity }, index) => <CartRow key={product.id} product={product} quantity={quantity} onChange={(delta, event) => changeItem(product.id, index, quantity, delta, event)} />)}
        </AnimatePresence></ul>}
        <section className="cart-suggestions" aria-labelledby="cart-suggestions-title"><h2 id="cart-suggestions-title">You may like</h2><div className="catalog-grid">
          {suggestions.map(product => <ProductCard key={product.id} product={product} large={false} quantity={quantities[product.id] ?? 0} onChange={onChange} onOpen={openProduct} returning={returning === product.id} idPrefix="cart-suggestion" />)}
        </div></section>
      </div></MobileScroll>
      {!empty && <footer className="cart-footer">
        <div className="cart-footer-fade" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="cart-order-total" aria-live="polite" aria-atomic="true"><span>{summary.count} {summary.count === 1 ? 'item' : 'items'}</span><strong><CartValue value={summary.cents}>{money(summary.cents)}</CartValue></strong></div>
        <button className="cart-checkout" type="button" aria-disabled="true">Proceed to Checkout</button>
        <p className="cart-free-delivery">Free delivery</p>
      </footer>}
    </div>
    <AnimatePresence>{confirmation && <ClearConfirmation cancelRef={cancelButton} onCancel={cancelClear} onClear={() => { setConfirmation(false); onClear(); }} />}</AnimatePresence>
    {selection && <div className="cart-dish-host"><DishDetail selection={selection} quantity={quantities[selection.product.id] ?? 0} onChange={onChange} onCollapse={setReturning} onClosed={closeProduct} /></div>}
  </div>;
}

export function CartSheet({ open, onOpenChange, ...props }: CartProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { device } = useMobileDevice();
  const nestedModal = useRef(false);
  const height = device.geometry.screen.height;
  const available = height - device.geometry.safeArea.top - (device.platform === 'android' ? device.geometry.safeArea.bottom : 0);
  return <BottomSheet open={open} onOpenChange={next => { if (!nestedModal.current) onOpenChange(next); }} title="Cart" description="Review your dishes and quantities." snap={available / height}>
    <CartBody {...props} nestedModal={nestedModal} />
  </BottomSheet>;
}
