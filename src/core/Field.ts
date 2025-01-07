import { EFiledType } from "@/core/types/enums";
import { ICard } from "@/types/entities";

export class Field {
  public type: EFiledType | null = null;
  public card: ICard[] = [];
  public owner: string | null = null;

  constructor(type: EFiledType, owner: string) {
    this.owner = owner;
    this.type = type;
  }
}
