import mongoose from "mongoose";
import { Quiz, Comment, QuizAttempt, User } from "../models/index.js";
import redis from "../config/redis.js";

class QuizController {
  async getAllStandardQuizzes(req, res) {
    try {
      const quizzes = await Quiz.find({
        isPublished: true,
        mode: "standard",
      }).populate("createdBy", "username avatar");

      const payload = quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        createdBy: quiz.createdBy,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt,
      }));

      res
        .status(200)
        .json({ message: "All published standard quizzes", payload });
    } catch (err) {
      console.error("Failed to get all quizzes:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async searchStandardQuiz(req, res) {
    try {
      const { query } = req.query
      if(!query || query.trim() === "") {
        return res.status(400).send({ message: "Search query is missing" })
      }

      // searching by creators
      const users = await User.find({
        username: { $regex: query, $options: "i" }
      }).select("_id")

      const userIds = users.map(u => u._id)

      const quizzes = await Quiz.find({
        isPublished: true,
        mode: "standard",
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { createdBy: { $in: userIds } }
        ]
      })
      .populate("createdBy", "username avatar")
      .sort({ createdAt: -1})

      const payload = quizzes.map(quiz => ({
        _id: quiz._id,
        titile: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        createdBy: quiz.createdBy,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt
      }))

      res.status(200).json({ 
      message: `Found ${payload.length} quiz(es)`, 
      payload 
    });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  async getStandardQuizHistory(req, res) {
    try {
      const userId = req.user._id;
      const recentAttempts = await QuizAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate({
          path: "quizId",
          match: { mode: "standard" }, // Only standard quizzes
          select: "title description createdBy category difficulty",
          populate: { path: "createdBy", select: "username avatar" },
        })
        .exec();

      const filteredAttempts = recentAttempts.filter(
        (attempt) => attempt.quizId !== null
      );

      if (filteredAttempts.length === 0) {
        return res.send({
          message: "You haven't attempted any standard quizzes yet.",
          payload: [],
        });
      }

      res.send({
        message: "Standard quizzes history retrieved successfully",
        payload: { history: filteredAttempts },
      });
    } catch (error) {
      console.log("Failed to retrieve standard quiz history:", error);
      res.status(500).send({ message: "Error retrieving quiz history" });
    }
  }

  async getLiveQuizHistory(req, res) {
    try {
      const userId = req.user._id;

      const recentLiveAttempts = await QuizAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate({
          path: "quizId",
          match: { mode: "live" }, // Only live quizzes
          select: "title participants createdBy category difficulty",
          populate: [
            { path: "participants", select: "username avatar" },
            { path: "createdBy", select: "username avatar" },
          ],
        })
        .exec();

      // Filter out attempts where quizId is null (not live quizzes)
      const filteredAttempts = recentLiveAttempts.filter(
        (attempt) => attempt.quizId !== null
      );

      if (!filteredAttempts.length) {
        return res.send({
          message: "You haven't finished any live quizzes yet.",
          payload: [],
        });
      }

      res.send({
        message: "Live quizzes history retrieved successfully.",
        payload: { history: filteredAttempts },
      });
    } catch (error) {
      console.error("Error retrieving live quiz history:", error);
      res.status(500).send({ message: "Error retrieving live quiz history." });
    }
  }

  async getQuizById(req, res) {
    const quizId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const quiz = await Quiz.findById(quizId)
        .populate("createdBy", "username avatar")
        .populate({
          path: "comments",
          populate: { path: "userId", select: "username avatar" },
        })
        .populate({
          path: "questions",
          select: "questionText questionType points image options",
        });

      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.mode == "live" && !quiz.isActive) {
        return res.status(404).json({ message: "Quiz is not active" });
      }

      let isFavorite = false;

      if (req.user) {
        isFavorite = await User.exists({
          _id: req.user._id,
          favorites: quiz._id,
        });
      }

      const payload = {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        mode: quiz.mode,
        createdBy: quiz.createdBy,
        questions: quiz.questions,
        comments: quiz.comments,
        isFavorite,
        createdAt: quiz.createdAt,
      };

      res
        .status(200)
        .json({ message: "Quiz retrieved", payload: { quiz: payload } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async addComment(req, res) {
    const quizId = req.params.quizId;
    const userId = req.user._id;

    const { text } = req.body || {};
    const textValue = text.toString().trim();
    if (!textValue) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    try {
      const comment = await Comment.create({
        quizId,
        userId,
        text: textValue,
      });
      await comment.populate("userId", "username avatar");

      res.status(201).send({ message: "Comment added", payload: { comment } });
    } catch (err) {
      console.log("Failed to add comment: " + err);
      res.status(500).send("Internal server error");
    }
  }

  async getAllComments(req, res) {
    const quizId = req.params.quizId;

    try {
      const comments = await Comment.find({ quizId })
        .populate("userId", "username avatar")
        .sort({ createdAt: -1 }); // newest first

      res.status(200).send({
        message: "Comments retrieved",
        payload: { comments },
      });
    } catch (err) {
      console.error("Failed to get comments:", err);
      res.status(500).send({ message: "Internal server error" });
    }
  }

  async updateComment(req, res) {
    const commentId = req.params.commentId;
    const userId = req.user._id;
    const textValue = (req.body.text || "").toString().trim();

    if (!textValue) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Only owner can edit
      if (comment.userId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }

      comment.text = textValue;
      await comment.save();
      await comment.populate("userId", "username avatar");

      res
        .status(200)
        .json({ message: "Comment updated", payload: { comment } });
    } catch (err) {
      console.error("Failed to update comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteComment(req, res) {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Only owner or quiz owner can delete
      const quiz = await Quiz.findById(comment.quizId);
      if (
        comment.userId.toString() !== userId.toString() &&
        quiz.createdBy.toString() !== userId.toString()
      ) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment" });
      }

      await comment.deleteOne();

      res
        .status(200)
        .json({ message: "Comment deleted", payload: { id: commentId } });
    } catch (err) {
      console.error("Failed to delete comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async startQuizAttempt(req, res) {
    const quizId = req.params.id;
    const userId = req.user._id;

    try {
      const quiz = await Quiz.findById(quizId)
        .populate({
          path: "questions",
          select: "questionText questionType points image options",
        })
        .populate("createdBy", "username avatar");

      if (!quiz) return res.status(404).send({ message: "Quiz not found" });

      // Check if user already has an in-progress attempt
      const existingAttempt = await QuizAttempt.find({
        userId,
        quizId,
        status: "in_progress",
      });
      if (existingAttempt) {
        return res.status(400).json({
          message: "You already have an in-progress attempt",
          payload: {
            attemptId: existingAttempt._id,
          },
        });
      }

      // Calculate total points
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

      //New attempt
      const attempt = await QuizAttempt.create({
        quizId,
        userId,
        totalPoints,
        status: "in_progress",
        startedAt: new Date(),
      });

      // Initialize answers in Redis
      const redisKey = `attempt${attempt._id}:answers`;
      await redis.set(redisKey, JSON.stringify({}), "EX", 7 * 24 * 60 * 60); // 7 days

      const questionsForStudent = quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points,
        image: q.image,
        options: q.options?.map((opt) => ({ text: opt.text })), //not send isCorrect
      }));

      res.status(201).json({
        message: "Quiz attempt started",
        payload: {
          attempt: {
            attemptId: attempt._id,
            quizId: attempt.quizId,
            startedAt: attempt.startedAt,
            totalPoints: attempt.totalPoints,
          },
          questions: questionsForStudent,
        },
      });
    } catch (err) {
      console.error("Failed to start quiz attempt: ", err);
      res.status(500).josn({ message: "Internal server error" });
    }
  }

  async saveDraftAnswer(req, res) {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, textAnswer } = req.body;
    const userId = req.user._id;

    try {
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId,
        status: "in_progress",
      });

      if (!attempt)
        return res
          .status(404)
          .send({ message: "Attempt not found or already completed" });

      // Get existing draft answers from redis
      const redisKey = `attempt:${attemptId}:answers`;
      const draftData = await redis.get(redisKey);
      const draftAnswers = draftData ? JSON.parse(draftData) : {};

      //  Update/save unswer
      draftAnswers[questionId] = {
        selectedOptions: selectedOptions || [],
        textAnswer: textAnswer || null,
      };

      await redis.set(redisKey, JSON.stringify(draftAnswers));

      res.status(200).json({
        message: "Answer saved as draft",
        questionId,
        totalAnswered: Object.keys(draftAnswers).length,
      });
    } catch (err) {
      console.error("Failed to save draft answer:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async submitQuiz(req, res) {
    const { attemptId } = req.params;
    const userId = req.user._id;

    try {
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId,
        status: "in_progress",
      }).populate("quizId");

      if (!attempt) {
        return res
          .status(404)
          .json({ message: "Attempt not found or already submitted" });
      }

      // Get draft from Redis
      const redisKey = `attempt:${attemptId}:answers`;
      const draftData = await redis.get(redisKey);

      if (!draftData)
        return res.status(400).json({ message: "No answers found" });

      const draftAnswers = JSON.parse(draftData);

      // Get questions with correct answers
      const questions = await Question.find({
        _id: { $in: Object.keys(draftAnswers) },
      });

      // Grade answers and calc score
      let totalScore = 0;
      const gradedAnswers = [];

      for (const question of questions) {
        const userAnswer = draftAnswers[question._id.toString()];

        let isCorrect = false;
        let pointsEarned = 0;

        if (question.type === "multiple-choice") {
          // Indexes of correct options
          const correctOptions = question.options
            .map((opt, idx) => (opt.isCorrect ? idx : null))
            .filter((idx) => idx !== null);

          const userOptions = userAnswer.selectedOptions || [];

          isCorrect =
            correctOptions.length === userOptions.length &&
            correctOptions.every((opt) => userOptions.includes(opt));

          pointsEarned = isCorrect ? question.points : 0;
        } else if (question.type === "single-choice") {
          //one correct option
          const correctOptionIndex = question.options.findIndex(
            (opt) => opt.isCorrect
          );
          const userOption = userAnswer.selectedOptions?.[0];

          isCorrect = userOption === correctOptionIndex;
          pointsEarned = isCorrect ? question.points : 0;
        } else if (question.type === "short-answer") {
          const correctText = question.correctAnswer?.trim().toLowerCase();
          const userText = userAnswer.textAnswer?.trim().toLowerCase();

          isCorrect = correctText === userText;
          pointsEarned = isCorrect ? question.points : 0;
        }

        totalScore += pointsEarned;

        gradedAnswers.push({
          question: question._id,
          selectedOptions: userAnswer.selectedOptions,
          textAnswer: userAnswer.textAnswer,
          isCorrect,
          pointsEarned,
        });
      }

      const percentage = (totalScore / attempt.totalPoints) * 100;

      const completedAt = new Date();
      const timeSpent = Math.floor((completedAt - attempt.startedAt) / 1000);

      attempt.answers = gradedAnswers;
      attempt.score = totalScore;
      attempt.percentage = Number(percentage.toFixed(2));
      attempt.timeSpent = timeSpent;
      attempt.completedAt = new Date();
      attempt.status = "completed";

      await attempt.save();
      await redis.del(redisKey);

      // handle daily streak
      const user = await User.findById(userId);
      const today = new Date();
      const lastQuizDate = new Date(user.lastQuizDate);

      const diffDays = Math.floor(
        (today - lastQuizDate) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        user.currentStreak = (user.currentStreak || 0) + 1;
      } else if (diffDays > 1) {
        user.currentStreak = 1; //start again
      }

      user.lastQuizDate = today;
      await user.save();

      res.status(200).json({
        message: "Quiz submitted successfully",
        payload: {
          score: totalScore,
          totalPoints: attempt.totalPoints,
          percentage: attempt.percentage,
          timeSpent: timeSpent,
          correctAnswers: gradedAnswers.filter((a) => a.isCorrect === true)
            .length,
          totalQuestions: gradedAnswers.length,
        },
      });
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async resumeQuiz(req, res) {
    const { attemptId } = req.params;
    const userId = req.user._id;

    try {
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId,
        status: "in_progress",
      }).populate({
        path: "quizId",
        populate: {
          path: "questions",
          select: "-correctAnswer -options.isCorrect",
        },
      });

      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }

      // Get draft answers
      const redisKey = `attempt:${attemptId}:answers`;
      const draftData = await redis.get(redisKey);
      const draftAnswers = draftData ? JSON.parse(draftData) : {};

      res.status(200).json({
        message: "Quiz resumed",
        attempt: {
          attemptId: attempt._id,
          startedAt: attempt.startedAt,
        },
        draftAnswers, // Previously saved answers
        questions: attempt.quizId.questions,
      });
    } catch (err) {
      console.error("Failed to resume quiz:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async restartQuizAttempt(req, res) {
    const quizId = req.params.quizId;
    const userId = req.user._id;

    try {
      const existing = await QuizAttempt.findOneAndDelete({
        quizId,
        userId,
        status: "in_progress",
      });

      if (existing) {
        const redisKey = `attempt:${existing._id}:answers`;
        await redis.del(redisKey);
      }

      const quiz = await Quiz.findById(quizId).populate({
        path: "questions",
        select: "-correctAnswer -options.isCorrect",
      });
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

      const attempt = await QuizAttempt.create({
        quizId,
        userId,
        totalPoints,
        status: "in_progress",
        startedAt: new Date(),
      });

      const redisKey = `attempt:${attempt._id}:answers`;
      await redis.set(redisKey, JSON.stringify({}));
      await redis.expire(redisKey, 7 * 24 * 60 * 60);

      res.status(201).json({
        message: "Quiz restarted successfully",
        attemptId: attempt._id,
        questions: quiz.questions,
      });
    } catch (err) {
      console.error("Failed to restart quiz attempt:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async startLiveSession(req, res) {
    const { id: quizId } = req.params;
    const userId = req.user._id;

    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) return res.status(404).json({ message: "Quiz not found" });

      if (quiz.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (quiz.mode !== "live") {
        return res.status(400).json({ message: "Quiz is not in live mode" });
      }
      if (quiz.isActive && quiz.quizStarted) {
        return res.status(400).json({ message: "Quiz is already running" });
      }
      if (quiz.questions.length === 0) {
        return res
          .status(400)
          .json({ message: "Add questions before starting" });
      }

      quiz.accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      quiz.isActive = true;
      quiz.startTime = new Date();
      await quiz.save();

      res.status(200).json({
        message: "Live quiz lobby opened",
        payload: {
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            accessCode: quiz.accessCode,
            isActive: quiz.isActive,
            totalQuestions: quiz.questions.length,
          },
        },
      });
    } catch (err) {
      console.error("Failed to start live session:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async joinLiveQuiz(req, res) {
    const { accessCode } = req.body;
    const userId = req.user._id;
    const quizId = req.params.id;

    try {
      const quiz = await Quiz.findOne({
        _id: quizId,
        accessCode,
        mode: "live",
      });

      if (!quiz) {
        return res
          .status(404)
          .json({ message: "Quiz not found with this access code" });
      }

      if (!quiz.isActive) {
        return res.status(400).json({ message: "Quiz session is not active" });
      }

      // can't join if quiz already started
      const stateKey = `live:${quizId}:state`;
      const data = await redis.get(stateKey);
      const quizState = data ? JSON.parse(data) : null;

      if (quizState && quizState.quizStarted) {
        return res.status(400).json({
          message: "Quiz already started. You cannot join now.",
        });
      }

      if (quiz.participants.includes(userId)) {
        return res.status(200).json({
          message: "Already joined",
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            totalQuestions: quiz.questions.length,
            quizStarted: quiz.quizStarted,
          },
        });
      }

      // Add to participants
      quiz.participants.push(userId);
      await quiz.save();

      res.status(200).json({
        message: "Successfully joined quiz",
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          totalQuestions: quiz.questions.length,
          quizStarted: quiz.quizStarted,
        },
      });
    } catch (err) {
      console.error("Failed to join live quiz:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new QuizController();
