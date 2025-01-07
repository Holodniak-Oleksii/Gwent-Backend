import { ICard } from "@/types/entities";

export class Player {
  public nickname: string = "";
  public avatar: string | null = null;
  public cards: ICard[] = [];
  public score: number = 0;

  constructor(nickname: string, cards: ICard[]) {
    this.nickname = nickname;
    this.cards = cards;
  }
}
