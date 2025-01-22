import { Game } from "@/core/Game";
import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { getRandomElements } from "@/core/common/utils";
import { EGameMessageType, EGameResponseMessageType } from "@/core/types/enums";
import { ICard, IGamesMessageRequest } from "@/types/entities";

export class GameManager {
  private async setPlayerCards(game: Game, cards: ICard[], nickname: string) {
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

    game.players[nickname].ws?.send(GAME_REQUEST_MESSAGE.PREPARATION_COMPLETED);

    otherPlayers.forEach((p) => {
      game.players[p]?.ws?.send(GAME_REQUEST_MESSAGE.PARTNER_SET_DECK);
    });

    if (playerKeys.every((p) => !!game.players[p].playingCards.length)) {
      playerKeys.forEach((p) => {
        game.players[p].ws?.send(GAME_REQUEST_MESSAGE.GAME_START);
        game.players[p].ws?.send(
          JSON.stringify({
            type: EGameMessageType.GET_CARDS,
            data: {
              desk: game.players[p].deck,
              playingCards: game.players[p].playingCards,
            },
          })
        );
      });
    }
  }

  public manage(event: IGamesMessageRequest, nickname: string, game: Game) {
    switch (event.type) {
      case EGameResponseMessageType.UPDATE_CARDS: {
        this.setPlayerCards(game, event.data.cards, nickname);
      }
    }
  }
}
