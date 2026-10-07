// Prototype editorial policy. Keep the imported snapshot intact and normalize
// the shared product model so visible copy, tooltips, search and a11y agree.
const preservedCase = new Map([
  ['gf', 'GF'], ['lf', 'LF'], ['vg', 'VG'], ['okf', 'OKF'],
  ['prana', 'Prana'], ['miami', 'Miami'], ['greek', 'Greek'], ['buddha', 'Buddha'],
]);

// Reviewed punctuation/typo repairs from the current menu. These only match
// existing wording; they do not replace a whole product's future description.
const repairs = [
  [/\(GF,\s*LF\.\)\)/gi, '(GF, LF)'],
  [/puree\),\s*Roasted Beets\)/gi, 'puree, roasted beets)'],
  [/\bhouse,\s*crunch mix\b/gi, 'house crunch mix'],
  [/\bcrunch mix\.\s*miso ginger dress\.,/gi, 'crunch mix, miso ginger dressing,'],
  [/\bcrispy garlic microgreens\b/gi, 'crispy garlic, microgreens'],
  [/\bmicrogreen mango-lime\b/gi, 'microgreen, mango-lime'],
  [/\bscallion crunch seeds\b/gi, 'scallion, crunch seeds'],
  [/\btomato house crunch mix\b/gi, 'tomato, house crunch mix'],
  [/\bchili flkes\b/gi, 'chili flakes'],
  [/\bmaple syrop\b/gi, 'maple syrup'],
  [/сhili/gu, 'chili'], // Latin ingredient with an accidental Cyrillic initial.
];

export function formatCardCopy(value) {
  if (!value) return value;
  let text = value;
  for (const [pattern, replacement] of repairs) text = text.replace(pattern, replacement);
  text = text
    // A wrapped ingredient list continues after its comma. Other source lines
    // separate a portion, nutrition note or dietary information from the list.
    .replace(/,\s*\n\s*/g, ', ')
    .replace(/\s*\n\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(?:\s*,\s*)+/g, ', ')
    .replace(/\s*([;:])\s*/g, '$1 ')
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])(?=\p{L})/gu, '$1 ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/([^\s(])\(/gu, '$1 (')
    .replace(/\)(?=[\p{L}\p{N}])/gu, ') ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*[·•]\s*/g, ' · ')
    .replace(/\s+[-—]\s+/g, ' — ')
    .replace(/(\d)\s*(gr|g|ml|oz)\b/g, (_, number, unit) => `${number} ${unit === 'gr' ? 'g' : unit}`)
    .replace(/(\d)-(\d)/g, '$1–$2')
    .replace(/(^|[.!?]\s+)(\p{L})/gu, (_, boundary, letter) => boundary + letter.toUpperCase())
    .replace(/\b(?:gf|lf|vg|okf|prana|miami|greek|buddha)\b/gi, word => preservedCase.get(word.toLowerCase()))
    .trim();
  return text;
}

export function editProductCopy(product) {
  return {
    ...product,
    name: formatCardCopy(product.name),
    description: formatCardCopy(product.description),
    imageAlt: formatCardCopy(product.imageAlt),
  };
}
