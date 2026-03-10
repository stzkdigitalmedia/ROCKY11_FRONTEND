import { io } from "socket.io-client";

let socket = null;

// Initialize the socket connection

export const initSocket = () => {
  if (!socket) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    console.log(socketUrl, "---111111111111111111-----socketUrl-----");

    socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket error:", error.message);
    });
  }
  return socket;
};

// Get the socket
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Connect the socket (if not already connected)
export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

// Disconnect the socket
export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// Join a room
export const joinRoom = (clientName) => {
  const socket = getSocket();
  if (socket.connected && clientName) {
    socket.emit("join", clientName);
    console.log("🔔 Joined room:", clientName);
  } else {
    console.log("⚠️ Cannot join room - socket not connected");
  }
};

// Event handlers
export const onEvent = (eventName, callback) => {
  const socket = getSocket();
  socket.on(eventName, callback);
};

// Remove event listener
export const offEvent = (eventName, callback) => {
  const socket = getSocket();
  socket.off(eventName, callback);
};

// Emit an event with data
export const emitEvent = (eventName, data) => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit(eventName, data);
  }
};
