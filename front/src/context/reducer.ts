import type { IAction, IState } from "./types";

export const reducer = (state: IState, action: IAction): IState => {
  switch(action.type) {
    case "SET_USER": 
      return {
        ...state,
        user: action.payload
      };
      case "UPDATE_AVATAR":
        if(!state.user) return state;
        return {
          ...state,
          user: {
            ...state.user,
            avatar: action.payload
          }
        };
        
    default: 
    return state
  }
}