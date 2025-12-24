import express from "express"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import controller from "../controllers/quizController.js"
import { isEmailVerified } from "../middlewares/isEmailVerified.js"
export const quizRouter = express.Router()

quizRouter.use(isAuthenticated)
quizRouter.use(isEmailVerified)

quizRouter.get("/", controller.getAllStandardQuizzes)
quizRouter.get("/history/standard", controller.getStandardQuizHistory)
quizRouter.get("/history/live", controller.getLiveQuizHistory)
quizRouter.get("/:id", controller.getQuizById)

//comments
quizRouter.post("/:quizId/comments", controller.addComment)
quizRouter.get("/:quizId/comments", controller.getAllComments)
quizRouter.patch("/:quizId/comments/:commentId", controller.updateComment)
quizRouter.delete("/:quizId/comments/:commentId", controller.deleteComment)

//take standard quiz
quizRouter.post("/:id/take", controller.startQuizAttempt)
quizRouter.post("/attempt/:attemptId/answer", controller.saveDraftAnswer)
quizRouter.post("/attempt/:attemptId/submit", controller.submitQuiz)
quizRouter.get("/attempt/:attemptId/resume", controller.resumeQuiz)
quizRouter.get("/attempt/:attemptId/result", controller.getQuizResults)
quizRouter.post("/:quizId/restart", controller.restartQuizAttempt)

quizRouter.post("/:id/live/join", controller.joinLiveQuiz);

