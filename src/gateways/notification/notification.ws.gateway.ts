import NotificationEntity from "@/entities/Notification.entity";
import { EOperationNotificationType } from "@/types/enums";
import { v4 as uuidv4 } from "uuid";
import WebSocket, { Server } from "ws";

interface IConnectedClients {
  [nickname: string]: WebSocket;
}

export default class WebSocketNotificationManager {
  private wss: Server;
  private clients: IConnectedClients = {};

  constructor(server: any) {
    this.wss = new Server({ server });
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
      this.clients[nickname] = ws;

      this.sendStoredDuels(nickname, ws);

      ws.on("message", (message: string) =>
        this.handleMessage(nickname, message)
      );
      ws.on("close", () => this.handleDisconnect(nickname));
    });
  }

  private async sendStoredDuels(nickname: string, ws: WebSocket) {
    const notifications = await NotificationEntity.find({ receiver: nickname });
    ws.send(
      JSON.stringify({
        type: EOperationNotificationType.STORED_DUELS,
        data: notifications,
      })
    );
  }

  private async handleMessage(nickname: string, message: string) {
    try {
      const data = JSON.parse(message);

      if (data.type === EOperationNotificationType.SENT_DUEL) {
        const { receiver } = data;
        const duel = await NotificationEntity.create({
          id: uuidv4(),
          sender: nickname,
          receiver,
        });

        if (this.clients[receiver]) {
          this.clients[receiver].send(
            JSON.stringify({
              type: EOperationNotificationType.NEW_DUEL,
              data: duel,
            })
          );
        }
      } else if (data.type === EOperationNotificationType.RESPOND_DUEL) {
        const { duelId, status } = data;
        const duel = await NotificationEntity.findByIdAndUpdate(
          duelId,
          { status },
          { new: true }
        );

        if (duel && this.clients[duel.sender]) {
          this.clients[duel.sender].send(
            JSON.stringify({
              type: EOperationNotificationType.DUEL_RESPONSE,
              data: { duelId, status },
            })
          );
        }
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  }

  private handleDisconnect(nickname: string) {
    console.log(`User disconnected: ${nickname}`);
    delete this.clients[nickname];
  }
}
