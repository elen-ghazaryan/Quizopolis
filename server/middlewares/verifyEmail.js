import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';


export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(400).send({ message: "Verification token missing" });
    }

    const decoded = jwt.verify(token, env.JWT_EMAIL_SECRET);

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; 
    next(); 
  } catch (err) {
    console.error("Email verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired email verification token" });
  }
};