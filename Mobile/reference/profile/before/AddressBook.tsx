import { createContext, useContext, useReducer, type Dispatch, type PropsWithChildren } from 'react';
import { addressReducer, initialAddressBook, type AddressAction, type AddressBookState } from './address-model';

const AddressContext = createContext<{ state: AddressBookState; dispatch: Dispatch<AddressAction> } | null>(null);
export const useAddressBook = () => useContext(AddressContext)!;
export function AddressBookProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(addressReducer, initialAddressBook);
  return <AddressContext.Provider value={{ state, dispatch }}>{children}</AddressContext.Provider>;
}
