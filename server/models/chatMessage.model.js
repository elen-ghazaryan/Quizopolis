import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
}, {timestamps: true})

export default mongoose.model("ChatMessage", chatMessageSchema)