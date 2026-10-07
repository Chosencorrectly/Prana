export function changeCartQuantity(quantities, id, delta) {
  const next = { ...quantities };
  const quantity = Math.max(0, (next[id] ?? 0) + delta);
  if (quantity) next[id] = quantity;
  else delete next[id];
  return next;
}

export function getCart(products, quantities, promoStatus = "idle") {
  const items = products.filter((product) => quantities[product.id] > 0)
    .map((product) => ({ product, quantity: quantities[product.id] }));
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  // User-requested test code: the -10% response shown in the Figma example.
  const discountCents = promoStatus === "applied" ? Math.round(subtotalCents * 10 / 100) : 0;
  return { items, quantity, subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}
