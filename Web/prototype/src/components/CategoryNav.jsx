import { useCallback, useEffect, useRef } from "react";
import { createMenuScroller, menuScrollPosition } from "../motion/menu-scroll.js";

const MAX_FADE_WIDTH = 127;
const PEEK_CLEARANCE = 8;
const HOVER_NUDGE = 12;

const clamp = (value, maximum) => Math.max(0, Math.min(value, maximum));

function getMenuMetrics(list) {
  const maximum = Math.max(0, list.scrollWidth - list.clientWidth);
  const current = menuScrollPosition(list);
  // A small amount of hidden content needs an equally small fade, on either edge.
  return {
    maximum,
    current,
    fadeLeft: Math.min(current, MAX_FADE_WIDTH),
    fadeRight: Math.min(maximum - current, MAX_FADE_WIDTH),
  };
}

function getMenuBounds(list, link) {
  const metrics = getMenuMetrics(list);
  return {
    ...metrics,
    left: link.offsetLeft,
    right: link.offsetLeft + link.getBoundingClientRect().width,
    clearLeft: metrics.current + metrics.fadeLeft,
    clearRight: metrics.current + list.clientWidth - metrics.fadeRight,
  };
}

export function CategoryNav({ categories, activeCategory, onSelect }) {
  const listRef = useRef(null);
  const overflowRef = useRef(null);
  const scrollerRef = useRef(null);
  const hover = useRef({ origin: null, consumed: false });

  const updateOverflow = useCallback(() => {
    const list = listRef.current;
    const overflow = overflowRef.current;
    if (!list || !overflow) return;
    const { fadeLeft, fadeRight } = getMenuMetrics(list);
    // Keep fades on the same frame as the track, outside React's render cycle.
    overflow.style.setProperty("--category-fade-left", `${fadeLeft}px`);
    overflow.style.setProperty("--category-fade-right", `${fadeRight}px`);
    overflow.dataset.overflowLeft = String(fadeLeft > 0);
    overflow.dataset.overflowRight = String(fadeRight > 0);
  }, []);

  useEffect(() => {
    const scroller = createMenuScroller(listRef.current, updateOverflow);
    scrollerRef.current = scroller;
    return () => { scroller.dispose(); scrollerRef.current = null; };
  }, [updateOverflow]);

  const revealActive = useCallback(() => {
    const list = listRef.current;
    const selected = list?.querySelector('[aria-current="true"]');
    if (!list || !selected) return;
    // A real navigation commits its own position; pointer leave must not undo it.
    hover.current = { origin: null, consumed: true };
    const bounds = getMenuBounds(list, selected);
    const target = clamp((bounds.left + bounds.right - list.clientWidth) / 2, bounds.maximum);
    // End groups settle against the real content edge, even after a hover hint.
    const atEndGroup = target === 0 || target === bounds.maximum;
    if (atEndGroup || bounds.left < bounds.clearLeft || bounds.right > bounds.clearRight) {
      scrollerRef.current?.scrollTo(target);
    }
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      updateOverflow();
      revealActive();
    });
    observer.observe(list);
    updateOverflow();
    return () => observer.disconnect();
  }, [updateOverflow, revealActive]);

  useEffect(() => { revealActive(); }, [activeCategory, revealActive]);

  function revealFocused(link) {
    const list = listRef.current;
    if (!list) return;
    hover.current = { origin: null, consumed: true };
    // Tab may natively scroll to the next link before this handler runs. An old
    // animation must not pull focus back offscreen after that browser scroll.
    scrollerRef.current?.interrupt();
    const bounds = getMenuBounds(list, link);
    if (bounds.left < bounds.clearLeft) {
      scrollerRef.current?.scrollTo(bounds.left - MAX_FADE_WIDTH - PEEK_CLEARANCE);
    } else if (bounds.right > bounds.clearRight) {
      scrollerRef.current?.scrollTo(bounds.right - list.clientWidth + MAX_FADE_WIDTH + PEEK_CLEARANCE);
    }
  }

  function handlePointerEnter(event) {
    const list = listRef.current;
    if (!list || event.pointerType !== "mouse" || event.buttons || hover.current.consumed) return;
    const bounds = getMenuBounds(list, event.currentTarget);
    const direction = bounds.left < bounds.clearLeft ? -1 : bounds.right > bounds.clearRight ? 1 : 0;
    if (!direction) return;
    const origin = hover.current.origin ?? bounds.current;
    // Only one hint per visit to the strip, even if another link moves under the pointer.
    hover.current = { origin, consumed: true };
    scrollerRef.current?.scrollTo(origin + direction * HOVER_NUDGE, "menuHint");
  }

  function endHover() {
    const list = listRef.current;
    if (list && hover.current.origin !== null) scrollerRef.current?.scrollTo(hover.current.origin, "menuReturn");
    // Keep the origin during the return, so quick re-entry cannot accumulate nudges.
    hover.current.consumed = false;
  }

  function interruptMotion() {
    hover.current = { origin: null, consumed: true };
    scrollerRef.current?.interrupt();
  }

  return (
    <nav className="category-nav" aria-label="Menu categories">
      <div className="category-overflow" ref={overflowRef}
        onPointerEnter={() => { hover.current.consumed = false; }} onPointerLeave={endHover}>
        <div className="category-list" ref={listRef} onScroll={updateOverflow}
          onWheel={interruptMotion}
          onPointerDown={(event) => { if (event.pointerType !== "mouse") interruptMotion(); }}>
          <ul className="category-track">
          {categories.map((category) => (
            <li key={category.id}>
              <a href={`#${category.id}`} className={`category-link${category.id === activeCategory ? " category-active" : ""}`}
                aria-current={category.id === activeCategory ? "true" : undefined}
                onPointerEnter={handlePointerEnter}
                onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) revealFocused(event.currentTarget); }}
                onClick={(event) => {
                  event.preventDefault();
                  hover.current = { origin: null, consumed: true };
                  onSelect(category.id);
                  if (category.id === activeCategory) revealActive();
                }}>
                {category.name}
              </a>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
