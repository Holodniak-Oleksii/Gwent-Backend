import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { GameManager } from "@/core/GameManager";
import { IBoardCard, IConnection, IPlayer } from "@/core/types";
import { EGameErrors, EGameMessageType } from "@/core/types/enums";
import DuelEntity from "@/entities/Duel.entity";
import { IGamesMessageRequest } from "@/types/entities";
import { WebSocket } from "ws";
import { Arena } from "./Arena";

export class Game {
  public rate: number = 0;
  public players: Record<string, IPlayer> = {};
  public connection: Record<string, IConnection> = {};
  public boardCards: IBoardCard[] = [];
  public arena: Arena | null = null;
  public id: string;
  private manager = new GameManager();

  constructor(
    id: string,
    rate: number,
    plyers: Record<string, IPlayer>,
    boardCards: IBoardCard[]
  ) {
    this.id = id;
    this.rate = rate;
    this.players = plyers;
    this.boardCards = boardCards;
  }

  public addPlayer(nickname: string, ws: WebSocket) {
    if (!this.players[nickname]) {
      throw new Error(EGameErrors.ALIEN_PLAYER);
    }

    if (Object.keys(this.connection).length > 2) {
      throw new Error(EGameErrors.TOO_MANY_PLAYER);
    }
    this.connection = {
      ...this.connection,
      [nickname]: {
        ws,
        online: true,
      },
    };

    const connectionNickname = Object.keys(this.connection);
    const allReady = Object.keys(this.players).every(
      (p) => !!this.players[p].playingCards.length && this.connection[p]?.online
    );
    connectionNickname.forEach((p) => {
      if (allReady) {
        this.connection[p].ws?.send(GAME_REQUEST_MESSAGE.GAME_START);
        this.sendEnemy(nickname);
        this.sendUpdate(nickname);
      } else {
        this.connection[p].ws?.send(
          this.players[p].playingCards.length
            ? GAME_REQUEST_MESSAGE.WAIT_PARTNER
            : GAME_REQUEST_MESSAGE.PREPARATION
        );
      }
    });
  }

  public removePlayer(nickname: string) {
    this.connection[nickname].online = false;
    console.log(`Player ${nickname} disconnected from game ${this.id}.`);

    Object.keys(this.connection).forEach((p) => {
      this.connection[p].ws?.send(GAME_REQUEST_MESSAGE.PARTNER_LEFT);
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

  public sendUpdate(nickname: string) {
    this.connection[nickname].ws?.send(
      JSON.stringify({
        type: EGameMessageType.UPDATE,
        data: {
          desk: this.players[nickname].deck,
          playingCards: this.players[nickname].playingCards,
          boardCards: this.boardCards,
        },
      })
    );
  }

  public sendEnemy(nickname: string) {
    const enemy = Object.keys(this.players).find((e) => e !== nickname);
    if (enemy) {
      this.connection[nickname].ws?.send(
        JSON.stringify({
          type: EGameMessageType.ENEMY,
          data: {
            nickname: this.players[enemy].nickname,
            avatar: this.players[enemy].avatar,
          },
        })
      );
    }
  }

  public actionManage(event: IGamesMessageRequest, nickname: string) {
    this.manager.manage(event, nickname, this);
  }
}
