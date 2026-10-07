import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const dishPath = (id) => `/dish/${encodeURIComponent(id)}`;
export const isPlainClick = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

// Small History API adapter: quantities stay in App, scroll/focus belong to each entry.
export function useNavigation() {
  const [route, setRoute] = useState(() => ({
    path: window.location.pathname,
    key: window.history.state?.prana?.key ?? "initial",
    menuDepth: window.history.state?.prana?.menuDepth ?? 0,
    cartOrigin: window.history.state?.prana?.cartOrigin,
  }));
  const current = useRef(route);
  const positions = useRef(new Map());

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.history.replaceState({ ...window.history.state, prana: current.current }, "");
    function onPopState(event) {
      positions.current.set(current.current.key, {
        ...positions.current.get(current.current.key), top: window.scrollY,
      });
      setRoute({ path: window.location.pathname, key: event.state?.prana?.key ?? "initial", menuDepth: event.state?.prana?.menuDepth ?? 0, cartOrigin: event.state?.prana?.cartOrigin });
    }
    window.addEventListener("popstate", onPopState);
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useLayoutEffect(() => {
    current.current = route;
    const saved = positions.current.get(route.key);
    window.scrollTo({ top: saved?.top ?? 0, behavior: "instant" });
    if (saved?.focusSelector) {
      document.querySelector(saved.focusSelector)?.focus({ preventScroll: true });
    } else if (saved?.focusId) {
      document.querySelector(`[data-dish-link="${saved.focusId}"]`)?.focus({ preventScroll: true });
    } else if (route.path !== "/") {
      document.querySelector(".dish-title, .cart-title, .checkout-title, .profile-title")?.focus({ preventScroll: true });
    }
  }, [route]);

  function navigate(path, { focusId, focusSelector, menuDepth = 0, cartOrigin } = {}) {
    positions.current.set(route.key, { top: window.scrollY, focusId, focusSelector });
    const next = { path, key: crypto.randomUUID(), menuDepth, cartOrigin };
    window.history.pushState({ prana: next }, "", path);
    setRoute(next);
  }

  function openDish(id) {
    navigate(dishPath(id), { focusId: id, menuDepth: route.path === "/" ? 1 : route.menuDepth ? route.menuDepth + 1 : 0 });
  }

  function backToMenu() {
    if (route.menuDepth) window.history.go(-route.menuDepth);
    else navigate("/");
  }

  function openCart() {
    if (route.path === "/cart") return;
    if (route.path === "/checkout") { backToCart(); return; }
    navigate("/cart", { focusSelector: ".header-cart", menuDepth: route.path === "/" ? 1 : route.menuDepth ? route.menuDepth + 1 : 0 });
  }

  function openCheckout() {
    if (route.path !== "/cart") return;
    navigate("/checkout", { focusSelector: ".cart-checkout", cartOrigin: route.key, menuDepth: route.menuDepth ? route.menuDepth + 1 : 0 });
  }

  function openProfile() {
    if (route.path === "/profile") return;
    navigate("/profile", { focusSelector: ".profile-avatar", menuDepth: route.path === "/" ? 1 : route.menuDepth ? route.menuDepth + 1 : 0 });
  }

  function backToCart() {
    if (route.cartOrigin) window.history.back();
    else navigate("/cart");
  }

  return { path: route.path, navigate, openDish, openCart, openCheckout, openProfile, backToCart, backToMenu };
}
