import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { socketHandler } from "./socket/socket.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();  
connectDB();

const app = express();  
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('Socket auth token:', token ? 'present' : 'missing');
  if (!token) {
    console.log('No token provided');
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    console.log('Authenticated user:', socket.username);
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    next(new Error('Authentication error'));
  }
});

socketHandler(io);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}...`);
      if (port < 65535) {
        startServer(port + 1);
      } else {
        console.error('No available ports found');
        process.exit(1);
      }
    } else {
      console.error(err);
    }
  });
};

startServer(PORT);
