// socket.js
import { io } from "socket.io-client";

// ✅ Connect to backend (force WebSocket)
const socket = io("https://socialnetwork-backend-production-7e1a.up.railway.app", {
  transports: ["websocket"], 
  withCredentials: true
});

export default socket;
