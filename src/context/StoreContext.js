import { createContext, useContext } from 'react'

export const StoreContext = createContext(null)

export function useStoreContext() {
  return useContext(StoreContext)
}
