import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { Manager } from "@/core/Manager";
import { IBoardCard, IConnection, IPlayer } from "@/core/types";
import { EGameErrors, EGameMessageType } from "@/core/types/enums";
import DuelEntity from "@/entities/Duel.entity";
import UserEntity from "@/entities/User.entity";
import { IEffect, IGamesMessageRequest, IRound } from "@/types/entities";
import { WebSocket } from "ws";

export class Game {
  public rate: number = 0;
  public players: Record<string, IPlayer> = {};
  public connection: Record<string, IConnection> = {};
  public boardCards: IBoardCard[] = [];
  public rounds: IRound[] = [];
  public effects: IEffect[] = [];
  public id: string;
  public order: string = "";
  public winner: string | null = null;
  private manager = new Manager();

  constructor(
    id: string,
    rate: number,
    plyers: Record<string, IPlayer>,
    boardCards: IBoardCard[],
    order: string,
    rounds: IRound[],
    winner: string | null,
    effects: IEffect[]
  ) {
    this.id = id;
    this.rate = rate;
    this.players = plyers;
    this.boardCards = boardCards;
    this.rounds = rounds;
    this.order = order;
    this.winner = winner || null;
    this.effects = effects || [];
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

    if (this.winner) {
      this.sendMessage(nickname, GAME_REQUEST_MESSAGE.GAME_END(this.winner));
      return;
    }

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

    if (!this.winner) {
      Object.keys(this.connection).forEach((p) => {
        this.sendMessage(p, GAME_REQUEST_MESSAGE.PARTNER_LEFT);
      });
    }
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
        rounds: this.rounds,
        winner: this.winner,
        effects: this.effects,
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
          discards: this.players[nickname].discards,
          boardCards: this.boardCards,
          order: this.order,
          enemy: this.players[nickname].enemy,
          rounds: this.rounds,
          effects: this.effects,
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
            discards: this.players[c].discards,
            boardCards: this.boardCards,
            order: this.order,
            enemy: this.players[c].enemy,
            rounds: this.rounds,
            effects: this.effects,
          },
        })
      );
    });
  }

  private async resolveGame(winner: string) {
    const [p1, p2] = Object.keys(this.players);
    const [u1, u2] = await Promise.all([
      UserEntity.findOne({ nickname: p1 }),
      UserEntity.findOne({ nickname: p2 }),
    ]);

    if (winner === "draw") {
      if (u1)
        await UserEntity.findOneAndUpdate(
          { nickname: p1 },
          { draws: u1.draws + 1 }
        );
      if (u2)
        await UserEntity.findOneAndUpdate(
          { nickname: p2 },
          { draws: u2.draws + 1 }
        );
      return;
    }

    const loser = this.players[winner].enemy.nickname;
    const [uw, ul] = await Promise.all([
      UserEntity.findOne({ nickname: winner }),
      UserEntity.findOne({ nickname: loser }),
    ]);

    if (uw)
      await UserEntity.findOneAndUpdate(
        { nickname: winner },
        {
          coins: uw.coins + this.rate,
          wins: uw.wins + 1,
        }
      );

    if (ul)
      await UserEntity.findOneAndUpdate(
        { nickname: loser },
        {
          coins: Math.max(0, ul.coins - this.rate),
          losses: (ul.losses || 0) + 1,
        }
      );
  }

  public endRound() {
    this.effects = [];
    const roundResult: IRound = {
      winner: "",
      score: {},
    };

    const playerKeys = Object.keys(this.players);
    playerKeys.forEach((name) => {
      roundResult.score[name] = 0;
      this.boardCards.forEach((card) => {
        if (card.ownerNickname === name) {
          roundResult.score[name] += card.card.power;
        }
      });

      if (this.players[name].promisedCards) {
        const promisedCards = this.manager.utils.getRandomElements(
          this.players[name].deck,
          this.players[name].promisedCards
        );

        this.players[name].playingCards =
          this.players[name].playingCards.concat(promisedCards);
        this.players[name].promisedCards = 0;
      }
    });

    if (playerKeys.length === 2) {
      const [player1, player2] = playerKeys;
      if (roundResult.score[player1] > roundResult.score[player2]) {
        roundResult.winner = player1;
      } else if (roundResult.score[player1] < roundResult.score[player2]) {
        roundResult.winner = player2;
      } else {
        roundResult.winner = "draw";
      }
    }

    this.rounds.push(roundResult);
    const winner = this.checkEndingGame();
    if (winner) {
      this.winner = winner;
      this.sendUpdateAll();
      this.update();
      this.resolveGame(winner).then(() => {
        Object.keys(this.players).forEach((p) => {
          this.sendMessage(p, GAME_REQUEST_MESSAGE.GAME_END(winner));
        });
      });
    } else {
      this.boardCards.forEach((c) => {
        this.players[c.ownerNickname]?.discards.push(c.card);
      });
      this.boardCards = [];
      this.update();
      this.sendUpdateAll();
    }
  }

  private checkEndingGame() {
    if (!this.rounds || this.rounds.length === 0) return null;

    const winners = this.rounds.map((round) => round.winner);
    const uniqueWinners = [...new Set(winners.filter((w) => w !== "draw"))];

    for (const winner of uniqueWinners) {
      if (winners.filter((w) => w === winner).length >= 2) {
        return winner;
      }
    }

    if (this.rounds.length === 2 && winners.includes("draw")) {
      return uniqueWinners.length === 1 ? uniqueWinners[0] : "draw";
    }

    if (this.rounds.length === 3 && uniqueWinners.length === 2) {
      return "draw";
    }

    return null;
  }

  public actionManage(event: IGamesMessageRequest, nickname: string) {
    this.manager.manage(event, nickname, this);
  }
}
