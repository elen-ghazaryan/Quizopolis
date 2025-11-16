io.on("connection", (socket) => {
  socket.on("chat:get-messages", async ({ quizId }) => {
    const messages = await ChatMessage.find({ quizId })
      .sort({ createdAt: 1 })
      .populate("userId", "username");

    socket.emit("chat:load-messages", messages.map(msg => ({
      messageId: msg._id,
      userId: msg.userId._id,
      username: msg.userId.username,
      message: msg.message,
      createdAt: msg.createdAt,
    })));
  });

  socket.on("student:join-chat", ({ quizId, userId }) => {
    const roomName = `quiz:${quizId}`;
    socket.join(roomName);
    socket.quizId = quizId;
    socket.userId = userId;
    socket.role = "student";
  });

  socket.on("teacher:join-chat", ({ quizId, userId }) => {
    const roomName = `quiz:${quizId}`;
    socket.join(roomName);
    socket.quizId = quizId;
    socket.userId = userId;
    socket.role = "teacher";
  });

  
  socket.on("chat:send-message", async ({ quizId, text }) => {
    if (!socket.userId) return;

    // Save message to DB
    const message = await ChatMessage.create({
      quizId,
      userId: socket.userId,
      message: text,
    });

    await message.populate("userId", "username");

    const roomName = `quiz:${quizId}`;

    io.to(roomName).emit("chat:new-message", {
      messageId: message._id,
      userId: message.userId._id,
      username: message.userId.username,
      text: message.text,
      createdAt: message.createdAt,
    });
  });
});
