import { createContext, useContext, useReducer, type Context, type Dispatch, type PropsWithChildren } from 'react';
import { addressReducer, initialAddressBook, type AddressAction, type AddressBookState } from './address-model';

type AddressContextValue = { state: AddressBookState; dispatch: Dispatch<AddressAction> } | null;
const AddressContext: Context<AddressContextValue> = import.meta.hot?.data.addressContext ?? createContext<AddressContextValue>(null);
if (import.meta.hot) import.meta.hot.data.addressContext = AddressContext;
export const useAddressBook = () => useContext(AddressContext)!;
export function AddressBookProvider({ children, initial = initialAddressBook }: PropsWithChildren<{ initial?: AddressBookState }>) {
  const [state, dispatch] = useReducer(addressReducer, initial);
  return <AddressContext.Provider value={{ state, dispatch }}>{children}</AddressContext.Provider>;
}
