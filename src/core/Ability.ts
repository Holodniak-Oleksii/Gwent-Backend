import { Game } from "@/core/Game";
import { IBoardCard, IPlayer } from "@/core/types";
import { IEffect } from "@/types/entities";
import { ECardAbilities, EForces, EType } from "@/types/enums";
import { ESpecialFiled } from "./types/enums";
const {
  CLEAR_WEATHER,
  BITING_FROST,
  HORN,
  SCORCH,
  TORRENTIAL_RAIN,
  IMPENETRABLE_FOG,
  SPY,
  MEDIC,
} = ECardAbilities;
const { SAVED_POWER, IS_WEATHER, IS_MOTIVATE, IS_SPY } = ESpecialFiled;
export class Ability {
  private game: Game = {} as Game;
  private players: Record<string, IPlayer> = {} as Record<string, IPlayer>;
  private cards: IBoardCard[] = [];
  private effects: IEffect[] = [];
  private allowedEffects: ECardAbilities[] = [
    CLEAR_WEATHER,
    BITING_FROST,
    HORN,
    SCORCH,
    TORRENTIAL_RAIN,
    IMPENETRABLE_FOG,
  ];

  constructor(game: Game, players: Record<string, IPlayer>) {
    this.game = game;
    this.cards = game.boardCards;
    this.effects = game.effects;
    this.players = players;
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

    if (ability !== CLEAR_WEATHER) {
      this.cards = this.devalueCard(cards, row);
    } else {
      if (this.effects.length) {
        this.cards = this.returnCardsValues(cards);
        this.effects = this.effects.filter((e) => e.type !== EType.WEATHER);
        this.game.showSunRays = true;
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

    const toDiscard = cards.filter((card) => card.card.power === maxPower);

    toDiscard.forEach((card) => {
      this.players[card.ownerNickname]?.discards.push(card.card);
    });

    this.cards = cards.filter(
      (card) => card.card.power !== maxPower && card.card.ability !== SCORCH
    );

    this.effects = this.effects.filter((effect) => effect.ability !== SCORCH);
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

  private spy(card: IBoardCard) {
    this.cards = this.cards.map((c) => {
      const spyAble = c.card._id === card.card._id && !c[IS_SPY];

      return {
        ...c,
        ...(spyAble ? { [IS_SPY]: true } : {}),
        ownerNickname: spyAble
          ? this.players[card.ownerNickname].enemy.nickname
          : c.ownerNickname,
      };
    });

    this.players[card.ownerNickname].promisedCards =
      this.players[card.ownerNickname].promisedCards + 1;
  }

  // ---------- APPLIES ---------

  private applySpecialAbility(
    row: EForces,
    ability: ECardAbilities,
    owners: string[]
  ) {
    if (ability === SCORCH) {
      this.killBigPower();
    }
    if (ability === HORN) {
      this.motivateForces(row, owners);
    }
  }

  private applyUnitAbility(card: IBoardCard) {
    if (card.card.ability === SPY) {
      this.spy(card);
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

    return { cards: this.cards, effects: this.effects, players: this.players };
  }

  public addEffect(card: IBoardCard) {
    if (card.card.ability && this.allowedEffects.includes(card.card.ability)) {
      this.effects.push({
        ability: card.card.ability,
        row: card.card.forces,
        type: card.card.type,
        fractionId: card.card.fractionId,
        image: card.card.image,
        applyTo:
          card.card.type === EType.WEATHER
            ? Object.keys(this.game.players)
            : [card.ownerNickname],
      });
    } else {
      this.applyUnitAbility(card);
    }
  }
}
