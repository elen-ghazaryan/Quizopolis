import type { Dispatch } from "react"

export interface IUser {
  id: string
  username: string
  email: string
  role: "student" | "teacher",
  isEmailVerified: boolean,
  avatar: string,
  bio: string
}

export interface IState {
  user: IUser | null
}

export type IAction = 
  | { type: 'SET_USER'; payload: IUser }
  | { type: 'UPDATE_USER'; payload: IUser }


export interface IAppContext {
  state: IState,
  dispatch: Dispatch<IAction>
}