import { useState, type RefObject } from 'react';
import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { Product } from './catalog-model';

export const cartAsset = (name: string) => `/assets/cart/refresh/${name}`;
export type CartNoticeData = { id: number; kind: 'stock' | 'offline' | 'update-error'; title: string; description: string };

export function CartPhoto({ product, unavailable = false }: { product: Product; unavailable?: boolean }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return <div className="mobile-cart-photo">
    {failedImage === product.image || unavailable ? <span className="cart-photo-fallback" role="img" aria-label={`Photo unavailable for ${product.name}`}><img src={cartAsset('photo-fallback.svg')} alt="" /></span>
      : <img src={`/assets/${product.image}`} alt={product.imageAlt} width="96" height="96" onError={() => setFailedImage(product.image)} />}
  </div>;
}

export function EmptyCart({ titleRef, onClose }: { titleRef: RefObject<HTMLHeadingElement | null>; onClose: () => void }) {
  const reduced = !!useReducedMotion();
  return <motion.section className="mobile-cart-empty" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? .08 : .24 }}>
    <img src={cartAsset('empty-bag.png')} alt="" width="148" height="148" />
    <h2 ref={titleRef} tabIndex={-1}>Your cart is waiting</h2>
    <p>Add something you’ll enjoy.<br />Your next meal starts here.</p>
    <button type="button" className="cart-browse" onClick={onClose}>Browse menu</button>
  </motion.section>;
}

export function CartSkeleton() {
  return <section className="cart-loading" aria-busy="true" aria-label="Loading your cart">
    <h2 className="cart-section-title" role="status">Loading your cart</h2>
    <div className="cart-skeleton-list" aria-hidden="true">{[0, 1, 2].map(index => <div key={index} className="cart-skeleton-row">
      <div className="cart-skeleton-main"><span className="cart-skeleton-photo" /><div><span className="cart-skeleton-title" /><span className="cart-skeleton-description" /><span className="cart-skeleton-tags" /></div></div>
      <span className="cart-skeleton-price" />
    </div>)}</div>
  </section>;
}

export function CartLoadError() {
  return <section className="cart-load-error" role="alert">
    <h2 className="cart-section-title">Your cart couldn’t load</h2>
    <p>Check your connection and try again. Your last selection may still be available.</p>
  </section>;
}

export function CartNotice({ notice, onDismiss }: { notice: CartNoticeData; onDismiss: () => void }) {
  const present = useIsPresent(), reduced = !!useReducedMotion();
  return <motion.button className="cart-notice" type="button" onClick={onDismiss} inert={!present} aria-hidden={!present || undefined}
    aria-label={`${notice.title}. ${notice.description} Dismiss notification`} title="Dismiss notification"
    initial={{ opacity: 0, y: reduced ? 0 : -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }}
    transition={{ duration: reduced ? .08 : .24, ease: [.2, .8, .2, 1] }}>
    <img src={cartAsset(notice.kind === 'stock' ? 'info.svg' : 'warning.svg')} alt="" />
    <span className="cart-notice-copy" role="status" aria-live="polite" aria-atomic="true"><strong>{notice.title}</strong><span>{notice.description}</span></span>
  </motion.button>;
}

export function ClearConfirmation({ cancelRef, onCancel, onClear }: { cancelRef: RefObject<HTMLButtonElement | null>; onCancel: () => void; onClear: () => void }) {
  const present = useIsPresent(), reduced = !!useReducedMotion();
  return <motion.div className="cart-confirm-cover" inert={!present} initial={{ backgroundColor: 'rgba(0,0,0,0)' }} animate={{ backgroundColor: 'rgba(0,0,0,.5)' }} exit={{ backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: reduced ? .08 : .16 }}
    onKeyDownCapture={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onCancel(); }
      if (event.key === 'Tab') {
        const controls = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
        const index = controls.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault(); controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
      }
    }}>
    <motion.section className="cart-confirm" role="alertdialog" aria-modal="true" aria-labelledby="cart-confirm-title" aria-describedby="cart-confirm-description"
      initial={{ y: reduced ? 0 : '100%', opacity: reduced ? 0 : 1 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : '100%', opacity: reduced ? 0 : 1 }} transition={{ duration: reduced ? .08 : .28, ease: [.2, .8, .2, 1] }}>
      <h2 id="cart-confirm-title">Clear your cart?</h2>
      <button className="cart-confirm-close" type="button" aria-label="Cancel clearing cart" onClick={onCancel}><img src={cartAsset('close.svg')} alt="" /></button>
      <p id="cart-confirm-description">All dishes will be removed. You can keep your selection and continue browsing.</p>
      <button ref={cancelRef} className="cart-confirm-keep" type="button" onClick={onCancel}>Keep dishes</button>
      <button className="cart-confirm-remove" type="button" onClick={onClear}>Clear cart</button>
    </motion.section>
  </motion.div>;
}
