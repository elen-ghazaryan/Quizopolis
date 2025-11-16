import { Quiz, User, QuizAttempt, Question } from "../models/index.js";
import redis from "../config/redis.js";

function quizHandlers(io, socket) {
  async function getQuizState(quizId) {
    const stateKey = `live:${quizId}:state`;
    const data = await redis.get(stateKey);
    return data ? JSON.parse(data) : null;
  }

  async function setQuizState(quizId, state) {
    const stateKey = `live:${quizId}:state`;
    const data = await redis.set(stateKey, JSON.stringify(state));
    return data ? JSON.parse(data) : null;
  }

  // Teacher events
  socket.on("teahcer:join-room", async (data) => {
    const { quizId, userId } = data;

    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        socket.emit("error", { message: "Quiz not found" });
        return;
      }

      if (quiz.createdBy.toString() !== userId.toString()) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      const roomName = `quiz:${quizId}`;
      socket.join(roomName);
      socket.quizId = quizId;
      socket.role = "teacher";

      console.log(`Teacher joined room: ${roomName}`);

      socket.emit("teacher:joined", {
        message: "Joined quiz room",
        roomName,
        participants: quiz.participants.length,
      });
    } catch (err) {
      console.error("Teacher join error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("teacher:start-quiz", async (data) => {
    const { quizId } = data;
    const roomName = `quiz:${quizId}`;

    try {
      const quiz = await Quiz.findById(quizId).populate(["questions", "participants"]);

      if (!quiz || quiz.questions.length === 0) {
        socket.emit("error", { message: "No questions in quiz" });
        return;
      }

      if (!quiz.isActive) {
        socket.emit("error", { message: "Quiz session not active" });
        return;
      }

      // Initialize quiz state in Redis
      const quizState = {
        quizStarted: true,
        currentQuestionIndex: 0,
        questionStartTime: new Date().toISOString(),
        totalQuestions: quiz.questions.length,
      };
      await setQuizState(quizId, quizState);

      // Initialize scores in Redis
      const scoresKey = `live:${quizId}:scores`;
      const initialScores = {};
      quiz.participants.forEach((user) => {
        initialScores[user._id.toString()] = 0;
      });
      await redis.set(scoresKey, JSON.stringify(initialScores));

      const firstQuestion = quiz.questions[0];

      io.to(roomName).emit("quiz:started", {
        message: "Quiz has begun!",
        question: {
          index: 0,
          total: quiz.questions.length,
          questionText: firstQuestion.questionText,
          questionType: firstQuestion.questionType,
          options: firstQuestion.options.map((opt) => ({ text: opt.text })),
          points: firstQuestion.points,
          image: firstQuestion.image,
          questionId: firstQuestion._id,
        },
        startTime: quizState.questionStartTime,
      });

      console.log(
        `Quiz started: ${quizId}, Question 1/${quiz.questions.length}`
      );
    } catch (err) {
      console.error("Start quiz error:", err);
      socket.emit("error", { message: "Failed to start quiz" });
    }
  });

  socket.on("teacher:next-question", async (data) => {
    const { quizId } = data;
    const roomName = `quiz:${quizId}`;

    try {
      const quiz = await Quiz.findById(quizId).populate("questions");
      const quizState = await getQuizState(quizId);

      if (!quizState || !quizState.quizStarted) {
        socket.emit("error", { message: "Quiz not started" });
        return;
      }

      // current question results
      const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
      const answerKey = `live:${quizId}:q${quizState.currentQuestionIndex}:answers`;
      const answersData = await redis.get(answersKey);
      const answers = answersData ? JSON.parse(answerData) : {};

      const totalAnswered = Object.keys(answers).length;
      const correctAnswers = Object.values(answers).filter(
        (a) => a.isCorrect
      ).length;

      //show results
      io.to(roomName).emit("question:results", {
        questionIndex: quizState.currentQuestionIndex,
        correctAnswers: currentQuestion.options
          .map((opt, idx) => (opt.isCorrect ? idx : null))
          .filter((idx) => idx !== null),
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
        //move to next question
        quizState.currentQuestionIndex += 1;

        if (quizState.currentQuestion >= quiz.questions.length) {
          await handleQuizEnd(io, quiz);
          return;
        }

        quizState.questionStartTime = new Date();
        await setQuizState(quizId, quizState);

        const nextQuestion = quiz.questions[quizState.currentQuestionIndex];
        io.to(roomName).emit("question:new", {
          question: {
            index: quizState.currentQuestionIndex,
            total: quiz.questions.length,
            questionText: nextQuestion.questionText,
            questionType: nextQuestion.questionType,
            options: nextQuestion.options.map((opt) => ({ text: opt.text })),
            points: nextQuestion.points,
            image: nextQuestion.image,
            questionId: nextQuestion._id,
          },
          startTime: quizState.questionStartTime,
        });

        console.log(
          `➡️ Next question: ${quizState.currentQuestionIndex + 1}/${
            quiz.questions.length
          }`
        );
      }, 3000);
    } catch (err) {
      console.error("Next question error:", err);
      socket.emit("error", { message: "Failed to move to next question" });
    }
  });

  socket.on("teacher:end-quiz", async (data) => {
    const { quizId } = data;

    try {
      const quiz = await Quiz.findById(quizId).populate("questions");
      await handleQuizEnd(io, quiz);
    } catch (err) {
      console.error("End quiz error:", err);
      socket.emit("error", { message: "Failed to end quiz" });
    }
  });

  //Student events
  socket.on("student:join-room", async (data) => {
    const { quizId, userId, accessCode } = data;
    const roomName = `quiz:${quizId}`;

    try {
      const quiz = await Quiz.findById(quizId).select('title questions participants');
      const user = await User.findById(userId).select('username avatar');

      // user should be in participants 
      if (!quiz.participants.some((p) => p._id.toString() === userId)) {
        socket.emit("error", { 
          message: "You are not registered for this quiz. Please join first." 
        });
        return;
      }

      // quiz must not have started 
      const quizState = await getQuizState(quizId);
      if (quizState && quizState.quizStarted) {
        socket.emit("error", {
          message: "Quiz already started. You cannot join the room now."
        });
        return;
      }

      //join the quiz room
      socket.join(roomName);
      socket.quizId = quizId;
      socket.userId = userId;
      socket.role = "student";

      console.log(`Student ${user.username} joined room: ${roomName}`);

      const totalParticipants = quiz.participants.length;

      const payload = {
        message: "Joined quiz room",
        quizTitle: quiz.title,
        waitingForStart: true,
        totalQuestions: quiz.questions.length,
      }

      socket.emit("student:joined", payload);


      io.to(roomName).emit("participant:joined", {
        participant: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
        totalParticipants
      });
    } catch (err) {
      console.error("Student join error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("student:submit-answer", async (data) => {
    const { quizId, questionId, selectedOptions, textAnswer } = data;
    const userId = socket.userId;

    try {
      const quiz = await Quiz.findById(quizId).populate("questions");
      const quizState = await getQuizState(quizId);

      if (!quizState) {
        socket.emit("error", { message: "Quiz not started" });
        return;
      }

      const question = quiz.questions[quizState.currentQuestionIndex];

      if (question._id.toString() !== questionId) {
        socket.emit("error", { message: "Wrong question" });
        return;
      }

      let isCorrect = false;
      if (
        question.questionType === "multiple-choice" ||
        question.questionType === "single-choice"
      ) {
        const correctIndices = question.options
          .map((opt, idx) => (opt.isCorrect ? idx : null))
          .filter((idx) => idx !== null);

        isCorrect =
          correctIndices.length === selectedOptions.length &&
          correctIndices.every((idx) => selectedOptions.includes(idx));
      } else if (question.questionType === "short-answer") {
        isCorrect =
          textAnswer?.toLowerCase().trim() ===
          question.correctAnswer?.toLowerCase().trim();
      }

      let pointsEarned = 0;
      if (isCorrect) {
        pointsEarned = question.points
      }

      // Save answer
      const answersKey = `live:${quizId}:q${quizState.currentQuestionIndex}:answers`;
      const answersData = await redis.get(answersKey);
      const answers = answersData ? JSON.parse(answersData) : {};

      answers[userId] = {
        selectedOptions,
        textAnswer,
        isCorrect,
        pointsEarned
      };

      await redis.set(answersKey, JSON.stringify(answers));

      // Update score
      const scoresKey = `live:${quizId}:scores`;
      const scoresData = await redis.get(scoresKey);
      const scores = JSON.parse(scoresData);
      scores[userId] = (scores[userId] || 0) + pointsEarned;
      await redis.set(scoresKey, JSON.stringify(scores));

      socket.emit("answer:submitted", {
        message: "Answer submitted",
        isCorrect,
        pointsEarned,
        totalScore: scores[userId],
      });

      const roomName = `quiz:${quizId}`;
      io.to(roomName)
      .fetchSockets()
      .then((sockets) => {
        sockets
          .filter((s) => s.role === "teacher")
          .forEach((teacherSocket) =>
            teacherSocket.emit("student:answered", {
              totalAnswered: Object.keys(answers).length,
              totalParticipants: quiz.participants.length,
            })
          );
      });

      console.log(
        `Answer submitted by user ${userId}: ${
          isCorrect ? "Correct" : "Wrong"
        }`
      );
    } catch (err) {
      console.error("Submit answer error:", err);
      socket.emit("error", { message: "Failed to submit answer" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    if (socket.role === "student" && socket.quizId) {
      const roomName = `quiz:${socket.quizId}`;
      io.to(roomName).emit("participant:left", {
        userId: socket.userId,
      });
    }
  });
}

async function handleQuizEnd(io, quiz) {
  const roomName = `quiz:${quiz._id}`;

  try {
    const scoresKey = `live:${quiz._id}:scores`;
    const scoresData = await redis.get(scoresKey);
    const scores = JSON.parse(scoresData);

    const leaderboard = await Promise.all(
      Object.entries(scores).map(async ([userId, score]) => {
        const user = await User.findById(userId);
        return {
          userId,
          username: user.username,
          avatar: user.avatar,
          score,
          percentage: (
            (score / quiz.questions.reduce((sum, q) => sum + q.points, 0)) *
            100
          ).toFixed(1),
        };
      })
    );

    leaderboard.sort((a, b) => b.score - a.score);

    // Save attempts
    for (const entry of leaderboard) {
      const answers = [];

      for (let i = 0; i < quiz.questions.length; i++) {
        const answersKey = `live:${quiz._id}:q${i}:answers`;
        const answersData = await redis.get(answersKey);
        if (answersData) {
          const questionAnswers = JSON.parse(answersData);
          if (questionAnswers[entry.userId]) {
            answers.push({
              question: quiz.questions[i]._id,
              ...questionAnswers[entry.userId],
            });
          }
        }
      }

      await QuizAttempt.create({
        quizId: quiz._id,
        userId: entry.userId,
        status: "completed",
        answers,
        score: entry.score,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        percentage: parseFloat(entry.percentage),
        startedAt: quiz.startTime,
        completedAt: new Date(),
        timeSpent: Math.floor((new Date() - new Date(quiz.startTime)) / 1000),
      });

      
      const user = await User.findById(entry.userId);
      if (user) {
        await updateUserStreak(user);
      }
    }

    // Update quiz in DB
    quiz.isActive = false;
    quiz.endTime = new Date();
    await quiz.save();

    io.to(roomName).emit("quiz:ended", {
      message: "Quiz completed!",
      leaderboard,
      totalQuestions: quiz.questions.length,
    });

    // Clean up Redis
    await redis.del(scoresKey);
    await redis.del(`live:${quiz._id}:state`);
    for (let i = 0; i < quiz.questions.length; i++) {
      await redis.del(`live:${quiz._id}:q${i}:answers`);
    }

    console.log(` Quiz ended: ${quiz._id}`);
  } catch (err) {
    console.error("Handle quiz end error:", err);
  }
}

async function updateUserStreak(user) {
  const today = new Date();
  const lastQuizDate = new Date(user.lastQuizDate);

  const diffDays = Math.floor(
    (today - lastQuizDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    // consecutive day
    user.currentStreak = (user.currentStreak || 0) + 1;
  } else if (diffDays > 1) {
    // broke streak
    user.currentStreak = 1;
  }

  user.lastQuizDate = today;
  if (!user.longestStreak || user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  await user.save();
} 
export default quizHandlers;

