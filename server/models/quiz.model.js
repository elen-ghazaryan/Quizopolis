import mongoose, { Schema, model } from "mongoose";

const quizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  //standard-only fields
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],

  //settings
  category: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard']},
  
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    }
  ],

  isPublished: Boolean,

  //mode
  mode: { type: String, enum: ['standard', 'live'], default: 'standard' },

  // Live-only fields
  accessCode: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: false },
  
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema)