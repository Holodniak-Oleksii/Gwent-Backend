import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { GameManager } from "@/core/GameManager";
import { IBoardCard, IConnection, IPlayer } from "@/core/types";
import { EGameErrors, EGameMessageType } from "@/core/types/enums";
import DuelEntity from "@/entities/Duel.entity";
import { IGamesMessageRequest } from "@/types/entities";
import { WebSocket } from "ws";

export class Game {
  public rate: number = 0;
  public players: Record<string, IPlayer> = {};
  public connection: Record<string, IConnection> = {};
  public boardCards: IBoardCard[] = [];
  public id: string;
  public order: string = "";
  private manager = new GameManager();

  constructor(
    id: string,
    rate: number,
    plyers: Record<string, IPlayer>,
    boardCards: IBoardCard[],
    order: string
  ) {
    this.id = id;
    this.rate = rate;
    this.players = plyers;
    this.boardCards = boardCards;
    this.order = order;
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
        this.sendMessage(p, GAME_REQUEST_MESSAGE.GAME_START);
        this.sendUpdate(p);
      } else {
        this.sendMessage(
          p,
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
      this.sendMessage(p, GAME_REQUEST_MESSAGE.PARTNER_LEFT);
    });
  }

  public async setGame(data: any) {
    await DuelEntity.findOneAndUpdate({ id: this.id }, data);
  }

  public async update() {
    await DuelEntity.findOneAndUpdate(
      { id: this.id },
      {
        players: this.players,
        boardCards: this.boardCards,
        order: this.order,
      }
    );
  }

  public sendMessage(nickname: string, data: any) {
    if (this.connection[nickname]) {
      if (typeof data === "string") {
        this.connection[nickname].ws?.send(data);
      } else {
        this.connection[nickname].ws?.send(JSON.stringify(data));
      }
    }
  }

  public sendMessageEnemy(nickname: string, data: any) {
    if (this.connection[this.players[nickname].enemy.nickname]) {
      if (typeof data === "string") {
        this.connection[this.players[nickname].enemy.nickname].ws?.send(data);
      } else {
        this.connection[this.players[nickname].enemy.nickname].ws?.send(
          JSON.stringify(data)
        );
      }
    }
  }

  public sendUpdate(nickname: string) {
    this.connection[nickname].ws?.send(
      JSON.stringify({
        type: EGameMessageType.UPDATE,
        data: {
          desk: this.players[nickname].deck,
          playingCards: this.players[nickname].playingCards,
          boardCards: this.boardCards,
          order: this.order,
          enemy: this.players[nickname].enemy,
        },
      })
    );
  }

  public sendUpdateAll() {
    Object.keys(this.connection).forEach((c) => {
      this.connection[c].ws?.send(
        JSON.stringify({
          type: EGameMessageType.UPDATE,
          data: {
            desk: this.players[c].deck,
            playingCards: this.players[c].playingCards,
            boardCards: this.boardCards,
            order: this.order,
            enemy: this.players[c].enemy,
          },
        })
      );
    });
  }

  public actionManage(event: IGamesMessageRequest, nickname: string) {
    this.manager.manage(event, nickname, this);
  }
}
