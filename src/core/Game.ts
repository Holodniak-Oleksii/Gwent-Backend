import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { GameManager } from "@/core/GameManager";
import { IPlayer } from "@/core/types";
import { EGameErrors, EGameMessageType } from "@/core/types/enums";
import DuelEntity from "@/entities/Duel.entity";
import { IGamesMessageRequest } from "@/types/entities";
import { WebSocket } from "ws";
import { Arena } from "./Arena";

export class Game {
  public rate: number = 0;
  public players: Record<string, IPlayer> = {};
  public arena: Arena | null = null;
  public id: string;
  private manager = new GameManager();

  constructor(
    id: string,
    rate: number,
    plyers: Record<string, Omit<IPlayer, "ws">>
  ) {
    this.id = id;
    this.rate = rate;
    this.players = plyers;
  }

  public addPlayer(nickname: string, ws: WebSocket) {
    if (!this.players[nickname]) {
      throw new Error(EGameErrors.ALIEN_PLAYER);
    }

    this.players[nickname].online = true;
    this.players[nickname].ws = ws;

    const playersNickname = Object.keys(this.players);
    const allReady = playersNickname.every(
      (p) => !!this.players[p].playingCards.length
    );

    playersNickname.forEach((p) => {
      if (allReady) {
        this.players[p]?.ws?.send(GAME_REQUEST_MESSAGE.GAME_START);
        this.players[p]?.ws?.send(
          JSON.stringify({
            type: EGameMessageType.GET_CARDS,
            data: {
              desk: this.players[p].deck,
              playingCards: this.players[p].playingCards,
            },
          })
        );
      } else {
        this.players[p]?.ws?.send(
          this.players[p].playingCards.length
            ? GAME_REQUEST_MESSAGE.WAIT_PARTNER
            : GAME_REQUEST_MESSAGE.PREPARATION
        );
      }
    });
  }

  public removePlayer(nickname: string) {
    this.players[nickname].online = false;
    console.log(`Player ${nickname} disconnected from game ${this.id}.`);

    Object.keys(this.players).forEach((p) => {
      this.players[p]?.ws?.send(GAME_REQUEST_MESSAGE.PARTNER_LEFT);
    });
  }

  public async setGame(data: any) {
    await DuelEntity.findOneAndUpdate({ id: this.id }, data);
  }

  public async getGame() {
    return await DuelEntity.findOne({ id: this.id });
  }

  public start() {
    // this.arena = new Arena(this.players);
  }

  public actionManage(event: IGamesMessageRequest, nickname: string) {
    this.manager.manage(event, nickname, this);
  }
}
