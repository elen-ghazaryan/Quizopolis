import mongoose, { Schema, model } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress'
    },

    answers: [{
      question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
      selectedOptions: [Number],
      textAnswer: String,
      isCorrect: Boolean,
      pointsEarned: Number
    }],
    
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number },
    startedAt: { type: Date, default: Date.now },
    completedAt: {type: Date},
    timeSpent: Number
  },
  { timestamps: true }
);

export default model("QuizAttempt", quizAttemptSchema);
