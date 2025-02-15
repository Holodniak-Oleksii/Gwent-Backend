import { IBoardCard, IPlayer } from "@/core/types";
import { EForces, EType } from "@/types/enums";

export class Utils {
  public getRandomElements<T>(array: T[], count: number): T[] {
    if (count > array.length) {
      throw new Error("Count cannot be greater than the array length.");
    }

    const result: T[] = [];
    const usedIndices = new Set<number>();

    while (result.length < count) {
      const randomIndex = Math.floor(Math.random() * array.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        result.push(array[randomIndex]);
      }
    }

    return result;
  }

  public tossCoin(players: Record<string, IPlayer>) {
    const nicknameArray = Object.keys(players);
    return nicknameArray[Math.floor(Math.random() * nicknameArray.length)];
  }

  public devalueCard(cards: IBoardCard[], row: EForces): IBoardCard[] {
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

  public applyEffects(cards: IBoardCard[], effects: EForces[]) {
    if (effects.length) {
      let updatedCards: IBoardCard[] = cards;

      effects.forEach((e) => {
        updatedCards = this.devalueCard(updatedCards, e);
      });

      return updatedCards;
    }
    return cards;
  }

  public returnCardsValues(cards: IBoardCard[]): IBoardCard[] {
    return cards.map((c) => ({
      ownerNickname: c.ownerNickname,
      position: c.position,
      card: { ...c.card, power: c.oldPower || c.card.power },
    }));
  }
}
