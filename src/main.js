import { io } from "socket.io-client";

const socket = io("ws://localhost:4000");

const connectButton = document.querySelector("button");

socket.on("connect", () => {
  console.log("Connected with socket id", socket.id);
});

connectButton.addEventListener("click", async () => {
  const conn = new RTCPeerConnection();
  const sendChannel = conn.createDataChannel("host-send-channel");

  sendChannel.addEventListener("open", () => {
    console.log("OPEN");

    sendChannel.send("Hello from the other side :)");
    sendChannel.send("ping");
  });

  sendChannel.addEventListener("close", () => {
    console.log("CLOSE");
  });

  conn.addEventListener("icecandidate", ({ candidate }) => {
    if (candidate) {
      socket.emit("ice-candidate", candidate);
    }
  });

  conn.addEventListener("datachannel", (channelEvent) => {
    const receiveChannel = channelEvent.channel;
    receiveChannel.addEventListener("message", (messageEvent) => {
      console.log("RECEIVED MESSAGE: ", messageEvent.data);
    });
  });

  const offer = await conn.createOffer();
  await conn.setLocalDescription(offer);
  socket.emit("game-offer", offer);

  socket.on("game-answer", (answer) => {
    console.log("Received game answer", answer);
    conn.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", (candidate) => {
    conn.addIceCandidate(candidate);
  });
});

socket.on("game-offer", async (offer) => {
  console.log("Received game offer", offer);
  const conn = new RTCPeerConnection();
  const sendChannel = conn.createDataChannel("hosted-send-channel");

  sendChannel.addEventListener("open", () => {
    console.log("OPEN");
  });

  sendChannel.addEventListener("close", () => {
    console.log("CLOSE");
  });

  conn.addEventListener("icecandidate", ({ candidate }) => {
    console.log("ICE", candidate);
    if (candidate) {
      socket.emit("ice-candidate", candidate);
    }
  });

  conn.addEventListener("datachannel", (e) => {
    console.log("DATACHANNEL", e);
    const receiveChannel = e.channel;
    receiveChannel.addEventListener("message", (messageEvent) => {
      console.log("RECEIVED MESSAGE", messageEvent);
      if (messageEvent.data === "ping") {
        sendChannel.send("pong");
      }
    });
  });

  console.log("Setting remote description");
  await conn.setRemoteDescription(offer);
  const answer = await conn.createAnswer();
  await conn.setLocalDescription(answer);

  socket.emit("game-answer", answer);

  socket.on("ice-candidate", (candidate) => {
    conn.addIceCandidate(candidate);
  });
});
