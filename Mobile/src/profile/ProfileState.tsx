import { createContext, useContext, useState, type Context, type Dispatch, type PropsWithChildren, type SetStateAction } from 'react';
import { initialProfile, type ProfileData } from './profile-model';

type ProfileState = { data: ProfileData; setData: Dispatch<SetStateAction<ProfileData>>; signIn: (phone: string) => void };
// FlowStack retains mounted screen functions; keep their context identity during Vite HMR.
const Context: Context<ProfileState | null> = import.meta.hot?.data.profileContext ?? createContext<ProfileState | null>(null);
if (import.meta.hot) import.meta.hot.data.profileContext = Context;
export const useProfile = () => useContext(Context)!;
export function ProfileProvider({ children, initial = initialProfile }: PropsWithChildren<{ initial?: ProfileData }>) {
  const [data, setData] = useState(initial);
  return <Context.Provider value={{ data, setData, signIn: phone => setData(current => ({ ...current, signedIn: true, phone })) }}>{children}</Context.Provider>;
}
