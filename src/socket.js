// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://socialnetwork-backend-production-7e1a.up.railway.app";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // force WebSocket, avoid polling issues
  withCredentials: true,     // needed for CORS
});

export default socket;
