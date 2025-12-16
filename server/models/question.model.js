import mongoose, { Schema, model } from "mongoose";

const questionSchema = new Schema({
  quizId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true 
  },
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["multiple-choice", "single-choice", "short-answer"],
    default: "single-choice",
  },
  explanation: String,

  //for multiple/single choice
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  correctAnswer: { type: String }, // for short-answer
  points: { type: Number, default: 1 },
  image: String,
});

export default model("Question", questionSchema);
