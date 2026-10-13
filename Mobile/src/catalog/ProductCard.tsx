import { memo } from 'react';
import type { Product } from './catalog-model';
import { QuantityControl } from './QuantityControl';

function Nutrition({ product, calories = false }: { product: Product; calories?: boolean }) {
  const nutrients = [
    ...(calories && product.kcal != null ? [{ value: product.kcal, label: 'kcal', full: 'kilocalories' }] : []),
    ...([{ key: 'protein', label: 'pr', full: 'grams protein' }, { key: 'fat', label: 'fa', full: 'grams fat' }, { key: 'carbs', label: 'ca', full: 'grams carbohydrates' }] as const)
      .filter(item => product.nutrition[item.key] != null).map(item => ({ ...item, value: product.nutrition[item.key] })),
  ];
  return nutrients.length ? <ul className="catalog-nutrition" aria-label="Nutrition per portion">{nutrients.map(item => <li key={item.label} aria-label={`${item.value} ${item.full}`}><span>{item.value}</span><span>{item.label}</span></li>)}</ul> : null;
}

export const ProductCard = memo(function ProductCard({ product, large, quantity, onChange, onOpen, idPrefix = 'catalog' }: {
  product: Product; large: boolean; quantity: number; onChange: (id: string, delta: number) => void;
  idPrefix?: string;
  onOpen: (product: Product, trigger: HTMLButtonElement) => void;
}) {
  return <article className={`catalog-card${large ? ' catalog-card-large' : ''}`} data-product-id={product.id} data-card-size={large ? 'large' : 'small'} aria-labelledby={`${idPrefix}-${product.id}`}>
    <button className="catalog-open" type="button" aria-label={`View ${product.name}`} onClick={event => onOpen(product, event.currentTarget)} />
    <div className="catalog-photo"><img src={`/assets/${product.image}`} alt={product.imageAlt} width="398" height={large ? 457 : 398} loading="lazy" decoding="async" />
      {!large && product.kcal != null && <span className="catalog-kcal"><span>{product.kcal}</span><span>kcal</span></span>}
    </div>
    <div className="catalog-card-content">
      <div className="catalog-copy"><h3 id={`${idPrefix}-${product.id}`}>{product.name}</h3><p title={product.description}>{product.description}</p></div>
      <div className="catalog-card-bottom"><Nutrition product={product} calories={large} /><QuantityControl product={product} quantity={quantity} large={large} onChange={onChange} /></div>
    </div>
  </article>;
});

