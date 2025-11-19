import { createContext } from "react"
import type { IAppContext } from "./types"
import { useReducer } from "react"
import { reducer } from "./reducer"
import { initialState } from "./state"

type IProps = {
  children: React.ReactNode
}

export const AppContext = createContext<IAppContext | undefined>(undefined)

export const DataProvider: React.FC<IProps> = ({ children }) => {
  const [ state, dispatch ] = useReducer(reducer, initialState)

  return <AppContext.Provider value={{state, dispatch}}>
    {children}
  </AppContext.Provider>
}