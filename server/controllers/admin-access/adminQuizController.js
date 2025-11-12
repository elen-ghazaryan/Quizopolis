import { Question, Quiz, QuizAttempt } from "../../models/index.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

class AdminQuizController {
  async createQuiz(req, res) {
    try {
      const {
        title,
        description = "",
        category,
        difficulty,
        mode = "standard",
        accessCode,
        isPublished = false,
      } = req.body || {};

      const userId = req.user._id;

      // ---------- Basic Validations ----------
      if (!title) {
        return res.status(400).send({ message: "Title is required." });
      }

      if (!category || typeof category !== "string") {
        return res.status(400).send({ message: "Category is required" });
      }

      if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).send({
          message: "Invalid difficulty level. Must be easy, medium or hard.",
        });
      }

      if (!["standard", "live"].includes(mode)) {
        return res.status(400).send({
          message: "Invalid mode. Must be either 'standard' or 'live'.",
        });
      }

      // ---------- Mode-Specific Validations ----------
      if (mode === "live") {
        // For live quizzes, accessCode is required
        if (!accessCode) {
          return res
            .status(400)
            .send({ message: "Access code is required for live quizzes." });
        }
      }

      let startTime = null,
        endTime = null;
      let isActive = false;

      // ---------- Create Quiz ----------
      const quizData = {
        title,
        description,
        createdBy: userId,
        category: category.toLowerCase(),
        difficulty,
        mode,
        isPublished,
        accessCode: accessCode.toString() || null,
        questions: [],
        startTime,
        endTime,
        isActive,
      };

      const quiz = await Quiz.create(quizData);

      let payload = {};
      if (mode === "live") {
        payload = {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty,
          accessCode: quiz.accessCode,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
          isActive: quiz.isActive,
          mode: quiz.mode,
          createdBy: quiz.createdBy,
        };
      } else {
        // standard quiz
        payload = {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty,
          mode: quiz.mode,
          createdBy: quiz.createdBy,
        };
      }

      res.status(201).json({
        message: `${
          mode === "live" ? "Live" : "Standard"
        } quiz created successfully.`,
        quiz: payload,
      });
    } catch (err) {
      console.error("Failed to create quiz: " + err);
      res.status(500).json({ message: "Server error while creating quiz" });
    }
  }

  async deleteQuiz(req, res) {
    const userId = req.user._id;
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);

    try {
      if (!quiz) return res.status(404).send({ message: "Quiz is not found" });

      if (quiz.createdBy.toString() !== userId.toString()) {
        return res.status(403).send({
          message: "You are not authorized to delete question from this quiz.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      await quiz.deleteOne();
      return res
        .status(200)
        .send({ message: "Ok, deleted", payload: { id: quiz._id } });
    } catch (err) {
      console.log("Failed to delete quiz: " + err);
      return res.status(500).send({ message: "Internal server error" });
    }
  }

  async getAdminQuizById(req, res) {
    const quizId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const quiz = await Quiz.findById(quizId)
        .populate("createdBy", "username email")
        .populate("questions")
        .populate({
          path: "comments",
          populate: { path: "userId", select: "username" },
        });

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Ownership check
      if (quiz.createdBy._id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to view this quiz" });
      }

      const payload = {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        mode: quiz.mode,
        isPublished: quiz.isPublished,
        isActive: quiz.isActive,
        createdBy: quiz.createdBy,
        questions: quiz.questions,
        comments: quiz.comments,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        accessCode: quiz.accessCode,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        participants: quiz.participants,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        participants: quiz.participants,
      };

      res.status(200).json({
        message: "Quiz retrieved successfully",
        payload: { quiz: payload },
      });
    } catch (err) {
      console.error("Failed to get admin quiz by ID:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getQuizStats(req, res) {
    const { id: quizId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const quiz = await Quiz.findById(quizId)
        .populate("createdBy", "_id")
        .populate("participants", "username email");

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.createdBy._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const attempts = await QuizAttempt.find({ quizId }).lean();
      const total = attempts.length;

      const ranges = {
        "0-49%": 0,
        "50-69%": 0,
        "70-89%": 0,
        "90-100%": 0,
      };

      let sum = 0;
      let highest = 0;

      for (const attempt of attempts) {
        const percent =
          attempt.percentage ?? (attempt.score / attempt.totalPoints) * 100;
        sum += percent;
        highest = Math.max(highest, percent);

        if (percent < 50) ranges["0-49%"]++;
        else if (percent < 70) ranges["50-69%"]++;
        else if (percent < 90) ranges["70-89%"]++;
        else ranges["90-100%"]++;
      }

      const average = total ? Number((sum / total).toFixed(2)) : 0;

      const stats = {
        totalAttempts: total,
        scoreRanges: ranges,
        averageScore: average,
        highestScore: Number(highest.toFixed(2)),
      };

      if (quiz.mode === "live" && quiz.participants?.length) {
        stats.activeParticipants = quiz.participants;
      }

      res.status(200).json({
        message: "Quiz stats retrieved successfully",
        stats,
      });
    } catch (err) {
      console.error("Error fetching quiz stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async publishQuiz(req, res) {
    const userId = req.user._id;
    const quizId = req.params.id;

    const foundQuiz = await Quiz.findById(quizId);

    if (!foundQuiz) {
      return res.status(404).send({ message: "Quiz not found." });
    }

    if (foundQuiz.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .send({ message: "You are not authorized to publish this quiz." });
    }

    try {
      foundQuiz.isPublished = true;
      await foundQuiz.save();

      res.send({ message: "Quiz is published" });
    } catch (err) {
      console.log("Failed to publish quiz: " + err);
      res.status(500).send({ message: "Internal server error" });
    }
  }

  async updateQuiz(req, res) {
    const userId = req.user._id;
    const quizId = req.params.id;
    const {
      title,
      description,
      category,
      difficulty,
      isPublished,
      mode,
      accessCode,
    } = req.body;

    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });

      // Check ownership
      if (quiz.createdBy.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this quiz" });
      }

      if (title !== undefined) quiz.title = title;
      if (description !== undefined) quiz.description = description;
      if (category !== undefined) quiz.category = category;
      if (difficulty !== undefined) quiz.difficulty = difficulty;
      if (isPublished !== undefined) quiz.isPublished = isPublished;

      if (mode !== undefined) quiz.mode = mode;

      if (mode === "live") {
        if (accessCode !== undefined) quiz.accessCode = accessCode;
      }

      await quiz.save();

      res
        .status(200)
        .json({ message: "Quiz updated successfully", payload: { quiz } });
    } catch (err) {
      console.error("Failed to update quiz:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async unPublishQuiz(req, res) {
    const userId = req.user._id;
    const quizId = req.params.id;

    const foundQuiz = await Quiz.findById(quizId);

    if (!foundQuiz) {
      return res.status(404).send({ message: "Quiz not found." });
    }

    if (foundQuiz.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .send({ message: "You are not authorized to publish this quiz." });
    }

    try {
      foundQuiz.isPublished = false;
      await foundQuiz.save();

      res.send({ message: "Quiz is unpublished. Check your draft." });
    } catch (err) {
      console.log("Failed to unpublish quiz: " + err);
      res.status(500).send({ message: "Internal server error" });
    }
  }

  async addQuestion(req, res) {
    const userId = req.user._id;
    const quizId = req.params.quizId;

    const foundQuiz = await Quiz.findById(quizId);

    if (!foundQuiz) {
      return res.status(404).send({ message: "Quiz not found." });
    }

    if (foundQuiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).send({
        message: "You are not authorized to add questions to this quiz.",
      });
    }

    const image = req.file ? req.file.filename : null;

    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      points,
      explanation,
    } = req.body || {};

    if (!questionText) {
      return res.status(400).send({ message: "Question text is required." });
    }

    if (
      !["multiple-choice", "true-false", "short-answer"].includes(questionType)
    ) {
      return res.status(400).send({
        message:
          "Invalid question type. Must be 'multiple-choice', 'true-false' or 'short-answer'. ",
      });
    }

    if (questionType === "multiple-choice") {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).send({
          message:
            "At least two options are required for multiple-choice questions.",
        });
      }

      const invalidOption = options.find((opt) => !opt.text);
      if (invalidOption) {
        return res.status(400).send({ message: "Each option must have text." });
      }

      const correctOptions = options.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        return res
          .status(400)
          .send({ message: "At least one option must be marked as correct." });
      }
    } else {
      if (!correctAnswer || typeof correctAnswer !== "string") {
        return res.status(400).send({
          message:
            "Correct answer is required for true-false and short-answer questions.",
        });
      }
    }

    //create question
    try {
      const questionData = {
        quizId,
        questionText,
        options,
        correctAnswer,
        points: points || 1,
        image,
        explanation,
      };

      const question = await Question.create(questionData);

      foundQuiz.questions.push(question._id);
      await foundQuiz.save();

      res.status(201).send({
        message: "Question added successfully",
        payload: question,
      });
    } catch (err) {
      console.log("Failed to add question: " + err);
      res.status(500).send("Internal server error");
    }
  }

  async getAllQuestions(req, res) {
    const quizId = req.params.quizId;

    try {
      const questions = await Question.find({ quizId });
      res.status(200).send({ message: "Ok", payload: { questions } });
    } catch (err) {
      res.status(500).send({ message: "Internal server error" });
    }
  }

  async getQuestionById(req, res) {
    const questionId = req.params.questionId;

    try {
      const question = await Question.findById(questionId);

      if (!question) {
        return res.status(404).send({ message: "Question not found" });
      }

      res.status(200).send({ message: "Ok", payload: { question } });
    } catch (err) {
      res.status(500).send({ message: "Internal server error" });
    }
  }

  async deleteQuestion(req, res) {
    const userId = req.user._id;
    const questionId = req.params.questionId;

    try {
      const foundQuestion = await Question.findById(questionId);
      if (!foundQuestion) {
        return res.status(404).send({ message: "Question not found." });
      }

      const quiz = await Quiz.findById(foundQuestion.quizId);
      if (!quiz) {
        return res.status(404).send({ message: "Associated quiz not found." });
      }
      if (quiz.createdBy.toString() !== userId.toString()) {
        return res
          .status(403)
          .send({ message: "You are not authorized to delete this question." });
      }

      // Delete the question
      await foundQuestion.deleteOne();

      // Remove question reference from the quiz
      quiz.questions = quiz.questions.filter(
        (qId) => qId.toString() !== questionId
      );
      await quiz.save();

      res.status(200).json({
        message: "Question deleted successfully.",
        payload: { questions: quiz.questions },
      });
    } catch (err) {
      console.error("Failed to delete question:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async updateQuestion(req, res) {
    const userId = req.user._id;
    const questionId = req.params.questionId;

    try {
      const question = await Question.findById(questionId);
      if (!question)
        return res.status(404).send({ message: "Question not found." });

      // ownership via quiz
      const quiz = await Quiz.findById(question.quizId);
      if (!quiz)
        return res.status(404).send({ message: "Associated quiz not found." });
      if (quiz.createdBy.toString() !== userId.toString()) {
        return res
          .status(403)
          .send({ message: "You are not authorized to update this question." });
      }

      const {
        questionText,
        questionType,
        options,
        correctAnswer,
        points,
        explanation,
        removeImage,
      } = req.body || {};
      let image = question.image;

      //Image handling logic
      if (req.file) {
        if (question.image) {
          const oldImagePath = path.join(process.cwd(), "public", "uploads", question.image);
          fs.unlink(oldImagePath, (err) => {
            if (err && err.code !== "ENOENT") {
              console.error("Failed to delete old image:", err);
            } else {
              console.log("Old image deleted (or not found)");
            }
          });
        }
        image = req.file.filename;
      } else if (removeImage && question.image) {
        const oldImagePath = path.join(process.cwd(),"public","uploads", question.image);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Failed to delete old image:", err);
          } else {
            console.log("Old image deleted (or not found)");
          }
        });
        image = null;
      }

      question.image = image;

      if (questionText !== undefined && !questionText.trim()) {
        return res
          .status(400)
          .send({ message: "Question text cannot be empty." });
      }

      if (
        questionType !== undefined &&
        !["multiple-choice", "true-false", "short-answer"].includes(
          questionType
        )
      ) {
        return res.status(400).send({ message: "Invalid question type." });
      }

      const effectiveType = questionType || question.questionType;
      if (effectiveType === "multiple-choice" && options !== undefined) {
        if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).send({
            message: "At least two options are required for multiple-choice.",
          });
        }

        const invalidOption = options.find((opt) => !opt.text);
        if (invalidOption) {
          return res
            .status(400)
            .send({ message: "Each option must have text." });
        }

        const correctOptions = options.filter((opt) => opt.isCorrect);
        if (correctOptions.length === 0) {
          return res.status(400).send({
            message: "At least one option must be marked as correct.",
          });
        }
      }

      if (
        (effectiveType === "true-false" || effectiveType === "short-answer") &&
        correctAnswer !== undefined
      ) {
        if (correctAnswer.trim() === "") {
          return res
            .status(400)
            .send({ message: "Correct answer cannot be empty." });
        }
      }

      if (questionText !== undefined) question.questionText = questionText;
      if (questionType !== undefined) question.questionType = questionType;
      if (options !== undefined) question.options = options;
      if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
      if (points !== undefined) question.points = points;
      if (explanation !== undefined) question.explanation = explanation;
      question.image = image;

      await question.save();

      res
        .status(200)
        .send({ message: "Question updated successfully.", question });
    } catch (err) {
      console.error("Failed to update question:", err);
      res.status(500).send({ message: "Internal server error." });
    }
  }

  async getOwnPublishedQuizzes(req, res) {
    const userId = req.user._id;

    try {
      const quizzes = await Quiz.find({
        createdBy: userId,
        isPublished: true,
      }).select("_id title description category difficulty questions mode");

      res.send({ message: "All published quizzes", payload: { quizzes } });
    } catch (err) {
      console.log("Failed to get own published quizzes: " + err);
      res.status(500).send("Internal server error");
    }
  }

  async getOwnDraftQuizzes(req, res) {
    const userId = req.user._id;

    try {
      const quizzes = await Quiz.find({
        createdBy: userId,
        isPublished: false,
      }).select("_id title description category difficulty questions mode");

      res.send({ message: "All unpublished quizzes", payload: { quizzes } });
    } catch (err) {
      console.log("Failed to get own unpublished quizzes: " + err);
      res.status(500).send("Internal server error");
    }
  }

  async searchQuizParticipants(req, res) {
    const quizId = req.params.id;
    const searchTerm = req.query.search || "";
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const quiz = await Quiz.findById(quizId)
        .populate("createdBy", "username email")
        .populate("participants", "username email");

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.mode !== "live") {
        return res.status(400).json({
          message: "Participants are only available for live quizzes",
        });
      }

      // Ownership check
      if (quiz.createdBy._id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to view participants" });
      }

      // Filter
      const filteredParticipants = quiz.participants.filter(
        (participant) =>
          participant.username
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          participant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      res.status(200).json({
        message: "Participants retrieved successfully",
        participants: filteredParticipants,
      });
    } catch (err) {
      console.error("Failed to get participants:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new AdminQuizController();
