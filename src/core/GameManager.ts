import { Game } from "@/core/Game";
import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { getRandomElements } from "@/core/common/utils";
import { EGameResponseMessageType } from "@/core/types/enums";
import { ICard, IGamesMessageRequest } from "@/types/entities";

export class GameManager {
  private async setPlayerCards(game: Game, nickname: string, cards: ICard[]) {
    game.players[nickname].deck = cards;
    const playingCards = getRandomElements(cards, 10);
    game.players[nickname].playingCards = playingCards;

    await game.setGame({
      players: {
        ...game.players,
        [nickname]: {
          ...game.players[nickname],
          deck: cards,
          playingCards,
        },
      },
    });

    const playerKeys = Object.keys(game.players);
    const otherPlayers = playerKeys.filter((p) => p !== nickname);

    game.connection[nickname].ws?.send(
      GAME_REQUEST_MESSAGE.PREPARATION_COMPLETED
    );

    otherPlayers.forEach((p) => {
      game.connection[p].ws?.send(GAME_REQUEST_MESSAGE.PARTNER_SET_DECK);
    });

    if (playerKeys.every((p) => !!game.players[p].playingCards.length)) {
      playerKeys.forEach((p) => {
        game.connection[p].ws?.send(GAME_REQUEST_MESSAGE.GAME_START);
        game.sendEnemy(p);
        game.sendUpdate(p);
      });
    }
  }

  private async applyCards(game: Game, nickname: string, card: ICard) {
    game.players[nickname].playingCards = game.players[
      nickname
    ].playingCards.filter((c) => c.id !== card.id);

    game.boardCards.push({
      card,
      ownerNickname: nickname,
      position: card.forces,
    });

    game.sendUpdateAll();
  }

  public manage(event: IGamesMessageRequest, nickname: string, game: Game) {
    switch (event.type) {
      case EGameResponseMessageType.UPDATE_CARDS: {
        this.setPlayerCards(game, nickname, event.data.cards);
        break;
      }
      case EGameResponseMessageType.APPLY_CARD: {
        this.applyCards(game, nickname, event.data.card);
        break;
      }
    }
  }
}
