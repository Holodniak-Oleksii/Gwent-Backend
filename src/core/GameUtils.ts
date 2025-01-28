import { IPlayer } from "@/core/types";

export class GameUtils {
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
}
