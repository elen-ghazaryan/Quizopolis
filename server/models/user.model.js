import mongoose, {Schema, model} from "mongoose"
import validator from "validator";

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email address"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  role: {
    type: String,
    enum: ["teacher", "student"],
    default: "student"
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {type: String, default: ""},

  //streak
  currentStreak: { type: Number, default:0 },
  lastQuizDate: Date,

  //favorite quizzes
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz"}]
});

export default model("User", userSchema);
