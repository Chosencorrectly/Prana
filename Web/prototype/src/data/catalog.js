import catalog from './catalog.json';
import { editProductCopy } from './card-copy.js';
import { withPrototypeDescription } from './prototype-descriptions.js';

// Public catalogue snapshot from dev.prana.kitchen. Missing values remain null.
export const categories = catalog.categories;
export const products = catalog.products.map(editProductCopy).map(withPrototypeDescription);
export const catalogSource = { url: catalog.source, capturedAt: catalog.capturedAt };
