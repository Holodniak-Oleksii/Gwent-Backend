import { Game } from "@/core/Game";
import { IBoardCard } from "@/core/types";
import { ICard, IEffect } from "@/types/entities";
import { ECardAbilities, EForces, EType } from "@/types/enums";

export class Ability {
  private game: Game = {} as Game;
  private cards: IBoardCard[] = [];
  private effects: IEffect[] = [];
  private nickname: string = "";

  constructor(game: Game, nickname: string) {
    this.game = game;
    this.cards = game.boardCards;
    this.effects = game.effects;
    this.nickname = nickname;
  }

  // ---------- WEATHER ---------

  private devalueCard(cards: IBoardCard[], row: EForces): IBoardCard[] {
    return cards.map((c) => {
      const updateAble = c.card.forces === row && c.card.type !== EType.WEATHER;

      return {
        ...c,
        ...(updateAble ? { oldPower: c.oldPower || c.card.power } : {}),
        card: {
          ...c.card,
          power: updateAble ? 1 : c.card.power,
        },
      };
    });
  }

  private returnCardsValues(cards: IBoardCard[]): IBoardCard[] {
    return cards.map((c) => ({
      ownerNickname: c.ownerNickname,
      position: c.position,
      card: { ...c.card, power: c.oldPower || c.card.power },
    }));
  }

  private applyWeather(row: EForces, ability: ECardAbilities) {
    const cards = this.cards;

    if (ability !== ECardAbilities.CLEAR_WEATHER) {
      this.cards = this.devalueCard(cards, row);
    } else {
      if (this.effects.length) {
        this.cards = this.returnCardsValues(cards);
        this.effects = [];
      }
    }
  }

  // ---------- SPECIAL ---------

  private killBigPower() {
    const cards = this.cards;
    const maxPower = cards.reduce(
      (max, card) => Math.max(max, card.card.power),
      -Infinity
    );
    this.cards = cards.filter((card) => card.card.power !== maxPower);
  }

  private motivateForces(row: EForces, owners: string[]) {
    const cards = this.cards;

    this.cards = cards.map((c) => ({
      ...c,
      card: {
        ...c.card,
        power:
          c.position === row && owners.includes(c.ownerNickname)
            ? c.card.power * 2
            : c.card.power,
      },
    }));
  }

  private applySpecialAbility(
    row: EForces,
    ability: ECardAbilities,
    owners: string[]
  ) {
    if (ability === ECardAbilities.SCORCH) {
      this.killBigPower();
    }
    if (ability === ECardAbilities.HORN) {
      this.motivateForces(row, owners);
    }
  }

  public addEffect(card: ICard) {
    if (card.ability) {
      this.effects.push({
        ability: card.ability,
        row: card.forces,
        type: card.type,
        applyTo:
          card.type === EType.WEATHER
            ? Object.keys(this.game.players)
            : [this.nickname],
      });
    }
  }

  public apply() {
    this.effects.forEach((e) => {
      if (e.type === EType.WEATHER) {
        this.applyWeather(e.row, e.ability);
      }
      if (e.type === EType.SPECIAL) {
        this.applySpecialAbility(e.row, e.ability, e.applyTo);
      }
    });

    return { cards: this.cards, effects: this.effects };
  }
}
