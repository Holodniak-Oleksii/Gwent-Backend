import { Player } from "@/core/Player";
import { EGameErrors } from "@/core/types/enums";
import { Arena } from "./Arena";

export class Game {
  public players: Player[] = [];
  public arena: Arena | null = null;
  public id: string = "";

  constructor(players: Player[], id: string) {
    if (players.length !== 2) {
      throw new Error(EGameErrors.TOO_MANY_PLAYER);
    }
    this.id = id;
  }

  public start() {
    this.arena = new Arena(this.players);
  }
}
