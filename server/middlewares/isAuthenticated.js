import jwt from "jsonwebtoken"
import { env } from "../config/env.js";
import { User } from "../models/user.model.js"


export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const { sub: id } = jwt.verify(token, env.JWT_SECRET)
    const user = await User.findById(id)
    if(!user) return res.status(404).send({ message: 'User not found'})
    req.user = user

    next()
  } catch(err) {
    res.status(401).send({ message: "Invalid or expired token." })
  }
}

