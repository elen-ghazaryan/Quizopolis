import { User, QuizAttempt } from "../models/index.js";
import bcrypt from "bcrypt";
import {
  calculateLongestStreak,
  getMonday,
  getSunday,
} from "../helpers/calcLongestStreak.js";

class UserController {
  async getCurrentUser(req, res) {
    const { _id, email, username, bio, role, isEmailVerified, avatar } =
      req.user;
    return res.send({
      message: "Ok",
      payload: { id: _id, email, username, bio, isEmailVerified, role, avatar },
    });
  }

  async updatePassword(req, res) {
    const user = req.user;
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword?.trim() || !newPassword?.trim()) {
      return res.status(400).send({
        message: "Email, old password and new password are required!",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Wrong user credentials" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.send({ message: "Password has been successfully changed" });
  }

  async updateUsername(req, res) {
    const { newUsername } = req.body;
    if (!newUsername)
      return res
        .status(400)
        .send({ message: "Send new username for updating" });
    const user = req.user;

    const found = await User.findOne({ username: newUsername });
    if (found)
      return res.status(400).send({ message: "Username is busy, pick other" });

    user.username = newUsername;
    await user.save();
    res.send({ message: "Username updated successfully " });
  }

  async uploadAvatar(req, res) {
    const user = req.user;
    user.avatar = req.file?.filename;
    if(!user.avatar) return res.status(400).send({ message: "Avatar upload failed" });
    await user.save();
    res.send({
      message: "Successfully updated",
      payload: { avatar: req.file.filename },
    });
  }

  async updateProfile(req, res) {
    const userId = req.user._id;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.send({ message: "Ok", payload: { user } });
  }

  async getStreak(req, res) {
    try {
      const userId = req.user._id;

      const attempts = await QuizAttempt.find({
        userId,
        status: "completed",
      }).sort({ completedAt: 1 });

      if (!attempts.length) {
        return res.json({
          message: "Ok",
          payload:{
            currentStreak: 0,
            longestStreak: 0,
            lastQuizDate: null,
            weekActivity: Array(7).fill({ completed: false, date: null }),
          }
        });
      }

      // Convert all completedAt to Armenia timezone
      const quizDates = attempts.map((a) => getMonday(a.completedAt)); 

      // Current streak
      const today = new Date();
      const todayArmenia = getMonday(today); 
      let currentStreak = 1;
      for (let i = attempts.length - 1; i > 0; i--) {
        const diffDays = Math.floor(
          (toArmeniaDate(attempts[i].completedAt).getTime() -
            toArmeniaDate(attempts[i - 1].completedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) currentStreak++;
        else break;
      }

      const longestStreak = calculateLongestStreak(
        attempts.map((a) => toArmeniaDate(a.completedAt))
      );

      const lastQuizDate = toArmeniaDate(attempts.at(-1).completedAt);

      // Weekly activity
      const monday = getMonday(today);
      const sunday = getSunday(monday);

      const weekActivity = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);

        const completed = attempts.some((a) => {
          const quizDate = toArmeniaDate(a.completedAt);
          return quizDate.toDateString() === day.toDateString();
        });

        weekActivity.push({ date: day, completed });
      }

      return res.json({
        message: "Ok",
        payload: {
          currentStreak,
          longestStreak,
          lastQuizDate,
          weekActivity,
        }
      });
    } catch (err) {
      console.error("Error getting streak:", err);
      return res.status(500).json({ message: "Failed to fetch streak" });
    }
  }

  async getStats(req, res) {
    try {
      const userId = req.user._id;

      // Get all quiz attempts by the current user
      const attempts = await QuizAttempt.find({ userId })
        .populate("quizId", "category difficulty")
        .sort({ createdAt: 1 });

      // If the user has no attempts, return empty stats
      if (!attempts.length) {
        return res.json({
          message: "Ok",
          payload: {
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            averageTime: 0,
            totalTime: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            accuracy: 0,
            strongestCategory: null,
            weakestCategory: null,
            lastQuizDate: null,
            quizzesThisMonth: 0,
            accuracyHistory: [],
          },
        });
      }

      // Basic score stats
      const totalQuizzes = attempts.length;
      const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
      const averageScore = totalScore / totalQuizzes;
      const bestScore = Math.max(...attempts.map((a) => a.score));

      // Time stats
      const totalTime = attempts.reduce(
        (sum, a) => sum + (a.timeSpent || 0),
        0
      );
      const averageTime = totalTime / totalQuizzes;

      //  Accuracy stats
      let correctAnswers = 0;
      let totalQuestions = 0;

      for (const attempt of attempts) {
        for (const answer of attempt.answers) {
          totalQuestions++;
          if (answer.isCorrect) correctAnswers++;
        }
      }
      const accuracy = totalQuestions
        ? (correctAnswers / totalQuestions) * 100
        : 0;

        // Accuracy over time (for chart)
      const accuracyHistory = attempts
        .slice(-15)
        .map((attempt) => {
          let correct = 0;
          let total = 0;

          for (const answer of attempt.answers) {
            total++;
            if (answer.isCorrect) correct++;
          }
          return {
            date: attempt.completedAt
              ? attempt.completedAt.toISOString().split("T")[0]
              : attempt.createdAt.toISOString().split("T")[0],
            accuracy: total ? Number(((correct / total) * 100).toFixed(1)) : 0,
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));


      // Category performance
      const categoryScores = {}; // { categoryName: [scores] }
      for (const attempt of attempts) {
        const category = attempt.quizId?.category || "Unknown";
        if (!categoryScores[category]) categoryScores[category] = [];
        categoryScores[category].push(attempt.score);
      }

      const categoryAverages = Object.entries(categoryScores).map(
        ([cat, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return { category: cat, avg };
        }
      );

      categoryAverages.sort((a, b) => a.avg - b.avg);
      const weakestCategory = categoryAverages[0]?.category || null;
      const strongestCategory = categoryAverages.at(-1)?.category || null;

      // Last quiz date
      const lastQuizDate = attempts.at(-1)?.completedAt || null;

      // Quizzes taken this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const quizzesThisMonth = attempts.filter(
        (a) => a.createdAt >= startOfMonth
      ).length;

      //why Final response
      const statsResponse = {
        message: "Ok",
        payload: {
          totalQuizzes,
          averageScore: Number(averageScore.toFixed(1)),
          bestScore,
          averageTime: Number(averageTime.toFixed(1)),
          totalTime: Number(totalTime.toFixed(1)),
          accuracy: Number(accuracy.toFixed(1)),
          correctAnswers,
          totalQuestions,
          strongestCategory,
          weakestCategory,
          lastQuizDate,
          quizzesThisMonth,
          accuracyHistory,
        },
      };

      return res.json(statsResponse);
    } catch (err) {
      console.error("Error getting user stats:", err);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  }

  async addFavorite(req, res) {
    const userId = req.user._id;
    const { quizId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.favorites.includes(quizId)) {
        user.favorites.push(quizId);
        await user.save();
      }

      res.status(200).json({
        message: "Quiz added to favorites",
        payload: user.favorites,
      });
    } catch (err) {
      console.error("Add favorite error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async removeFavorite(req, res) {
    const userId = req.user._id;
    const { quizId } = req.params;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== quizId
      );
      await user.save();

      res.status(200).json({
        message: "Quiz removed from favorites",
        payload: user.favorites ,
      });
    } catch (err) {
      console.error("Remove favorite error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllFavorites(req, res) {
    const userId = req.user._id

    try {
      const user = await User.findById(userId).populate({
        path: "favorites",
        match: { mode: "standard" },
        select: "_id title description difficulty category points createdAt createdBy",
        populate: {
          path: "createdBy",
          select: "username avatar",
        },
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(200).json({ payload: user.favorites });
    } catch (err) {
      console.error("Get favorites error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new UserController();
