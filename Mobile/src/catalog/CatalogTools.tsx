import { useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { KeyboardInput, useKeyboard, useKeyboardInsets, useMobileDevice } from '../mobile';
import { money } from './catalog-model';
import { BottomFade } from './BottomFade';
import './catalog-tools.css';

const ease = [.2, .8, .2, 1] as const;
const asset = (name: string) => `/assets/catalog-tools/${name}.svg`;

export function CatalogTools({ scrolled, searchOpen, query, count, cents, onSearchOpen, onQuery, onTop, onCart }: {
  scrolled: boolean; searchOpen: boolean; query: string; count: number; cents: number;
  onSearchOpen: (open: boolean) => void; onQuery: (query: string) => void; onTop: () => void;
  onCart: (trigger: HTMLButtonElement) => void;
}) {
  const keyboard = useKeyboard();
  const { bottomInset, keyboardDragging } = useKeyboardInsets();
  const { device } = useMobileDevice();
  const reduced = !!useReducedMotion();
  const input = useRef<HTMLInputElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const hasCart = count > 0;
  const showTop = scrolled && !searchOpen;
  const transition = { duration: reduced ? .08 : .26, ease };
  // Focus and keyboard belong to the same state change as the expanding surface.
  useLayoutEffect(() => {
    if (searchOpen) input.current?.focus({ preventScroll: true });
    else if (wasOpen.current) trigger.current?.focus({ preventScroll: true });
    wasOpen.current = searchOpen;
  }, [searchOpen]);
  const close = () => { keyboard.hide(); onSearchOpen(false); };
  const clearOrClose = () => {
    if (!query.length) { close(); return; }
    onQuery('');
    input.current?.focus({ preventScroll: true });
  };

  return <motion.div className="catalog-tools" data-search-open={searchOpen} data-visible="true"
    animate={{ bottom: bottomInset - (device.platform === 'ios' ? device.geometry.safeArea.bottom : 0) }}
    transition={keyboardDragging ? { duration: 0 } : transition}>
    <BottomFade className="catalog-tools-fade" />
    {/* Keep the blur's ancestor opaque. Reveal the filtered surface itself,
        so reaching the final frame never changes its backdrop sampling root. */}
    <motion.div className="catalog-top-slot" inert={!showTop} aria-hidden={!showTop || undefined} initial={false}
      animate={{ '--catalog-top-reveal': showTop ? 1 : 0, y: showTop || reduced ? 0 : 12 }} transition={transition}>
      <span className="catalog-top-surface" aria-hidden="true" />
      <button type="button" className="catalog-top" aria-label="Back to top" onClick={onTop}><span className="catalog-tool-icon up-icon"><img src={asset('up')} alt="" /></span></button>
    </motion.div>
    <AnimatePresence initial={false}>
      {hasCart && !searchOpen && <motion.div className="catalog-cart-slot" key="cart" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 0 }} transition={transition}>
        <button type="button" className="catalog-cart" aria-label={`Cart: ${count} ${count === 1 ? 'item' : 'items'}, ${money(cents)}`} onClick={event => onCart(event.currentTarget)}>
          <span className="catalog-tool-icon cart-icon"><img src={asset('cart')} alt="" /></span>
          <span className="catalog-cart-value"><AnimatePresence mode="popLayout" initial={false}><motion.span key={cents} initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -4 }} transition={{ duration: reduced ? .08 : .15 }}>{money(cents)}</motion.span></AnimatePresence></span>
        </button>
      </motion.div>}
    </AnimatePresence>
    <motion.div className="catalog-search-surface" initial={false}
      animate={{ left: searchOpen ? '15px' : `calc(100% - ${hasCart ? 212 : 79}px)`, right: searchOpen || !hasCart ? 15 : 148 }} transition={transition}>
      <motion.button ref={trigger} className="catalog-search-trigger" type="button" aria-label="Search menu" aria-expanded={searchOpen} aria-controls="catalog-search-form"
        inert={searchOpen} aria-hidden={searchOpen || undefined} animate={{ opacity: searchOpen ? 0 : 1 }} transition={{ duration: reduced ? .08 : .12 }} onClick={() => onSearchOpen(true)}>
        <span className="catalog-tool-icon search-icon"><img src={asset('search')} alt="" /></span>
      </motion.button>
      <motion.form id="catalog-search-form" className="catalog-search-form" role="search" inert={!searchOpen} aria-hidden={!searchOpen || undefined}
        initial={false} animate={{ opacity: searchOpen ? 1 : 0 }} transition={{ duration: reduced ? .08 : .18, delay: searchOpen && !reduced ? .08 : 0 }}
        onSubmit={event => { event.preventDefault(); keyboard.hide(); }}>
        <KeyboardInput ref={input} aria-label="Search menu" placeholder="Search menu" type="text" enterKeyHint="search" autoComplete="off" spellCheck={false} maxLength={100}
          value={query} onChange={event => onQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') close(); }} />
        <button className="catalog-search-close" type="button" aria-label={query.length ? 'Clear search' : 'Close search'} onPointerDown={event => event.preventDefault()} onClick={clearOrClose}><img src={asset('close')} alt="" /></button>
      </motion.form>
    </motion.div>
  </motion.div>;
}
