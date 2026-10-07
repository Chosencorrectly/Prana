import { motion, useReducedMotion } from "motion/react";
import { motion as timings } from "../motion/tokens.js";
import { searchRecommendations } from "../data/search.js";
import { ProductCard } from "./ProductCard.jsx";

export function SearchResults({ query, products, quantities, onQuantityChange, onOpen }) {
  const reduced = useReducedMotion();
  const hasResults = products.length > 0;
  const shownProducts = hasResults ? products : searchRecommendations;

  return (
    <section className="search-results" aria-labelledby="search-title">
      <h2 id="search-title" aria-live="polite" aria-atomic="true">
        {hasResults ? <>{products.length} {products.length === 1 ? "result" : "results"} for “{query.trim()}”</> : <>
          No results for “{query.trim()}”,<br />you might like these instead:
        </>}
      </h2>
      <div className="product-grid">
        {shownProducts.map((product) => (
          <motion.div className="search-result" key={product.id} layout={reduced ? false : "position"}
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...timings.searchResultEnter, layout: timings.searchResultMove }}>
            <ProductCard product={product} quantity={quantities[product.id]}
              onQuantityChange={(delta) => onQuantityChange(product.id, delta)} onOpen={onOpen} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
