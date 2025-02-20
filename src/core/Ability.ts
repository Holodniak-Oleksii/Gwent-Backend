import { Game } from "@/core/Game";
import { Utils } from "@/core/Utils";
import { ICard } from "@/types/entities";
import { ECardAbilities, EType } from "@/types/enums";

interface ICardWithAbility extends Omit<ICard, "ability"> {
  ability: ECardAbilities;
}

export class Ability {
  private card: ICardWithAbility = {} as ICardWithAbility;
  private utils: Utils = new Utils();
  constructor(card: ICard) {
    this.card = card as ICardWithAbility;
  }

  private applyWeather(game: Game) {
    const cards = game.boardCards;
    if (this.card.ability !== ECardAbilities.CLEAR_WEATHER) {
      game.effects.push({
        ability: this.card.ability,
        type: this.card.type,
        applyTo: Object.keys(game.players),
        row: this.card.forces,
      });
      game.boardCards = this.utils.devalueCard(cards, this.card.forces);
    } else {
      if (game.effects.length) {
        game.boardCards = this.utils.returnCardsValues(cards);
        game.effects = [];
      }
    }
  }

  private applySpecialAbility(game: Game, nickname: string) {
    const cards = game.boardCards;
    if (this.card.ability === ECardAbilities.SCORCH) {
      const maxPower = cards.reduce(
        (max, card) => Math.max(max, card.card.power),
        -Infinity
      );
      game.boardCards = cards.filter((card) => card.card.power !== maxPower);
    }
    if (this.card.ability === ECardAbilities.HORN) {
      game.effects.push({
        ability: ECardAbilities.HORN,
        type: EType.SPECIAL,
        applyTo: [nickname],
        row: this.card.forces,
      });
      game.boardCards = cards.map((c) => ({
        ...c,
        card: {
          ...c.card,
          power:
            c.position === this.card.forces && c.ownerNickname === nickname
              ? c.card.power * 2
              : c.card.power,
        },
      }));
    }
  }

  public apply(game: Game, nickname: string) {
    if (this.card.type === EType.WEATHER) {
      this.applyWeather(game);
    }
    if (this.card.type === EType.SPECIAL) {
      this.applySpecialAbility(game, nickname);
    }
  }
}
