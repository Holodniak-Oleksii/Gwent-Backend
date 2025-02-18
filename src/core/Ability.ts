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
      game.effects.push(this.card.forces);
      game.boardCards = this.utils.devalueCard(cards, this.card.forces);
    } else {
      if (game.effects.length) {
        game.boardCards = this.utils.returnCardsValues(cards);
        game.effects = [];
      }
    }
  }

  private applySpecialAbility(game: Game) {
    if (this.card.ability === ECardAbilities.SCORCH) {
      const cards = game.boardCards;
      const maxPower = cards.reduce(
        (max, card) => Math.max(max, card.card.power),
        -Infinity
      );
      game.boardCards = cards.filter((card) => card.card.power !== maxPower);
    }
  }

  public apply(game: Game) {
    if (this.card.type === EType.WEATHER) {
      this.applyWeather(game);
    }
    if (this.card.type === EType.SPECIAL) {
      this.applySpecialAbility(game);
    }
  }
}
