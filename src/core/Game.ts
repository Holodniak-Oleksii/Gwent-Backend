import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { GameManager } from "@/core/GameManager";
import { Player } from "@/core/Player";
import { EGameErrors } from "@/core/types/enums";
import { IGamesMessageRequest } from "@/types/entities";
import { WebSocket } from "ws";
import { Arena } from "./Arena";

export class Game {
  public rate: number = 0;
  public players: Record<string, Player> = {};
  public arena: Arena | null = null;
  public id: string;
  private manager = new GameManager();

  constructor(id: string, rate: number) {
    this.id = id;
    this.rate = rate;
  }

  public addPlayer(nickname: string, ws: WebSocket) {
    const playerCount = Object.keys(this.players).length;

    if (playerCount <= 2) {
      this.players[nickname] = new Player(nickname, ws);
      const playerKeys = Object.keys(this.players);
      const message =
        playerKeys.length === 2
          ? GAME_REQUEST_MESSAGE.PREPARATION
          : GAME_REQUEST_MESSAGE.WAIT_PARTNER;

      playerKeys.forEach((p) => {
        this.players[p].ws.send(message);
      });
    } else {
      throw new Error(EGameErrors.TOO_MANY_PLAYER);
    }
  }

  public removePlayer(nickname: string) {
    delete this.players[nickname];
    console.log(`Player ${nickname} disconnected from game ${this.id}.`);

    Object.keys(this.players).forEach((p) => {
      this.players[p].ws.send(GAME_REQUEST_MESSAGE.PARTNER_LEFT);
    });
  }

  public update() {}

  public start() {
    // this.arena = new Arena(this.players);
  }

  public actionManage(event: IGamesMessageRequest, nickname: string) {
    this.manager.manage(event, nickname, this);
  }
}
