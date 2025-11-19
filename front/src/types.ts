export type SignupUser = {
  username: string
  email: string
  password: string
  role: "student" | "teacher"
}

export type LoginUser = {
  username: string
  password: string
}


export type IErrorResponse = {
  message: string
  errors?: string[]
}


export type IResponse<T> = {
  message: string
  payload: T
}