import { Game } from "@/core/Game";
import { IBoardCard, IPlayer } from "@/core/types";
import { ICard, IEffect } from "@/types/entities";
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
  MUSTER,
  HERO,
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
        c.card.ability !== HERO;
      c.card.power !== 0 && !c[IS_WEATHER];

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

  private killBigPower(card?: ICard) {
    const cards = this.cards;
    const units = cards.filter(
      (c) => c.card.ability !== HERO && c.card._id !== card?._id
    );
    const maxPower = units.reduce(
      (max, card) => Math.max(max, card.card.power),
      -Infinity
    );

    const toDiscard = cards.filter(
      (c) =>
        c.card.power === maxPower &&
        c.card.ability !== HERO &&
        c.card._id !== card?._id
    );

    toDiscard.forEach((card) => {
      this.players[card.ownerNickname]?.discards.push(card.card);
    });

    this.cards = cards.filter((c) => !toDiscard.includes(c));

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

  // ---------- UNITS ---------

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

  private medic(card: IBoardCard, resurrect: ICard) {
    this.players[card.ownerNickname].discards = this.players[
      card.ownerNickname
    ].discards.filter((c) => c._id !== resurrect._id);

    const boardCard: IBoardCard = {
      card: resurrect,
      ownerNickname: card.ownerNickname,
      position: resurrect.forces,
    };

    this.cards.push(boardCard);
  }

  private muster(card: IBoardCard) {
    const ability = card.card.ability as ECardAbilities;
    const owner = card.ownerNickname;
    const name = card.card.image;

    const match = (c: ICard) => this.nameMatch(c, ability, name);

    const [playCardsMatch, playCardsRest] = this.partition(
      this.players[owner].playingCards,
      match
    );
    const [discardsMatch, discardsRest] = this.partition(
      this.players[owner].discards,
      match
    );
    const [deckMatch, deckRest] = this.partition(
      this.players[owner].deck,
      match
    );

    [...playCardsMatch, ...discardsMatch, ...deckMatch].forEach((c) => {
      const boardCard: IBoardCard = {
        card: c,
        ownerNickname: owner,
        position: c.forces,
      };

      this.cards.push(boardCard);
    });

    this.players[owner].playingCards = playCardsRest;
    this.players[owner].discards = discardsRest;
    this.players[owner].deck = deckRest;
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

  private applyUnitAbility(card: IBoardCard, additional: any) {
    switch (card.card.ability) {
      case SPY: {
        this.spy(card);
        break;
      }
      case MEDIC: {
        if (!!additional?.resurrect) {
          this.medic(card, additional.resurrect);
        }
        break;
      }
      case MUSTER: {
        this.muster(card);
        break;
      }
      case SCORCH: {
        this.killBigPower(card.card);
        break;
      }
      default: {
        break;
      }
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

  public addEffect(card: IBoardCard, additional: any) {
    if (
      card.card.ability &&
      this.allowedEffects.includes(card.card.ability) &&
      card.card.type !== EType.UNIT
    ) {
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
      this.applyUnitAbility(card, additional);
    }
  }
  // ---------- UTILS ---------
  private partition<T>(
    array: T[],
    predicate: (item: T) => boolean
  ): [T[], T[]] {
    const matched: T[] = [];
    const rest: T[] = [];

    for (const item of array) {
      (predicate(item) ? matched : rest).push(item);
    }

    return [matched, rest];
  }

  private nameMatch = (c: ICard, ability: ECardAbilities, name: string) =>
    c.ability === ability && c.image.includes(name.slice(0, -2));
}
