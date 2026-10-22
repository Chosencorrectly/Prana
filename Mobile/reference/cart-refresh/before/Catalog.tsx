import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Carousel, MobileScroll, useFlow, useKeyboard, useMobileDevice, useScreenPortal } from '../mobile';
import data from './catalog.json';
import { changeQuantity, createCatalogLayout, menuFades, type CatalogSection, type Product } from './catalog-model';
import { ProductCard } from './ProductCard';
import { DishDetail, type DishSelection } from './DishDetail';
import { photoRect } from './dish-model';
import { CatalogTools } from './CatalogTools';
import { CartSheet } from './CartSheet';
import { usePromoCode } from './usePromoCode';
import { useCheckoutPhone } from './useCheckoutPhone';
import { cartSummary, createMenuSearch, normalizeSearch, searchSuggestions } from './search-model';
import { AddressBookProvider, useAddressBook } from './AddressBook';
import { ActiveOrderProvider } from './ActiveOrderState';
import { ActiveOrderShortcut } from './ActiveOrder';
import './catalog.css';

const searchMenu = createMenuSearch(data.products, data.categories);
const suggestions = searchSuggestions(data.products, data.categories);

type CatalogState = {
  sections: CatalogSection[]; activeCategory: string; selectCategory: (id: string) => void;
  quantities: Record<string, number>; change: (id: string, delta: number) => void;
  navigate: { current: ((id: string) => void) | null };
  openProduct: (product: Product, trigger: HTMLButtonElement) => void;
  openCart: (trigger: HTMLButtonElement) => void;
  openTracking: (trigger: HTMLButtonElement) => void;
  query: string; setQuery: (query: string) => void; results: Product[];
};
const CatalogContext = createContext<CatalogState | null>(null);
const useCatalog = () => useContext(CatalogContext)!;

export function CatalogProvider({ children }: PropsWithChildren) {
  return <AddressBookProvider><ActiveOrderProvider><CatalogStateProvider>{children}</CatalogStateProvider></ActiveOrderProvider></AddressBookProvider>;
}
function CatalogStateProvider({ children }: PropsWithChildren) {
  const [sections] = useState(() => createCatalogLayout(data.categories, data.products));
  const [activeCategory, selectCategory] = useState(sections[0].id);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const promo = usePromoCode(Object.keys(quantities).length > 0);
  // Deliberate default fixture: checkout starts without a verified account phone,
  // including when the separate sign-in demo was completed with SMS.
  const accountPhone = useCheckoutPhone();
  const navigate = useRef<((id: string) => void) | null>(null);
  const change = useCallback((id: string, delta: number) => setQuantities(current => changeQuantity(current, id, delta)), []);
  const [selection, setSelection] = useState<DishSelection | null>(null);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchMenu(query), [query]);
  const opener = useRef<HTMLButtonElement | null>(null);
  const cartOpener = useRef<HTMLButtonElement | null>(null);
  const [cartOpen, setCartOpen] = useState(false), [cartActive, setCartActive] = useState(false);
  const [initialTracking, setInitialTracking] = useState(false);
  const cartOpenRef = useRef(cartOpen); cartOpenRef.current = cartOpen;
  const keyboard = useKeyboard();
  const { device } = useMobileDevice();
  const { screenRef } = useScreenPortal();
  const openCart = useCallback((trigger: HTMLButtonElement) => {
    keyboard.hide(); cartOpener.current = trigger; setInitialTracking(false); setCartActive(true); setCartOpen(true);
  }, [keyboard]);
  const openTracking = useCallback((trigger: HTMLButtonElement) => {
    keyboard.hide(); cartOpener.current = trigger; setInitialTracking(true); setCartActive(true); setCartOpen(true);
  }, [keyboard]);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const clearCart = useCallback(() => setQuantities({}), []);
  const cartExited = useCallback(() => {
    if (cartOpenRef.current) return;
    setCartActive(false);
  }, []);
  useLayoutEffect(() => {
    if (cartActive || !cartOpener.current) return;
    const target = cartOpener.current.isConnected ? cartOpener.current : screenRef.current?.querySelector<HTMLButtonElement>('.catalog-search-trigger');
    target?.focus({ preventScroll: true }); cartOpener.current = null;
  }, [cartActive, screenRef]);
  const openProduct = useCallback((product: Product, trigger: HTMLButtonElement) => {
    const photo = trigger.closest('.catalog-card')?.querySelector<HTMLElement>('.catalog-photo');
    const screen = screenRef.current;
    if (!photo || !screen) return;
    keyboard.hide();
    opener.current = trigger;
    setSelection({ product, photo, trigger, origin: photoRect(photo.getBoundingClientRect(), screen.getBoundingClientRect(), device.geometry.screen.width, device.geometry.safeArea.top + 53) });
  }, [keyboard, screenRef, device]);
  const closeProduct = useCallback(() => setSelection(null), []);
  useLayoutEffect(() => {
    if (!selection && opener.current) { opener.current.focus({ preventScroll: true }); opener.current = null; }
  }, [selection]);
  return <CatalogContext.Provider value={{ sections, activeCategory, selectCategory, quantities, change, navigate, openProduct, query, setQuery, results, openCart, openTracking }}>
    <link rel="preload" as="image" href={`/assets/${sections[0].items[0].product.image}`} />
    <div className="catalog-underlay" inert={!!selection || cartActive} aria-hidden={!!selection || cartActive || undefined}>{children}</div>
    {selection && <DishDetail selection={selection} quantity={quantities[selection.product.id] ?? 0} onChange={change} onClosed={closeProduct} />}
    <CartSheet open={cartOpen} onOpenChange={setCartOpen} quantities={quantities} initialTracking={initialTracking} promo={promo} accountPhone={accountPhone} onChange={change} onClear={clearCart} onClose={closeCart} onExited={cartExited} />
  </CatalogContext.Provider>;
}

export function CatalogHeader() {
  const { state: addresses } = useAddressBook();
  const { sections, activeCategory, navigate, query, results, openTracking } = useCatalog();
  const searching = !!normalizeSearch(query);
  const railRoot = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const [fades, setFades] = useState({ left: 0, right: 127 });

  useLayoutEffect(() => {
    const rail = railRoot.current?.querySelector<HTMLElement>('.mobile-carousel');
    if (!rail) return;
    const update = () => {
      const overdrag = Number(rail.dataset.overscroll ?? 0);
      setFades(menuFades(rail.scrollLeft - overdrag, rail.scrollWidth - rail.clientWidth));
    };
    const resize = new ResizeObserver(update);
    const mutation = new MutationObserver(update);
    resize.observe(rail);
    if (rail.firstElementChild) resize.observe(rail.firstElementChild);
    mutation.observe(rail, { attributes: true, attributeFilter: ['data-overscroll'] });
    rail.addEventListener('scroll', update, { passive: true });
    update();
    return () => { resize.disconnect(); mutation.disconnect(); rail.removeEventListener('scroll', update); };
  }, []);

  useEffect(() => {
    const rail = railRoot.current?.querySelector<HTMLElement>('.mobile-carousel');
    const chip = rail?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!rail || !chip) return;
    const target = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, chip.offsetLeft + chip.offsetWidth / 2 - rail.clientWidth / 2));
    const movement = animate(rail.scrollLeft, target, { duration: reduced ? 0 : 0.4, ease: [0.2, 0, 0.38, 0.9], onUpdate: value => { rail.scrollLeft = value; } });
    const interrupt = () => movement.stop();
    rail.addEventListener('pointerdown', interrupt, { passive: true });
    rail.addEventListener('wheel', interrupt, { passive: true });
    return () => { movement.stop(); rail.removeEventListener('pointerdown', interrupt); rail.removeEventListener('wheel', interrupt); };
  }, [activeCategory, reduced]);

  return <div className="catalog-header">
    <div className="catalog-delivery-row">
      <div className="catalog-delivery"><span className="catalog-pin"><img src="/assets/catalog/map-pin.svg" alt="" /></span>
        <div><span>Deliver to</span><strong>{addresses.current.location.street}</strong></div>
      </div>
      <span className="catalog-avatar" aria-label="Profile AG">AG</span>
    </div>
    <ActiveOrderShortcut onOpen={openTracking} />
    <div className="catalog-nav-slot">
    <motion.nav className="catalog-nav" aria-label="Menu categories" ref={railRoot} inert={searching} aria-hidden={searching || undefined}
      initial={false} animate={{ opacity: searching ? 0 : 1 }} transition={{ duration: reduced ? .08 : .14 }}>
      <Carousel ariaLabel="Product categories" className="catalog-rail" contentClassName="catalog-rail-track">
        {sections.map(section => <button type="button" key={section.id} aria-current={section.id === activeCategory ? 'true' : undefined}
          onClick={() => navigate.current?.(section.id)}>{section.name}</button>)}
      </Carousel>
      <span className="catalog-fade catalog-fade-left" style={{ width: fades.left }} aria-hidden="true" />
      <span className="catalog-fade catalog-fade-right" style={{ width: fades.right }} aria-hidden="true" />
    </motion.nav>
    <AnimatePresence initial={false}>{searching && <motion.h2 className="catalog-search-heading" id="catalog-search-title" role="status" aria-live="polite" aria-atomic="true"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .08 : .2 }}>
      <span>{results.length ? <>{results.length} {results.length === 1 ? 'result' : 'results'} for “{query.trim()}”</> : <>No results for “{query.trim()}”,<br />you might like these instead:</>}</span>
    </motion.h2>}</AnimatePresence>
    </div>
  </div>;
}

export function Catalog() {
  const { sections, quantities, change, selectCategory, navigate, openProduct, query, setQuery, results, openCart } = useCatalog();
  const flow = useFlow();
  const active = flow.current.id === 'catalog';
  const root = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchLayer = useRef<HTMLDivElement>(null);
  const savedScroll = useRef(0);
  const searching = !!normalizeSearch(query);
  const searchingRef = useRef(searching); searchingRef.current = searching;
  const summary = cartSummary(data.products, quantities);
  const setSearch = (open: boolean) => {
    const viewport = root.current?.querySelector<HTMLElement>('.catalog-scroll .mobile-scroll');
    if (open && viewport) savedScroll.current = viewport.scrollTop;
    if (!open) setQuery('');
    setSearchOpen(open);
  };
  useLayoutEffect(() => {
    if (searching) {
      const viewport = searchLayer.current?.querySelector<HTMLElement>('.mobile-scroll');
      if (viewport) viewport.scrollTop = 0;
    }
  }, [query, searching]);
  useLayoutEffect(() => {
    if (searchOpen) return;
    const viewport = root.current?.querySelector<HTMLElement>('.catalog-scroll .mobile-scroll');
    if (viewport) viewport.scrollTop = savedScroll.current;
  }, [searchOpen]);
  useEffect(() => { if (active) document.title = 'Prana — Menu'; }, [active]);

  useLayoutEffect(() => {
    if (!active) return;
    const viewport = root.current?.querySelector<HTMLElement>('.catalog-scroll .mobile-scroll');
    const content = root.current?.querySelector<HTMLElement>('.mobile-scroll-content');
    if (!viewport || !content) return;
    const headings = Array.from(viewport.querySelectorAll<HTMLElement>('[data-category]'));
    let movement: ReturnType<typeof animate> | null = null;
    let locked = false, generation = 0, frame = 0;
    const topOf = (element: HTMLElement) => {
      const scale = viewport.getBoundingClientRect().width / viewport.clientWidth;
      return (element.getBoundingClientRect().top - viewport.getBoundingClientRect().top) / scale + viewport.scrollTop;
    };
    const track = () => {
      setScrolled(previous => viewport.scrollTop > (previous ? 96 : 180));
      if (searchingRef.current) return;
      if (locked) return;
      let current = headings[0];
      if (viewport.scrollTop >= viewport.scrollHeight - viewport.clientHeight - 2) current = headings[headings.length - 1];
      else for (const heading of headings) { if (topOf(heading) <= viewport.scrollTop + 24) current = heading; else break; }
      if (current?.dataset.category) selectCategory(current.dataset.category);
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(track); };
    const interrupt = () => { generation += 1; movement?.stop(); movement = null; locked = false; };
    navigate.current = id => {
      const destination = id === '__top__' ? headings[0] : headings.find(heading => heading.dataset.category === id);
      if (!destination) return;
      interrupt();
      locked = true;
      selectCategory(destination.dataset.category!);
      const owner = generation;
      const target = id === '__top__' ? 0 : Math.max(0, Math.min(viewport.scrollHeight - viewport.clientHeight, topOf(destination) - 16));
      movement = animate(viewport.scrollTop, target, {
        duration: reduced ? 0 : Math.min(0.7, Math.max(0.4, 0.24 + Math.sqrt(Math.abs(target - viewport.scrollTop)) * 0.004)),
        ease: [0.3, 0, 0.7, 1], onUpdate: value => { viewport.scrollTop = value; },
        onComplete: () => { if (owner === generation) { locked = false; movement = null; } },
      });
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('pointerdown', interrupt, { passive: true });
    viewport.addEventListener('wheel', interrupt, { passive: true });
    viewport.addEventListener('keydown', interrupt);
    const resize = new ResizeObserver(onScroll); resize.observe(content);
    track();
    return () => {
      interrupt(); cancelAnimationFrame(frame); resize.disconnect(); navigate.current = null;
      viewport.removeEventListener('scroll', onScroll); viewport.removeEventListener('pointerdown', interrupt);
      viewport.removeEventListener('wheel', interrupt); viewport.removeEventListener('keydown', interrupt);
    };
  }, [active, reduced, navigate, selectCategory]);

  return <div className="catalog-screen" ref={root}>
    <motion.div className="catalog-list-layer" data-search-hidden={searching} inert={searching} aria-hidden={searching || undefined}
      initial={false} animate={{ opacity: searching ? 0 : 1 }} transition={{ duration: reduced ? .08 : .14 }}>
    <MobileScroll className="catalog-scroll"><div className="catalog-sections">
      {sections.map(section => <section key={section.id} className="catalog-section" data-category={section.id} aria-labelledby={`category-${section.id}`}>
        <h2 id={`category-${section.id}`}>{section.name}</h2><div className="catalog-grid">
          {section.items.map(({ product, large }) => <ProductCard key={product.id} product={product} large={large} quantity={quantities[product.id] ?? 0} onChange={change} onOpen={openProduct} />)}
        </div>
      </section>)}
    </div></MobileScroll>
    </motion.div>
    <div ref={searchLayer} className="catalog-results-host" inert={!searching} aria-hidden={!searching || undefined}>
    <AnimatePresence initial={false}>{searching && <motion.div className="catalog-results-layer" key="results" aria-labelledby="catalog-search-title"
      initial={{ opacity: 0, y: reduced ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 12 }} transition={{ duration: reduced ? .08 : .24, ease: [.2, .8, .2, 1] }}>
      <MobileScroll className="catalog-results-scroll"><motion.div className="catalog-search-results catalog-grid" key={normalizeSearch(query)}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? .08 : .18 }}>
        {(results.length ? results : suggestions).map(product => <ProductCard key={product.id} product={product} large={false} quantity={quantities[product.id] ?? 0}
          onChange={change} onOpen={openProduct} idPrefix="search" />)}
      </motion.div></MobileScroll>
    </motion.div>}</AnimatePresence>
    </div>
    <CatalogTools scrolled={scrolled} searchOpen={searchOpen} query={query} count={summary.count} cents={summary.cents}
      onSearchOpen={setSearch} onQuery={setQuery} onTop={() => navigate.current?.('__top__')} onCart={openCart} />
  </div>;
}
