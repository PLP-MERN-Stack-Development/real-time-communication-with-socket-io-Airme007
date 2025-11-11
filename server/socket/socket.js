import Message from "../models/Message.js";

const users = {};

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id, "User:", socket.username);
    users[socket.id] = socket.username;
    io.emit("user_list", Object.values(users));
    io.emit("user_joined", { username: socket.username });

    socket.on("send_message", async (data) => {
      const username = users[socket.id];
      const message = {
        id: Date.now(),
        username,
        message: data.message,
        timestamp: new Date().toISOString(),
      };
      io.emit("receive_message", message);

      // Save to DB
      await Message.create({
        sender: username,
        text: data.message,
        room: "global", // Assuming global chat
      });
    });

    socket.on("private_message", async (data) => {
      const sender = users[socket.id];
      const receiverSocketId = data.toSocketId;
      const receiverSocket = io.sockets.sockets.get(receiverSocketId);
      if (receiverSocket) {
        const message = {
          id: Date.now(),
          username: sender,
          message: data.message,
          timestamp: new Date().toISOString(),
          private: true,
        };
        receiverSocket.emit("private_message", message);
        socket.emit("private_message", message); // Also send to sender
        // Save to DB
        await Message.create({
          sender,
          receiver: users[receiverSocketId],
          text: data.message,
          room: "private",
        });
      }
    });

    socket.on("typing", (isTyping) => {
      const username = users[socket.id];
      if (isTyping) io.emit("typing_users", [username]);
      else io.emit("typing_users", []);
    });

    socket.on("disconnect", () => {
      const username = users[socket.id];
      delete users[socket.id];
      io.emit("user_list", Object.values(users));
      io.emit("user_left", { username });
      console.log("❌ User disconnected:", username);
    });
  });
};
