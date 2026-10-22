export type MapPoint = { x: number; y: number };
export type AddressLocation = { street: string; locality: string; point: MapPoint };
export type AddressDetails = { unit: string; building: string; floor: string; access: string; instructions: string; label: string };
export type SavedAddress = { id: string; location: AddressLocation; details: AddressDetails };
export type AddressDraft = Omit<SavedAddress, 'id'> & { id?: string };
export const emptyDetails: AddressDetails = { unit: '', building: '', floor: '', access: '', instructions: '', label: '' };
// Local fixtures from Figma, not a real geocoder or a business delivery boundary.
// Coordinates belong to the source bitmap, not latitude/longitude.
export const MAP_SIZE = { width: 889, height: 1147 };
export const DEMO_ZONE_EDGE = 610;
export const addressSuggestions: AddressLocation[] = [
  { street: '701 Brickell Ave', locality: 'Miami, FL 33131', point: { x: 300, y: 430 } },
  { street: '1100 Brickell Bay Dr', locality: 'Miami, FL 33131', point: { x: 380, y: 466 } },
  { street: '1000 Brickell Plaza', locality: 'Miami, FL 33131', point: { x: 460, y: 450 } },
  { street: '1111 Brickell Ave', locality: 'Miami, FL 33131', point: { x: 510, y: 510 } },
  { street: '1395 Brickell Ave', locality: 'Miami, FL 33131', point: { x: 540, y: 540 } },
  { street: '1451 Brickell Ave', locality: 'Miami, FL 33131', point: { x: 570, y: 570 } },
];
export const defaultLocation = addressSuggestions[1];
export const fullAddress = (location: AddressLocation) => [location.street, location.locality].filter(Boolean).join(', ');
export const deliveryAvailable = (location: AddressLocation) => Number.isFinite(location.point.x) && Number.isFinite(location.point.y) && location.point.x >= 0 && location.point.x < DEMO_ZONE_EDGE && location.point.y >= 0 && location.point.y <= MAP_SIZE.height;
export function findAddresses(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return addressSuggestions.filter(location => terms.every(term => fullAddress(location).toLowerCase().includes(term)));
}
export function reverseDemoPoint(point: MapPoint): AddressLocation {
  const nearest = addressSuggestions.reduce((best, location) => Math.hypot(location.point.x - point.x, location.point.y - point.y) < Math.hypot(best.point.x - point.x, best.point.y - point.y) ? location : best);
  return { ...nearest, point };
}
export type AddressBookState = { addresses: SavedAddress[]; selectedId: string; current: SavedAddress; draft: AddressDraft | null; query: string; nextId: number };
const initialLocation: AddressLocation = { street: 'Jl. Raya Padonan No.41a, Tibubeneng...', locality: '', point: defaultLocation.point };
const home: SavedAddress = { id: 'home', location: initialLocation, details: { ...emptyDetails, label: 'Home', instructions: 'Call when you deliver' } };
export const initialAddressBook: AddressBookState = {
  addresses: [home, { ...home, id: 'work', details: { ...home.details, label: 'Work' } }],
  current: home, selectedId: home.id, draft: null, query: '', nextId: 1,
};
export type AddressAction =
  | { type: 'begin' | 'add' | 'save' | 'deliver' | 'cancel-draft' }
  | { type: 'select' | 'edit'; id: string }
  | { type: 'location'; location: AddressLocation }
  | { type: 'detail'; field: keyof AddressDetails; value: string }
  | { type: 'query'; value: string };
export function addressReducer(state: AddressBookState, action: AddressAction): AddressBookState {
  switch (action.type) {
    case 'begin': return { ...state, selectedId: state.current.id, draft: null, query: '' };
    case 'add': return { ...state, draft: { location: defaultLocation, details: { ...emptyDetails } }, query: '' };
    case 'cancel-draft': return { ...state, draft: null, query: '' };
    case 'select': return state.addresses.some(address => address.id === action.id) ? { ...state, selectedId: action.id } : state;
    case 'edit': {
      const address = state.addresses.find(item => item.id === action.id);
      return address ? { ...state, draft: { ...address, details: { ...address.details } }, query: '' } : state;
    }
    case 'location': return state.draft ? { ...state, draft: { ...state.draft, location: action.location } } : state;
    case 'detail': return state.draft ? { ...state, draft: { ...state.draft, details: { ...state.draft.details, [action.field]: action.value } } } : state;
    case 'query': return { ...state, query: action.value };
    case 'save': {
      if (!state.draft || !deliveryAvailable(state.draft.location)) return state;
      const address: SavedAddress = { ...state.draft, id: state.draft.id ?? `address-${state.nextId}`, details: { ...state.draft.details, label: state.draft.details.label.trim() || 'Address' } };
      const addresses = state.draft.id ? state.addresses.map(item => item.id === address.id ? address : item) : [...state.addresses, address];
      return { ...state, addresses, selectedId: address.id, nextId: state.nextId + (state.draft.id ? 0 : 1), draft: null, query: '' };
    }
    case 'deliver': {
      const selected = state.addresses.find(item => item.id === state.selectedId);
      return selected && deliveryAvailable(selected.location) ? { ...state, current: selected, draft: null } : state;
    }
  }
}
