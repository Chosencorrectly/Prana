import { getProductDetails, getRelatedProducts } from "../data/product-details.js";
import { isPlainClick } from "../navigation/useNavigation.js";
import { ProductCard } from "./ProductCard.jsx";
import { QuantityControl } from "./QuantityControl.jsx";

export function ProductDetail({ product, products, quantities, onQuantityChange, onOpen, onBack }) {
  const details = getProductDetails(product);
  const nutrition = [
    { label: "kcal", value: product.kcal, unit: "" },
    { label: "Protein", value: product.nutrition.protein, unit: " g" },
    { label: "Fat", value: product.nutrition.fat, unit: " g" },
    { label: "Carbs", value: product.nutrition.carbs, unit: " g" },
  ].filter(({ value }) => value != null);

  return (
    <main className="page-container dish-page">
      <a className="back-to-menu" href="/" onClick={(event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault(); onBack();
      }}><span className="icon back-to-menu-arrow" aria-hidden="true" />Back to menu</a>
      <div className="dish-layout">
        <div className="dish-photo"><img src={`/assets/${product.image}`} alt={product.imageAlt} width="600" height="564" decoding="async" /></div>
        <div className="dish-information">
          <div className="dish-heading">
            {details.tags.length > 0 && <ul className="dish-tags" aria-label="Dietary labels from the menu">{details.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
            <div>
              <h1 className="dish-title" tabIndex={-1}>{details.title}</h1>
              {details.summary && <p className="dish-description">{details.summary}</p>}
            </div>
          </div>
          <QuantityControl variant="detail" product={product} quantity={quantities[product.id]} onChange={(delta) => onQuantityChange(product.id, delta)} />
          {nutrition.length > 0 && <section className="dish-nutrition" aria-labelledby="dish-nutrition-title">
            <h2 id="dish-nutrition-title">Nutrition per serving</h2>
            <dl>{nutrition.map(({ label, value, unit }) => <div key={label}><dt>{label}</dt><dd>{value}{unit}</dd></div>)}</dl>
          </section>}
          {(details.ingredients || details.description) && <section className="dish-ingredients" aria-labelledby="dish-ingredients-title">
            <h2 id="dish-ingredients-title">{details.ingredients ? "Ingredients" : "About this dish"}</h2>
            <p>{details.ingredients || details.description}</p>
          </section>}
        </div>
      </div>
      <section className="dish-related" aria-labelledby="dish-related-title">
        <h2 id="dish-related-title">Goes well with</h2>
        <div className="product-grid">{getRelatedProducts(product, products).map((related) => <ProductCard key={related.id} product={related} quantity={quantities[related.id]} onQuantityChange={(delta) => onQuantityChange(related.id, delta)} onOpen={onOpen} />)}</div>
      </section>
    </main>
  );
}
