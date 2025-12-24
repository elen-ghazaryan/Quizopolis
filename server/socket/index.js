import { Server } from "socket.io"
import quizHanlders from "./quizHandlers.js"
import { env } from "../config/env.js"

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)
    
    quizHanlders(io, socket)
  
    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id)
    })
  })
}