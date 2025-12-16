import express from 'express'
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import { isEmailVerified } from '../middlewares/isEmailVerified.js'
import controller from "../controllers/userController.js"
import { upload } from '../services/upload.js'

export const userRouter = express.Router()


userRouter.use(isAuthenticated)
userRouter.use(isEmailVerified)

userRouter.get("/profile", controller.getCurrentUser)
userRouter.patch("/password", controller.updatePassword)
userRouter.patch("/username", controller.updateUsername)
userRouter.post("/avatar", upload.single("avatar") ,controller.uploadAvatar)
userRouter.put("/profile/", controller. updateProfile)

userRouter.get("/streak", controller.getStreak)
userRouter.get("/stats", controller.getStats)

userRouter.post("/favorites", controller.addFavorite)
userRouter.delete("/favorites/:quizId", controller.removeFavorite)
userRouter.get("/favorites", controller.getAllFavorites)