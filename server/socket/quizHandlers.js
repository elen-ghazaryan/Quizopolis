import { Quiz, User, QuizAttempt } from "../models/index.js";
import redis from "../config/redis.js";

/* ---------- Redis key helpers ---------- */
const redisKeys = {
  state: (quizId) => `live:${quizId}:state`,
  scores: (quizId) => `live:${quizId}:scores`,
  answers: (quizId, qIndex) => `live:${quizId}:q${qIndex}:answers`,
};

/* ---------- Helpers ---------- */
async function getQuizState(quizId) {
  const data = await redis.get(redisKeys.state(quizId));
  return data ? JSON.parse(data) : null;
}

async function setQuizState(quizId, state) {
  await redis.set(redisKeys.state(quizId), JSON.stringify(state));
}

function requireTeacher(socket) {
  if (socket.role !== "teacher") {
    socket.emit("error", { message: "Forbidden" });
    return false;
  }
  return true;
}

function requireStudent(socket) {
  if (socket.role !== "student") {
    socket.emit("error", { message: "Forbidden" });
    return false;
  }
  return true;
}

function quizHandlers(io, socket) {
  /* ================= TEACHER ================= */

  socket.on("teacher:join-room", async ({ quizId, userId }) => {
    try {
      const quiz = await Quiz.findById(quizId).populate(
        "participants",
        "username avatar"
      );
      if (!quiz) return socket.emit("error", { message: "Quiz not found" });

      const creatorId = quiz.createdBy.toString();
      const requesterId = userId.toString();

      if (creatorId !== requesterId)
        return socket.emit("error", { message: "Unauthorized" });

      socket.join(`quiz:${quizId}`);
      socket.quizId = quizId;
      socket.role = "teacher";

      socket.emit("teacher:joined", {
        message: "Joined quiz room",
        participants: quiz.participants,
        totalParticipants: quiz.participants.length,
      });
    } catch {
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("teacher:start-quiz", async ({ quizId }) => {
    if (!requireTeacher(socket)) return;

    try {
      const quiz = await Quiz.findById(quizId).populate(
        "questions participants"
      );
      if (!quiz || quiz.questions.length === 0)
        return socket.emit("error", { message: "No questions in quiz" });
      if (!quiz.isActive)
        return socket.emit("error", { message: "Quiz session not active" });

      // Delete old redis keys
      await redis.del(redisKeys.state(quizId));
      await redis.del(redisKeys.scores(quizId));
      for (let i = 0; i < quiz.questions.length; i++) {
        await redis.del(redisKeys.answers(quizId, i));
      }

      const existingState = await getQuizState(quizId);
      if (existingState?.quizStarted)
        return socket.emit("error", { message: "Quiz already started" });

      const quizState = {
        quizStarted: true,
        currentQuestionIndex: 0,
        questionStartTime: new Date().toISOString(),
        totalQuestions: quiz.questions.length,
      };
      await setQuizState(quizId, quizState);

      const scores = {};
      quiz.participants.forEach((u) => (scores[u._id.toString()] = 0));
      await redis.set(redisKeys.scores(quizId), JSON.stringify(scores));

      const q = quiz.questions[0];

      io.to(`quiz:${quizId}`).emit("quiz:started", {
        question: {
          index: 0,
          total: quiz.questions.length,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options.map((o) => ({ text: o.text })),
          points: q.points,
          image: q.image,
          questionId: q._id,
        },
        startTime: quizState.questionStartTime,
      });
    } catch {
      socket.emit("error", { message: "Failed to start quiz" });
    }
  });

  socket.on("teacher:next-question", async ({ quizId }) => {
    if (!requireTeacher(socket)) return;

    try {
      const quiz = await Quiz.findById(quizId).populate("questions");
      const quizState = await getQuizState(quizId);
      if (!quizState?.quizStarted)
        return socket.emit("error", { message: "Quiz not started" });

      const qIndex = quizState.currentQuestionIndex;
      const currentQuestion = quiz.questions[qIndex];

      const answersData = await redis.get(redisKeys.answers(quizId, qIndex));
      const answers = answersData ? JSON.parse(answersData) : {};

      const totalAnswered = Object.keys(answers).length;
      const correctAnswers = Object.values(answers).filter(
        (a) => a.isCorrect
      ).length;

      io.to(`quiz:${quizId}`).emit("question:results", {
        questionIndex: qIndex,
        correctAnswers: currentQuestion.options
          .map((o, i) => (o.isCorrect ? i : null))
          .filter((i) => i !== null),
        explanation: currentQuestion.explanation,
        stats: {
          totalAnswered,
          correctAnswers,
          percentage:
            totalAnswered > 0
              ? ((correctAnswers / totalAnswered) * 100).toFixed(1)
              : 0,
        },
      });

      setTimeout(async () => {
        quizState.currentQuestionIndex += 1;

        if (quizState.currentQuestionIndex >= quiz.questions.length) {
          await handleQuizEnd(io, quiz);
          return;
        }

        quizState.questionStartTime = new Date().toISOString();
        await setQuizState(quizId, quizState);

        const next = quiz.questions[quizState.currentQuestionIndex];
        io.to(`quiz:${quizId}`).emit("question:new", {
          question: {
            index: quizState.currentQuestionIndex,
            total: quiz.questions.length,
            questionText: next.questionText,
            questionType: next.questionType,
            options: next.options.map((o) => ({ text: o.text })),
            points: next.points,
            image: next.image,
            questionId: next._id,
          },
          startTime: quizState.questionStartTime,
        });
      }, 6000);
    } catch {
      socket.emit("error", { message: "Failed to move to next question" });
    }
  });

  socket.on("teacher:end-quiz", async ({ quizId }) => {
    if (!requireTeacher(socket)) return;
    try {
      const quiz = await Quiz.findById(quizId).populate("questions");
      await handleQuizEnd(io, quiz);
    } catch {
      socket.emit("error", { message: "Failed to end quiz" });
    }
  });

  /* ================= STUDENT ================= */

  socket.on("student:join-room", async ({ quizId, userId }) => {
    try {
      const quiz = await Quiz.findById(quizId).select(
        "title questions participants"
      );
      if (!quiz) return socket.emit("error", { message: "Quiz not found" });

      if (!quiz.participants.some((p) => p.toString() === userId))
        return socket.emit("error", { message: "Join quiz first" });

      const quizState = await getQuizState(quizId);
      if (quizState?.quizStarted)
        return socket.emit("error", { message: "Quiz already started" });

      socket.join(`quiz:${quizId}`);
      socket.quizId = quizId;
      socket.userId = userId;
      socket.role = "student";

      socket.emit("student:joined", {
        quizTitle: quiz.title,
        waitingForStart: true,
        totalQuestions: quiz.questions.length,
      });

      const participantData = await User.findById(userId).select(
        "username avatar"
      );
      socket
        .to(`quiz:${quizId}`)
        .emit("participant:joined", { participant: participantData });
    } catch {
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("student:submit-answer", async (data) => {
    if (!requireStudent(socket)) return;

    const { quizId, questionId, selectedOptions, textAnswer } = data;

    try {
      const quiz = await Quiz.findById(quizId).populate("questions");
      const quizState = await getQuizState(quizId);
      if (!quizState) return;

      const qIndex = quizState.currentQuestionIndex;
      const question = quiz.questions[qIndex];
      if (question._id.toString() !== questionId) return;

      const answersKey = redisKeys.answers(quizId, qIndex);
      const answersData = await redis.get(answersKey);
      const answers = answersData ? JSON.parse(answersData) : {};

      if (answers[socket.userId])
        return socket.emit("error", { message: "Answer already submitted" });

      let isCorrect = false;
      if (question.questionType !== "short-answer") {
        const correct = question.options
          .map((o, i) => (o.isCorrect ? i : null))
          .filter((i) => i !== null);
        isCorrect =
          correct.length === selectedOptions.length &&
          correct.every((i) => selectedOptions.includes(i));
      } else {
        isCorrect =
          textAnswer?.toLowerCase().trim() ===
          question.correctAnswer?.toLowerCase().trim();
      }

      const points = isCorrect ? question.points : 0;
      answers[socket.userId] = {
        selectedOptions,
        textAnswer,
        isCorrect,
        points,
      };
      await redis.set(answersKey, JSON.stringify(answers));

      const scoresData = await redis.get(redisKeys.scores(quizId));
      const scores = scoresData ? JSON.parse(scoresData) : {};
      scores[socket.userId] = (scores[socket.userId] || 0) + points;
      await redis.set(redisKeys.scores(quizId), JSON.stringify(scores));

      socket.emit("answer:submitted", {
        isCorrect,
        points,
        totalScore: scores[socket.userId],
      });

      io.to(`quiz:${quizId}`).emit("student:answered", {
        userId: socket.userId,
        totalAnswered: Object.keys(answers).length,
      });
    } catch {
      socket.emit("error", { message: "Failed to submit answer" });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);

    if (socket.role !== "student" || !socket.quizId || !socket.userId) {
      return;
    }

    const roomName = `quiz:${socket.quizId}`;

    try {
      const quizStateRaw = await redis.get(`live:${socket.quizId}:state`);
      const quizState = quizStateRaw ? JSON.parse(quizStateRaw) : null;

      // If quiz already started → do nothing
      if (quizState?.quizStarted) {
        return;
      }

      // Quiz not started → remove participant
      const quiz = await Quiz.findById(socket.quizId);
      if (!quiz) return;

      quiz.participants = quiz.participants.filter(
        (p) => p.toString() !== socket.userId.toString()
      );

      await quiz.save();

      console.log(
        `Removed participant ${socket.userId} from quiz ${socket.quizId}`
      );

      // Notify everyone
      io.to(roomName).emit("participant:left", {
        userId: socket.userId,
      });
    } catch (err) {
      console.error("Error removing participant on disconnect:", err);
    }
  });
}

/* ---------- End Quiz ---------- */
async function handleQuizEnd(io, quiz) {
  try {
    const quizId = quiz._id;

    // Get all answers from Redis
    const scoresData = await redis.get(redisKeys.scores(quizId));
    const scores = scoresData ? JSON.parse(scoresData) : {};

    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

    // Build leaderboard
    const leaderboard = await Promise.all(
      Object.entries(scores).map(async ([userId, score]) => {
        const user = await User.findById(userId);
        return {
          userId,
          username: user.username,
          avatar: user.avatar,
          score,
          percentage: totalPoints > 0 ? ((score / totalPoints) * 100).toFixed(1) : "0.0",
        };
      })
    );

    leaderboard.sort((a, b) => b.score - a.score);

    // Save quiz attempts to DB
    const parsedResults = await Promise.all(
      quiz.questions.map(async (_, qIndex) => {
        const answersData = await redis.get(redisKeys.answers(quizId, qIndex));
        return answersData ? JSON.parse(answersData) : {};
      })
    );

    // Merge answers per user
    const attemptsMap = {};
    parsedResults.forEach((qAnswers) => {
      Object.entries(qAnswers).forEach(([userId, answerData]) => {
        if (!attemptsMap[userId]) attemptsMap[userId] = [];
        attemptsMap[userId].push(answerData);
      });
    });

    const attemptDocs = Object.entries(attemptsMap).map(([userId, answers]) => ({
      quizId,
      userId,
      score: scores[userId] || 0,
      totalPoints,  
      percentage: totalPoints > 0 ? ((scores[userId] || 0) / totalPoints) * 100 : 0,
      answers,
      mode: "live",
      status: "completed",
    }));

    if (attemptDocs.length > 0) {
      await QuizAttempt.insertMany(attemptDocs);
    }

    // Emit leaderboard & quiz ended
    io.to(`quiz:${quizId}`).emit("quiz:ended", {
      leaderboard,
      totalQuestions: quiz.questions.length,
    });

    // Clear Redis keys
    await redis.del(redisKeys.scores(quizId));
    await redis.del(redisKeys.state(quizId));
    for (let i = 0; i < quiz.questions.length; i++) {
      await redis.del(redisKeys.answers(quizId, i));
    }

    // Mark quiz as inactive
    quiz.isActive = false;
    quiz.quizStarted = false;
    quiz.accessCode = null;
    await quiz.save();

  } catch (err) {
    console.error("Error in handleQuizEnd:", err);
  }
}

export default quizHandlers;
