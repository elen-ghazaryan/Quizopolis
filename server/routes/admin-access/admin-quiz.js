import express from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";
import { isEmailVerified } from "../../middlewares/isEmailVerified.js";
import controller from "../../controllers/admin-access/adminQuizController.js";
import { authorize } from "../../middlewares/authorize.js";
import { upload } from "../../services/upload.js"

export const adminQuizRouter = express.Router();

adminQuizRouter.use(isAuthenticated);
adminQuizRouter.use(isEmailVerified);
adminQuizRouter.use(authorize(['teacher']));

adminQuizRouter.post("/", controller.createQuiz);
adminQuizRouter.get("/published", controller.getOwnPublishedQuizzes);
adminQuizRouter.get("/unpublished", controller.getOwnDraftQuizzes);
adminQuizRouter.delete("/:id", controller.deleteQuiz);
adminQuizRouter.put("/:id", controller.updateQuiz);
adminQuizRouter.get("/:id", controller.getAdminQuizById);
adminQuizRouter.get("/:id/stats", controller.getQuizStats);
adminQuizRouter.get("/:id/participants", controller.searchQuizParticipants)

adminQuizRouter.patch("/:id/publish", controller.publishQuiz);
adminQuizRouter.patch("/:id/unpublish", controller.unPublishQuiz);

//for question
adminQuizRouter.post("/:quizId/questions", upload.single('image'), controller.addQuestion);
adminQuizRouter.get("/:quizId/questions", controller.getAllQuestions);
adminQuizRouter.get("/questions/:questionId", controller.getQuestionById);
adminQuizRouter.put("/questions/:questionId", upload.single('image'), controller.updateQuestion);
adminQuizRouter.delete("/questions/:questionId", controller.deleteQuestion);