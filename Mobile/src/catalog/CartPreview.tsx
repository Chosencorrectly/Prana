import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cartScenarios, type CartScenario } from './cart-preview-model';
import './cart-preview.css';

/** Preview chrome outside the phone, never part of the customer's cart. */
export function CartPreview({ onOpen }: { onOpen: (scenario: CartScenario, trigger: HTMLButtonElement) => void }) {
  const [expanded, setExpanded] = useState(false);
  return createPortal(<aside className="cart-preview" aria-label="Демосценарии корзины">
    <button className="cart-preview-toggle" type="button" aria-expanded={expanded} aria-controls="cart-preview-options" onClick={() => setExpanded(value => !value)}>Состояния корзины <span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
    {expanded && <div id="cart-preview-options" className="cart-preview-options">
      <p>Отдельная демокорзина с реальными блюдами. Ваш выбор в меню сохранится. Закройте корзину, чтобы выбрать другой сценарий.</p>
      {cartScenarios.map(scenario => <button key={scenario.id} type="button" title={scenario.hint} onClick={event => onOpen(scenario.id, event.currentTarget)}>{scenario.label}</button>)}
    </div>}
  </aside>, document.body);
}
