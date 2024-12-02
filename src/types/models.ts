import { ECardAbilities, EFaction } from "./enums.js";

export interface IUserModel {
  nickname: string;
  email: string;
  id: string;
  avatar?: string | null;
  wins: number;
  losses: number;
  draws: number;
  cards: ICardModel[];
  coins: number;
}

export interface IFactionModel {
  id: EFaction;
  name: string;
  emblem: string;
}

export interface ICardModel {
  id: string;
  fractionId: EFaction;
  ability: ECardAbilities | null;
  image: string;
  power: number;
}
