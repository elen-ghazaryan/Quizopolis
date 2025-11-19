import { useContext } from "react"
import { AppContext } from "."

export const useContextDispatch = () => {
  const context = useContext(AppContext)
  if(!context) throw new Error("Outside of providers")

  return context.dispatch
}

export const useContextState = () => {
  const context = useContext(AppContext)
  if(!context) throw new Error("Outside of providers")

  return context.state
}