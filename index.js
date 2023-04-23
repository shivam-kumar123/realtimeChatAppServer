const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

require("dotenv").config()

app.use(cors());

let userCount = 0

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://realtimechatappclient.onrender.com",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  userCount++
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`userCount: ${userCount} User with ID: ${socket.id} joined room: ${data}`);
    const clientsInRoom = io.sockets.adapter.rooms.get(data)?.size ?? 0;
    io.to(data).emit("room_count", clientsInRoom);
    io.emit("user_count", userCount);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    userCount--
    console.log("User Disconnected", socket.id);
    io.emit("user_count", userCount);
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log("SERVER RUNNING");
});