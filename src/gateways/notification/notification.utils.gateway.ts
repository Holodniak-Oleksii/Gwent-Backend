import DuelEntity from "@/entities/Duel.entity";
import NotificationEntity from "@/entities/Notification.entity";
import UserEntity from "@/entities/User.entity";
import { EOperationNotificationType, EStatusNotification } from "@/types/enums";
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

  public async sendRefillMessage(nickname: string, balance: number) {
    const duelData = JSON.stringify({
      type: EOperationNotificationType.REFILL_BALANCE,
      data: { balance },
    });

    if (this.clients[nickname]) {
      this.clients[nickname].send(duelData);
    }
  }

  public async createDuel(nickname: string, receiver: string, rate: number) {
    const duel = await NotificationEntity.create({
      sender: nickname,
      status: EStatusNotification.PENDING,
      createdAt: new Date(),
      receiver,
      rate,
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

  public async respondDuel(_id: string, status: EStatusNotification) {
    const notification = await NotificationEntity.findByIdAndUpdate(_id, {
      status,
    });

    const duelData = JSON.stringify({
      type: EOperationNotificationType.RESPOND_DUEL,
      data: {
        _id,
        status,
        rate: notification?.rate,
        sender: notification?.sender,
        receiver: notification?.receiver,
        createAt: notification?.createdAt,
      },
    });

    if (notification && this.clients[notification.sender]) {
      this.clients[notification.sender].send(duelData);
    }
    if (notification && this.clients[notification.receiver]) {
      this.clients[notification.receiver].send(duelData);
    }

    if (
      status === EStatusNotification.ACCEPTED &&
      notification &&
      this.clients[notification.sender] &&
      this.clients[notification.receiver]
    ) {
      const sender = await UserEntity.findOne({
        nickname: notification.sender,
      });
      const receiver = await UserEntity.findOne({
        nickname: notification.receiver,
      });
      if (receiver && sender) {
        await DuelEntity.create({
          _id,
          rate: notification.rate,
          boardCards: [],
          order: "",
          rounds: [],
          players: {
            [sender.nickname]: {
              avatar: sender.avatar,
              nickname: sender.nickname,
              playingCards: [],
              deck: [],
              promisedCards: 0,
              discards: [],
              enemy: {
                nickname: receiver.nickname,
                avatar: receiver.avatar,
              },
            },
            [receiver.nickname]: {
              avatar: receiver.avatar,
              nickname: receiver.nickname,
              playingCards: [],
              deck: [],
              promisedCards: 0,
              discards: [],
              enemy: {
                nickname: sender.nickname,
                avatar: sender.avatar,
              },
            },
          },
          arena: null,
          createdAt: new Date(),
        });
      }
    }
  }

  public async deleteClient(nickname: string) {
    console.log(`User disconnected: ${nickname}`);
    delete this.clients[nickname];
  }
}
