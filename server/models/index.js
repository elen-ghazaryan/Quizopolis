import mongoose from "mongoose";
import { env } from "../config/env.js";


mongoose
  .connect(`mongodb://localhost:27017/${env.DB_NAME}`)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Connection error:", err));

export default mongoose;