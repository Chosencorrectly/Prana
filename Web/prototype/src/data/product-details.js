// Presentation only. Tags come from explicit source labels, never from ingredients.
const dietaryLabel = /^(GF|LF|VG|vegan|vegetarian|nut free|gluten free|high protein|high fiber|high omega-3|omega-3|high iron|high collagen|keto|low calorie)$/i;

export function getProductDetails(product) {
  const tags = [];
  const qualifiers = [];
  const title = product.name.replace(/\(([^()]*)\)/g, (group, text) => {
    const parts = text.split(",").map((part) => part.trim());
    if (parts.every((part) => dietaryLabel.test(part))) tags.push(...parts);
    else qualifiers.push(text);
    return "";
  }).replace(/\s+/g, " ").trim();
  const subtitle = qualifiers.join(" · ");
  const hasSourceDescription = product.descriptionSource !== "prototype-draft";
  // Source snapshots have a single description field. Do not invent a second
  // marketing paragraph or relabel a prototype draft as a verified ingredient list.
  return {
    title,
    tags: [...new Set(tags)],
    summary: subtitle ? subtitle[0].toUpperCase() + subtitle.slice(1) : product.description,
    ingredients: subtitle && hasSourceDescription ? product.description : null,
    description: subtitle && !hasSourceDescription ? product.description : null,
  };
}

// Visual prototype assortment, not an API-backed or dietary recommendation.
export function getRelatedProducts(product, products) {
  const others = products.filter((candidate) => candidate.id !== product.id);
  return [...others.filter((candidate) => candidate.categoryId === product.categoryId),
    ...others.filter((candidate) => candidate.categoryId !== product.categoryId)].slice(0, 6);
}
