import mongoose from "./index.js";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  surname: {
    type: String,
    required: [true, "Surname is required"],
    trim: true
  },
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
    enum: ["user", "admin"],
    default: "user"
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
});

export const User = mongoose.model("User", userSchema);
