import express from "express";
import controller from "../controllers/authController.js"
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { verifyEmail } from "../middlewares/verifyEmail.js";

export const authRouter = express.Router()

//Public routes
authRouter.post("/signup", controller.signup)
authRouter.post("/login", controller.login)
authRouter.post("/logout", isAuthenticated, controller.logout);

//Email verification routes
authRouter.post("/verify", verifyEmail, controller.verifyEmail)
authRouter.post("/verify/resend", controller.resendVerification)

//Password reseting routes
authRouter.post("/forgot-password", controller.forgotPassword)
authRouter.post("/reset-password", controller.resetPassword)



