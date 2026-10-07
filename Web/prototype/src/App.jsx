import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { categories, products } from "./data/catalog.js";
import { Header } from "./components/Header.jsx";
import { CategoryNav } from "./components/CategoryNav.jsx";
import { ProductCard } from "./components/ProductCard.jsx";
import { Footer } from "./components/Footer.jsx";
import { createPageScroller } from "./motion/page-scroll.js";
import { ProductDetail } from "./components/ProductDetail.jsx";
import { useNavigation } from "./navigation/useNavigation.js";
import { SearchResults } from "./components/SearchResults.jsx";
import { normalizeSearchQuery, searchMenu } from "./data/search.js";
import { CartPage } from "./components/CartPage.jsx";
import { CheckoutPage } from "./components/CheckoutPage.jsx";
import { changeCartQuantity, getCart } from "./data/cart.js";
import { usePromoCode } from "./data/usePromoCode.js";
import { ProfilePage } from "./components/ProfilePage.jsx";
import { createDemoOrders, createProfile, profileReducer } from "./data/profile.js";

const menuCategories = categories.map((category) => ({
  ...category,
  products: products.filter((product) => product.categoryId === category.id),
}));

export function App() {
  const navigation = useNavigation();
  const product = products.find((item) => navigation.path === `/dish/${item.id}`);
  const isMenu = navigation.path === "/";
  const isCart = navigation.path === "/cart";
  const isCheckout = navigation.path === "/checkout";
  const isProfile = navigation.path === "/profile";
  const [profile, dispatchProfile] = useReducer(profileReducer, undefined, createProfile);
  const [demoOrders] = useState(() => createDemoOrders(products));
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [pendingCategory, setPendingCategory] = useState(null);
  const pageScroller = useRef(null);
  const [quantities, setQuantities] = useState(() => Object.fromEntries(products.map((p) => [p.id, p.initialQuantity])));
  const promo = usePromoCode();
  const cart = getCart(products, quantities, promo.status);
  useEffect(() => { if (!cart.quantity) promo.clear(); }, [cart.quantity]);
  const normalizedQuery = normalizeSearchQuery(query);
  const visibleProducts = normalizedQuery ? searchMenu(normalizedQuery) : products;

  const updateActiveCategory = useCallback(() => {
    if (pageScroller.current?.running) return;
    const sections = [...document.querySelectorAll(".menu-section")];
    if (!sections.length) return;
    // Track the same landing line used by scrollIntoView, with rounding tolerance.
    const activationOffset = Number.parseFloat(getComputedStyle(sections[0]).scrollMarginTop) + 1;
    let current = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= activationOffset) current = section.id;
    }
    setActiveCategory(current);
  }, []);

  useEffect(() => {
    const scroller = createPageScroller(updateActiveCategory);
    pageScroller.current = scroller;
    window.addEventListener("scroll", updateActiveCategory, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateActiveCategory);
      scroller.dispose();
      pageScroller.current = null;
    };
  }, [updateActiveCategory]);

  useEffect(() => {
    if (pendingCategory) {
      setActiveCategory(pendingCategory);
      pageScroller.current?.scrollTo(document.getElementById(pendingCategory));
      setPendingCategory(null);
    } else updateActiveCategory();
  }, [pendingCategory, normalizedQuery, navigation.path, updateActiveCategory]);

  useEffect(() => {
    document.title = product ? `${product.name} — Prana` : isCart ? "Cart — Prana" : isCheckout ? "Checkout — Prana" : isProfile ? "Account — Prana" : isMenu ? "Prana — Menu" : "Dish not found — Prana";
  }, [product, isMenu, isCart, isCheckout, isProfile]);

  useLayoutEffect(() => { pageScroller.current?.interrupt(); }, [navigation.path]);

  function navigateToCategory(id) {
    if (!isMenu) navigation.navigate("/");
    setQuery("");
    setActiveCategory(id);
    setPendingCategory(id);
  }
  function changeQuery(value) {
    pageScroller.current?.interrupt();
    setPendingCategory(null);
    setQuery(value);
    if (!isMenu) navigation.navigate("/");
    // Keep the first results below the sticky navigation even when searching deep in the menu.
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openDish(id) {
    pageScroller.current?.interrupt();
    setPendingCategory(null);
    navigation.openDish(id);
  }
  function changeQuantity(id, delta) {
    setQuantities((current) => changeCartQuantity(current, id, delta));
  }
  function openCart() {
    pageScroller.current?.interrupt();
    setPendingCategory(null);
    navigation.openCart();
  }
  function openProfile() {
    pageScroller.current?.interrupt();
    setPendingCategory(null);
    navigation.openProfile();
  }
  return (
    <>
      <Header query={query} searchFocused={searchFocused} onSearchFocusChange={setSearchFocused}
        onQueryChange={changeQuery} onHome={() => navigateToCategory(categories[0].id)} onOpenCart={openCart} isCart={isCart} cartQuantity={cart.quantity} onOpenProfile={openProfile} isProfile={isProfile} />
      {isMenu ? <main className="page-container menu-page" data-search-focused={searchFocused}>
        <h1 className="sr-only">Prana menu</h1>
        <CategoryNav categories={categories} activeCategory={activeCategory} onSelect={navigateToCategory} />
        <div id="menu-content">
          {normalizedQuery ? <SearchResults query={query} products={visibleProducts} quantities={quantities}
            onQuantityChange={changeQuantity} onOpen={openDish} /> : (
            menuCategories.map((category) => (
              <section className="menu-section" id={category.id} key={category.id} aria-labelledby={`${category.id}-title`}>
                <h2 id={`${category.id}-title`}>{category.name}</h2>
                <div className="product-grid">
                  {category.products.map((product) => <ProductCard key={product.id} product={product} quantity={quantities[product.id]} onQuantityChange={(delta) => changeQuantity(product.id, delta)} onOpen={openDish} />)}
                </div>
              </section>
            ))
          )}
        </div>
      </main> : isCart ? <CartPage cart={cart} promo={promo} onQuantityChange={changeQuantity} onClear={() => { setQuantities({}); promo.clear(); }} onBack={navigation.backToMenu} onBrowse={() => navigateToCategory(categories[0].id)} onCheckout={navigation.openCheckout} /> : isCheckout ? <CheckoutPage cart={cart} promo={promo} onBack={navigation.backToCart} /> : isProfile ? <ProfilePage profile={profile} dispatch={dispatchProfile} orders={demoOrders} /> : product ? <ProductDetail key={product.id} product={product} products={products} quantities={quantities} onQuantityChange={changeQuantity} onOpen={openDish} onBack={navigation.backToMenu} /> : <main className="page-container dish-page dish-not-found">
        <h1 className="dish-title" tabIndex={-1}>Dish not found</h1><p>This dish is not in the current menu.</p><button onClick={navigation.backToMenu}>Back to menu</button>
      </main>}
      {(isMenu || isCheckout || isProfile) && <Footer />}
    </>
  );
}
