import { Server } from "http";
import { WebSocketServer } from "ws";

export const initWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");

    ws.on("message", (message) => {
      console.log("Received:", message.toString());
      ws.send(`Echo: ${message}`);
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    ws.send("Welcome to WebSocket server!");
  });
};
