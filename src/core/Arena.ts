import { Field } from "@/core/Field";
import { Player } from "@/core/Player";
import { EFiledType } from "@/core/types/enums";

export class Arena {
  public players: Player[] = [];
  public fields: Field[] = [];

  constructor(players: Player[]) {
    this.players = players;
    this.initArena();
  }

  private initArena() {
    this.players.forEach((player) => {
      Object.values(EFiledType).forEach((type) => {
        const newField = new Field(type, player.nickname);
        this.fields.push(newField);
      });
    });
  }
}
