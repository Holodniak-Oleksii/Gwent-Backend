import { Game } from "@/core/Game";
import { IBoardCard } from "@/core/types";
import { ICard, IEffect } from "@/types/entities";
import { ECardAbilities, EForces, EType } from "@/types/enums";
import { ESpecialFiled } from "./types/enums";

const { SAVED_POWER, IS_WEATHER, IS_MOTIVATE } = ESpecialFiled;
export class Ability {
  private game: Game = {} as Game;
  private cards: IBoardCard[] = [];
  private effects: IEffect[] = [];

  constructor(game: Game) {
    this.game = game;
    this.cards = game.boardCards;
    this.effects = game.effects;
  }

  // ---------- WEATHER ---------

  private devalueCard(cards: IBoardCard[], row: EForces): IBoardCard[] {
    return cards.map((c) => {
      const updateAble =
        c.card.forces === row &&
        c.card.type !== EType.WEATHER &&
        c.card.power !== 0 &&
        !c[IS_WEATHER];

      return {
        ...c,
        ...(updateAble
          ? {
              [SAVED_POWER]: c[SAVED_POWER] || c.card.power,
              [IS_WEATHER]: true,
            }
          : {}),
        card: {
          ...c.card,
          power: updateAble ? (c[IS_MOTIVATE] ? 2 : 1) : c.card.power,
        },
      };
    });
  }

  private returnCardsValues(cards: IBoardCard[]): IBoardCard[] {
    return cards.map((c) => ({
      ownerNickname: c.ownerNickname,
      position: c.position,
      ...(c[SAVED_POWER] ? { [SAVED_POWER]: c[SAVED_POWER] } : {}),
      card: {
        ...c.card,
        power: c[SAVED_POWER] || c.card.power,
      },
    }));
  }

  private applyWeather(row: EForces, ability: ECardAbilities) {
    const cards = this.cards;

    if (ability !== ECardAbilities.CLEAR_WEATHER) {
      this.cards = this.devalueCard(cards, row);
    } else {
      if (this.effects.length) {
        this.cards = this.returnCardsValues(cards);
        this.effects = this.effects.filter((e) => e.type !== EType.WEATHER);
        this.apply();
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
    this.cards = cards.filter(
      (card) =>
        card.card.power !== maxPower &&
        card.card.ability !== ECardAbilities.SCORCH
    );
    this.effects = this.effects.filter(
      (e) => e.ability !== ECardAbilities.SCORCH
    );
  }

  private motivateForces(row: EForces, owners: string[]) {
    this.cards = this.cards.map((c) => {
      const motivateAble =
        c.position === row &&
        owners.includes(c.ownerNickname) &&
        !c[IS_MOTIVATE];

      return {
        ...c,
        ...(motivateAble
          ? {
              [SAVED_POWER]: c[SAVED_POWER] ?? c.card.power,
              [IS_MOTIVATE]: true,
            }
          : {}),
        card: {
          ...c.card,
          power: motivateAble ? c.card.power * 2 : c.card.power,
        },
      };
    });
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

  public addEffect(card: ICard, nickname: string) {
    if (card.ability) {
      this.effects.push({
        ability: card.ability,
        row: card.forces,
        type: card.type,
        applyTo:
          card.type === EType.WEATHER
            ? Object.keys(this.game.players)
            : [nickname],
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
