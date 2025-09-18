import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import app from "./app.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const reportsDir = path.join(__dirname, "../reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("join-session", ({ sessionId }) => {
    socket.join(`session-${sessionId}`);
    console.log(`Client joined session ${sessionId}`);
  });

  socket.on("proctor-event", (data) => {
    socket.to(`session-${data.sessionId}`).emit("proctor-event", data);
    console.log(
      `Broadcast proctor event to session ${data.sessionId}:`,
      data.type
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
