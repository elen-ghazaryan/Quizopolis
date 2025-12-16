import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { env } from "./config/env.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { quizRouter } from "./routes/quiz.js";
import { adminQuizRouter } from "./routes/admin-access/admin-quiz.js";
import { setupSocket } from "./socket/index.js"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import http from 'http'
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app)

setupSocket(server)

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use('/uploads', express.static(path.join(__dirname, "public/uploads")));

//routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/admin/quiz", adminQuizRouter);


const swaggerDocument = YAML.load("./swagger/swagger.yaml")
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

try {
  await connectDb();
  console.log("Mongo Connected!");

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port 4000 is already in use`);
    } else {
      console.error("Server error:", error);
    }
    process.exit(1);
  });

  server.listen(4000, () => {
    console.log("Server started on: http://localhost:4000/api/docs");
  });
} catch (error) {
  console.error("Failed to start server:", error);
}

process.on("SIGINT", async () => {
  console.log("Closing gracefully...");

  try {
    await disconnectDb();
  } catch (e) {
    console.error("DB disconnect error:", e);
  }

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("Closing gracefully...");

  try {
    await disconnectDb();
  } catch (e) {
    console.error("DB disconnect error:", e);
  }

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});