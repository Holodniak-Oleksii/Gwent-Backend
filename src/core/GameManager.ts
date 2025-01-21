import { Game } from "@/core/Game";
import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { getRandomElements } from "@/core/common/utils";
import { ICard, IGamesMessageRequest } from "@/types/entities";
import { EGameResponseMessageType } from "@/types/enums";

export class GameManager {
  private setPlayerCards(game: Game, cards: ICard[], nickname: string) {
    game.players[nickname].deck = cards;
    const playingCards = getRandomElements(cards, 10);
    game.players[nickname].playingCards = playingCards;

    const playerKeys = Object.keys(game.players);
    const otherPlayers = playerKeys.filter((p) => p !== nickname);

    game.players[nickname].ws.send(GAME_REQUEST_MESSAGE.PREPARATION_COMPLETED);

    otherPlayers.forEach((p) => {
      game.players[p].ws.send(GAME_REQUEST_MESSAGE.PARTNER_SET_DECK);
    });

    if (playerKeys.every((p) => !!game.players[p].playingCards.length)) {
      playerKeys.forEach((p) => {
        game.players[p].ws.send(GAME_REQUEST_MESSAGE.GAME_START);
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
