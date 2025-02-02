import { Game } from "@/core/Game";
import { GameUtils } from "@/core/GameUtils";
import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { EGameResponseMessageType } from "@/core/types/enums";
import { ICard, IGamesMessageRequest } from "@/types/entities";

export class GameManager {
  public utils: GameUtils = new GameUtils();

  private setPlayerCards(game: Game, nickname: string, cards: ICard[]) {
    game.players[nickname].deck = cards;
    const playingCards = this.utils.getRandomElements(cards, 10);
    game.players[nickname].playingCards = playingCards;
    const playerKeys = Object.keys(game.players);

    game.sendMessage(nickname, GAME_REQUEST_MESSAGE.PREPARATION_COMPLETED);
    game.sendMessageEnemy(nickname, GAME_REQUEST_MESSAGE.PARTNER_SET_DECK);

    if (playerKeys.every((p) => !!game.players[p].playingCards.length)) {
      game.order = this.utils.tossCoin(game.players);

      playerKeys.forEach((p) => {
        game.players[game.players[p].enemy.nickname].enemy.cardsCount = 10;
        game.sendMessage(p, GAME_REQUEST_MESSAGE.GAME_START);
        game.sendUpdate(p);
      });
    }
  }

  private applyCards(game: Game, nickname: string, card: ICard) {
    const playingCards = game.players[nickname].playingCards.filter(
      (c) => c.id !== card.id
    );
    game.players[nickname].playingCards = playingCards;
    game.players[game.players[nickname].enemy.nickname].enemy.cardsCount =
      playingCards.length;

    game.boardCards.push({
      card,
      ownerNickname: nickname,
      position: card.forces,
    });

    if (playingCards.length) {
      game.sendUpdateAll();
    } else {
      this.playerPass(game, nickname);
    }
  }

  private playersCardsCheck(game: Game, nickname: string) {
    if (!game.players[nickname].enemy.pass) {
      game.order = game.players[nickname].enemy.nickname;
    }
  }

  private playerPass(game: Game, nickname: string) {
    game.players[nickname].pass = true;
    game.players[game.players[nickname].enemy.nickname].enemy.pass = true;
    if (
      game.players[nickname].pass &&
      game.players[game.players[nickname].enemy.nickname].pass
    ) {
      game.endRound();
      Object.keys(game.players).forEach((key) => {
        game.players[key].pass = false;
        game.players[game.players[key].enemy.nickname].enemy.pass = false;
      });
    }
    game.sendUpdateAll();
  }

  public async manage(
    event: IGamesMessageRequest,
    nickname: string,
    game: Game
  ) {
    this.playersCardsCheck(game, nickname);
    switch (event.type) {
      case EGameResponseMessageType.UPDATE_CARDS: {
        this.setPlayerCards(game, nickname, event.data.cards);
        break;
      }
      case EGameResponseMessageType.APPLY_CARD: {
        this.applyCards(game, nickname, event.data.card);
        break;
      }
      case EGameResponseMessageType.PLAYER_PASS: {
        this.playerPass(game, nickname);
        break;
      }
    }
    await game.update();
  }
}
