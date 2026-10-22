import { useRef } from 'react';
import { useActiveOrder } from '../catalog/ActiveOrderState';
import data from '../catalog/catalog.json';
import { money } from '../catalog/catalog-model';
import { demoHistory, reorderItems, type HistoryOrder } from './profile-model';
import { useProfileSession } from './profile-session';
import { ProfileBody, ProfileButton, ProfileDock, ProfileHeading, ProfileNotice, ProfileRow, ProfileStateView } from './ProfileUI';

const receiptTotal = (order: HistoryOrder) => order.items.reduce((total, item) => total + item.quantity * item.priceCents, 0);
const receiptCount = (order: HistoryOrder) => order.items.reduce((total, item) => total + item.quantity, 0);
function OrderPhoto({ id }: { id: string }) {
  const product = data.products.find(item => item.id === id);
  return product ? <img className="profile-order-photo" src={`/assets/${product.image}`} alt="" draggable={false} /> : <span className="profile-order-photo profile-photo-fallback" aria-hidden="true" />;
}
export function OrdersScreen() {
  const s = useProfileSession(), { order: active } = useActiveOrder(), history = demoHistory(data.products);
  if (s.feedback.orders === 'error') return <><ProfileStateView title="Couldn’t load your orders">Your orders haven’t been removed. Check your connection and try again.</ProfileStateView><ProfileDock route="orders"><ProfileButton disabled={!!s.busy} onClick={() => s.run('orders', () => s.setFeedback(current => ({ ...current, orders: navigator.onLine ? undefined : 'error' })))}>{s.busy ? 'Loading…' : 'Try again'}</ProfileButton></ProfileDock></>;
  if (s.scenario === 'orders-empty') return <><ProfileStateView icon="bag" title="Your first order starts here">Once you place an order, you’ll find it here.</ProfileStateView><ProfileDock route="orders"><ProfileButton onClick={s.onClose}>Browse menu</ProfileButton></ProfileDock></>;
  const delivered = history[0], cancelled = history[1];
  const show = (order: HistoryOrder) => { s.setOrder(order); s.push('order'); };
  return <ProfileBody><ProfileHeading>My orders</ProfileHeading>
    {active && <button className="profile-order-card" type="button" onClick={() => s.push('tracking')}><span className="profile-order-status profile-green">{active.status}</span><span className="profile-order-summary"><OrderPhoto id={active.items[0].id} /><span><strong>Order #139</strong><small>Today · {active.count} {active.count === 1 ? 'item' : 'items'}</small><b>{money(active.totalCents)}</b></span></span><span>Track delivery →</span></button>}
    <h2 className="profile-section-heading">Previous orders</h2>
    <button className="profile-order-card" type="button" onClick={() => show(delivered)}><span className="profile-order-status">Delivered</span><span className="profile-order-summary"><OrderPhoto id={delivered.items[0].id} /><span><strong>Order #{delivered.id}</strong><small>{delivered.date} · {receiptCount(delivered)} items</small><b>{money(receiptTotal(delivered))}</b></span></span><span>View order →</span></button>
    <ProfileRow title={`Order #${cancelled.id} · Cancelled`} description={`${cancelled.date} · View details`} onClick={() => show(cancelled)} />
  </ProfileBody>;
}
function ReceiptItems({ order }: { order: HistoryOrder }) {
  return <div className="profile-receipt-items">{order.items.map(item => <div className="profile-receipt-item" key={item.id}><OrderPhoto id={item.id} /><div><h3>{item.name}</h3><p>{data.products.find(product => product.id === item.id)?.description}</p><div><span>{item.quantity} {item.quantity === 1 ? 'item' : 'items'}</span><strong>{money(item.priceCents * item.quantity)}</strong></div></div></div>)}</div>;
}
export function OrderScreen() {
  const s = useProfileSession(), order = s.order;
  return <><ProfileBody><ProfileHeading description={`${order.date}${order.status === 'Delivered' ? ' · 12:35 PM' : ''}`}>{order.status === 'Cancelled' ? 'Order cancelled' : `Order #${order.id}`}</ProfileHeading>
    <div className="profile-info-card"><ProfileRow title={order.status === 'Cancelled' ? `Order #${order.id}` : 'Delivered'} description={order.address} /><ProfileRow title={order.status === 'Cancelled' ? 'Payment status' : 'Payment method'} description={order.payment} /></div>
    <h2 className="profile-section-heading">Your dishes</h2><ReceiptItems order={order} />
    <dl className="profile-totals"><div><dt>{receiptCount(order)} items</dt><dd>{money(receiptTotal(order))}</dd></div>{order.status === 'Delivered' && <div><dt>Delivery</dt><dd>$0.00</dd></div>}<div><dt>{order.status === 'Delivered' ? 'Total paid' : 'Order total'}</dt><dd>{money(receiptTotal(order))}</dd></div></dl>
    <ProfileRow title="Need help with this order?" onClick={() => s.push('support')} />
  </ProfileBody><ProfileDock route="order"><ProfileButton onClick={() => s.push('reorder')}>Reorder</ProfileButton></ProfileDock></>;
}
export function ReorderScreen() {
  const s = useProfileSession(), result = reorderItems(s.order, data.products), submitted = useRef(false);
  if (!result.available.length) return <><ProfileStateView icon="bag" title="These items aren’t available">The menu has changed since this order. Explore today’s dishes to find something you’ll love.</ProfileStateView><ProfileDock route="reorder"><ProfileButton onClick={s.onClose}>Browse menu</ProfileButton></ProfileDock></>;
  return <><ProfileBody><ProfileHeading description="Availability and prices can change.">Review before reordering</ProfileHeading>
    {result.unavailable.length > 0 && <ProfileNotice title={`${result.unavailable.length} ${result.unavailable.length === 1 ? 'item is' : 'items are'} unavailable`}>{result.unavailable.map(item => item.name).join(', ')} won’t be added.</ProfileNotice>}
    <ReceiptItems order={{ ...s.order, items: result.available.map(({ product, quantity }) => ({ id: product.id, name: product.name, quantity, priceCents: product.priceCents })) }} />
    <dl className="profile-totals"><div><dt>Available items</dt><dd>{result.count}</dd></div><div><dt>Items subtotal</dt><dd>{money(result.cents)}</dd></div></dl>
  </ProfileBody><ProfileDock route="reorder"><ProfileButton onClick={() => { if (submitted.current) return; submitted.current = true; s.onCart(s.order, !!s.scenario); }}>Review cart · {money(result.cents)}</ProfileButton></ProfileDock></>;
}
