import { Ability } from "@/core/Ability";
import { Game } from "@/core/Game";
import { Utils } from "@/core/Utils";
import { GAME_REQUEST_MESSAGE } from "@/core/common/constants";
import { EGameResponseMessageType } from "@/core/types/enums";
import { ICard, IGamesMessageRequest } from "@/types/entities";

export class Manager {
  public utils: Utils = new Utils();

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

    const boardCard = {
      card,
      ownerNickname: nickname,
      position: card.forces,
    };

    game.boardCards.push(boardCard);

    const ability = new Ability(game, game.players);
    ability.addEffect(boardCard);
    const { cards, effects, players } = ability.apply();
    game.boardCards = cards;
    game.effects = effects;
    game.players = players;

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
        await this.applyCards(game, nickname, event.data.card);
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
