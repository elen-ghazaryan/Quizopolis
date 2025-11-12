import mongoose from "mongoose";

const commnetSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: String,
}, { timestamps: true})

export default mongoose.model("Comment", commnetSchema);