import { QuantityControl } from "./QuantityControl.jsx";
import { dishPath, isPlainClick } from "../navigation/useNavigation.js";

export function ProductCard({ product, quantity, onQuantityChange, onOpen }) {
  const macros = [
    { key: "protein", label: "pr", fullLabel: "protein" },
    { key: "fat", label: "fa", fullLabel: "fat" },
    { key: "carbs", label: "ca", fullLabel: "carbohydrates" },
  ].filter(({ key }) => product.nutrition[key] != null);
  return (
    <article className="product-card" aria-labelledby={`${product.id}-title`}>
      <div className="product-photo">
        <img src={`/assets/${product.image}`} alt={product.imageAlt} width="244" height="244" loading="lazy" decoding="async" />
        {product.kcal != null && <span className="calorie-badge"><span>{product.kcal}</span><span>kcal</span></span>}
      </div>
      <div className="product-content">
        <div className="product-copy"><h3 id={`${product.id}-title`}><a className="product-link" data-dish-link={product.id} href={dishPath(product.id)} onClick={(event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault(); onOpen(product.id);
        }}>{product.name}</a></h3><p title={product.description}>{product.description}</p></div>
        {macros.length > 0 && <ul className="nutrition-list" aria-label="Nutrition per portion">
          {macros.map(({ key, label, fullLabel }) => <li key={key} aria-label={`${product.nutrition[key]} grams of ${fullLabel}`}><span>{product.nutrition[key]}</span><span>{label}</span></li>)}
        </ul>}
      </div>
      <QuantityControl product={product} quantity={quantity} onChange={onQuantityChange} />
    </article>
  );
}
