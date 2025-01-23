import { ICard } from "@/types/entities";
import { WebSocket } from "ws";

export interface IPlayer {
  nickname: string;
  avatar: string | null;
  deck: ICard[];
  playingCards: ICard[];
}

export interface IConnection {
  online: boolean;
  ws: WebSocket;
}
