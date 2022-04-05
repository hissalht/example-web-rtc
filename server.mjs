import { Server, Socket } from "socket.io";

const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
  },
});

/** @type {Socket[]} */
const sockets = [];

io.on("connection", (socket) => {
  console.log("User connected with id", socket.id);
  sockets.push(socket);
  console.log(sockets.map((s) => s.id));

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    sockets.splice(
      sockets.findIndex((s) => s.id === socket.id),
      1
    );
  });

  socket.emit("hello", { message: "world" });

  socket.on("game-offer", (arg) => {
    console.log("Received SDP offer from", socket.id);
    const otherSocket = sockets.find((s) => s.id !== socket.id);
    otherSocket.emit("game-offer", arg);
  });

  socket.on("game-answer", (arg) => {
    console.log("Received SDP answer from", socket.id);
    const otherSocket = sockets.find((s) => s.id !== socket.id);
    otherSocket.emit("game-answer", arg);
  });

  socket.on("ice-candidate", (arg) => {
    console.log("Received ICE candidate from", socket.id);
    const otherSocket = sockets.find((s) => s.id !== socket.id);
    otherSocket.emit("ice-candidate", arg);
  });
});
