import { useRef } from "react";
import { Icon } from "./Icon.jsx";
import { isPlainClick } from "../navigation/useNavigation.js";
import { AnimatedValue } from "./AnimatedValue.jsx";

export function Header({ query, searchFocused, onSearchFocusChange, onQueryChange, onHome, onOpenCart, isCart, cartQuantity, onOpenProfile, isProfile }) {
  const searchInput = useRef(null);
  return (
    <header className="site-header" data-search-focused={searchFocused}>
      <div className="page-container header-inner">
        <div className="header-identity">
          <a className="header-logo" href="/" aria-label="Prana home" onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onHome();
          }}><img src="/assets/header-logo.svg" alt="Prana" /></a>
          <div className="delivery-address">
            <span className="location-icon"><Icon name="header-location" /></span>
            <span className="delivery-copy"><span>Deliver to</span><strong>Choose delivery address</strong></span>
          </div>
        </div>
        <div className="header-actions">
          <div className="search-field" onFocus={() => onSearchFocusChange(true)}
            onClick={(event) => { if (event.target === event.currentTarget) searchInput.current?.focus(); }}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onSearchFocusChange(false); }}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
              event.preventDefault();
              onQueryChange("");
              event.target.blur();
            }}>
            <label className="search-input">
              <Icon name="header-search" />
              <input ref={searchInput} type="search" aria-label="Search menu" placeholder="Search menu" value={query}
                autoComplete="off" spellCheck={false} onChange={(event) => onQueryChange(event.target.value)} />
            </label>
            {query && <button className="search-clear" type="button" aria-label="Clear search"
              onPointerDown={(event) => { if (event.button === 0) event.preventDefault(); }}
              onClick={() => {
                onQueryChange("");
                searchInput.current?.focus({ preventScroll: true });
              }}><img src="/assets/header-search-clear.svg" alt="" width="16" height="16" /></button>}
          </div>
          <a className="header-cart" data-filled={cartQuantity > 0} style={{ width: cartQuantity ? 107 + (String(cartQuantity).length - 1) * 7 : 91 }} href="/cart"
            aria-label={cartQuantity ? `Cart, ${cartQuantity} ${cartQuantity === 1 ? "item" : "items"}` : "Cart"} aria-current={isCart ? "page" : undefined} onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault();
            onOpenCart();
          }}><Icon name={cartQuantity ? "header-basket-filled" : "header-basket"} /><span>Cart</span>
            {cartQuantity > 0 && <span className="header-cart-count" aria-hidden="true"><AnimatedValue value={cartQuantity} /></span>}
          </a>
          <span className="sr-only" role="status">{cartQuantity} {cartQuantity === 1 ? "item" : "items"} in cart</span>
          <a className="profile-avatar" href="/profile" aria-label="Profile" aria-current={isProfile ? "page" : undefined} onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault(); onOpenProfile();
          }}><Icon name="header-user" /></a>
        </div>
      </div>
    </header>
  );
}
