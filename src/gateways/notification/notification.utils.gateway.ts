import DuelEntity from "@/entities/Duel.entity";
import NotificationEntity from "@/entities/Notification.entity";
import UserEntity from "@/entities/User.entity";
import { EOperationNotificationType, EStatusNotification } from "@/types/enums";
import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";

interface IConnectedClients {
  [nickname: string]: WebSocket;
}

export default class WebSocketNotificationUtils {
  public clients: IConnectedClients = {};

  public async sendStoredDuels(nickname: string, ws: WebSocket) {
    const notifications = await NotificationEntity.find({
      $or: [{ receiver: nickname }, { sender: nickname }],
    }).sort({ createdAt: -1 });

    ws.send(
      JSON.stringify({
        type: EOperationNotificationType.STORED_DUELS,
        data: notifications,
      })
    );
  }

  public async createDuel(nickname: string, receiver: string) {
    const duel = await NotificationEntity.create({
      id: uuidv4(),
      sender: nickname,
      status: EStatusNotification.PENDING,
      createdAt: new Date(),
      receiver,
    });

    const duelData = JSON.stringify({
      type: EOperationNotificationType.NEW_DUEL,
      data: duel,
    });

    if (this.clients[nickname]) {
      this.clients[nickname].send(duelData);
    }

    if (this.clients[receiver]) {
      this.clients[receiver].send(duelData);
    }
  }

  public async respondDuel(id: string, status: EStatusNotification) {
    console.log("id :", id);
    const duel = await NotificationEntity.findOneAndUpdate({ id }, { status });
    console.log("duel :", duel);

    const duelData = JSON.stringify({
      type: EOperationNotificationType.RESPOND_DUEL,
      data: {
        id,
        status,
        sender: duel?.sender,
        receiver: duel?.receiver,
        createAt: duel?.createdAt,
      },
    });

    if (duel && this.clients[duel.sender]) {
      this.clients[duel.sender].send(duelData);
    }
    if (duel && this.clients[duel.receiver]) {
      this.clients[duel.receiver].send(duelData);
    }

    if (
      status === EStatusNotification.ACCEPTED &&
      duel &&
      this.clients[duel.sender] &&
      this.clients[duel.receiver]
    ) {
      const sender = await UserEntity.findOne({ nickname: duel.sender });
      const receiver = await UserEntity.findOne({ nickname: duel.receiver });

      await DuelEntity.create({
        id,
        players: [sender, receiver].map((p) => ({
          nickname: p?.nickname,
          avatar: p?.avatar || null,
          score: 0,
          cards: [],
        })),
        arena: null,
        createdAt: new Date(),
      });
    }
  }

  public async deleteClient(nickname: string) {
    console.log(`User disconnected: ${nickname}`);
    delete this.clients[nickname];
  }
}
