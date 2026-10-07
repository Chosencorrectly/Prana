// Figma sample contacts and local-only state. These are not an authenticated account.
export const initialDetails = {
  name: "Alex", birthDate: "1985-06-12", phone: "+625585854455", email: "Michaeljerlis@gmail.com",
};
export const minimumBirthYear = 1900;
export function dateToValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function valueToDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return dateToValue(date) === value ? date : undefined;
}
export const validBirthDate = (value, today = new Date()) => !!valueToDate(value) && value >= `${minimumBirthYear}-01-01` && value <= dateToValue(today);
const birthdayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
export const formatBirthDate = (value) => birthdayFormat.format(valueToDate(value));
const normalizeDetails = (details) => Object.fromEntries(Object.keys(initialDetails).map((key) => [key, details[key].trim()]));
export const detailsChanged = (draft, saved) => Object.keys(initialDetails).some((key) => draft[key].trim() !== saved[key].trim());
export const createProfile = () => ({ saved: { ...initialDetails }, draft: { ...initialDetails }, status: "idle", marketing: true });

export function profileReducer(state, action) {
  if (action.type === "edit" && Object.hasOwn(initialDetails, action.field)) {
    return { ...state, draft: { ...state.draft, [action.field]: action.value }, status: "idle" };
  }
  if (action.type === "marketing") return { ...state, marketing: !state.marketing };
  if (action.type === "save" && detailsChanged(state.draft, state.saved)) {
    const saved = normalizeDetails(state.draft);
    if (!saved.name || !saved.phone || !/^[^\s@]+@[^\s@]+$/.test(saved.email) || !validBirthDate(saved.birthDate, action.today)) return state;
    return { ...state, saved, draft: { ...saved }, status: "saved" };
  }
  return state;
}

// Randomize once per mounted app, never during render. Actual catalogue products,
// photos and integer-cent prices; generated dates are explicitly demo history.
export function createDemoOrders(products, now = new Date(), random = Math.random) {
  const meals = products.filter((p) => ["Breakfasts All Day", "Healthy Bowls", "Main dishes", "Wraps", "Balanced Curries"].includes(p.category));
  const drinks = products.filter((p) => ["Refresh & Rehydrate", "Hot Liquids", "Cold Liquids", "Energizers"].includes(p.category));
  const pick = (pool) => pool[Math.floor(random() * pool.length)];
  let daysAgo = 0;
  return [0, 1].map((index) => {
    daysAgo += 3 + Math.floor(random() * 12);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(10 + Math.floor(random() * 10), Math.floor(random() * 60), 0, 0);
    const first = pick(meals);
    const second = pick(meals.filter((p) => p.id !== first.id));
    const items = [first, second, pick(drinks)].map((product) => ({ product, quantity: 1 }));
    return { id: `demo-order-${index + 1}`, date, items, totalCents: items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0) };
  });
}
