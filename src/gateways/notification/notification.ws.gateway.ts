import { EOperationNotificationType } from "@/types/enums";
import { IncomingMessage } from "http";
import WebSocket, { Server } from "ws";
import WebSocketNotificationUtils from "./notification.utils.gateway";

interface IConnectedClients {
  [nickname: string]: WebSocket;
}

export default class WebSocketNotificationManager {
  private wss: Server;
  private utils: WebSocketNotificationUtils = new WebSocketNotificationUtils();

  constructor(server: any) {
    this.wss = new Server({ noServer: true });

    server.on("upgrade", (req: IncomingMessage, socket: any, head: any) => {
      if (req.url?.startsWith("/ws/notifications")) {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit("connection", ws, req);
        });
      }
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const nickname = req.url?.split("nickname=")[1];

      if (!nickname) {
        ws.close();
        return;
      }

      console.log(`User connected: ${nickname}`);

      this.utils.clients[nickname] = ws;
      this.utils.sendStoredDuels(nickname, ws);

      ws.on("message", (message: string) =>
        this.handleMessage(nickname, message)
      );
      ws.on("close", () => this.utils.deleteClient(nickname));
    });
  }

  private async handleMessage(nickname: string, message: string) {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case EOperationNotificationType.NEW_DUEL: {
          const { receiver, rate } = data.data;
          this.utils.createDuel(nickname, receiver, rate);
          break;
        }
        case EOperationNotificationType.RESPOND_DUEL: {
          const { id, status } = data;
          this.utils.respondDuel(id, status);
          break;
        }
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  }
}
