import { ICard } from "@/types/entities";
import { WebSocket } from "ws";

export class Player {
  public nickname: string = "";
  public avatar: string | null = null;
  public deck: ICard[] = [];
  public playingCards: ICard[] = [];
  public score: number = 0;
  public ws: WebSocket = {} as WebSocket;

  constructor(nickname: string, ws: WebSocket) {
    this.nickname = nickname;
    this.ws = ws;
  }
}
