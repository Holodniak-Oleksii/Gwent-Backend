import { ECardAbilities, EFaction } from "./enums.js";

export interface IUser {
  nickname: string;
  email: string;
  password: string;
  id: string;
  avatar: string | null;
  wins: number;
  losses: number;
  draws: number;
  cards: ICard[];
  coins: number;
}

export interface ITimeStamp {
  _ts: {
    ct: Date;
    ut: Date;
  };
}

export interface ITokenUserData extends Pick<IUser, "nickname" | "id"> {}

export interface IFaction {
  id: EFaction;
  name: string;
  emblem: string;
}

export interface ICard {
  id: string;
  fractionId: EFaction;
  ability: ECardAbilities | null;
  image: string | null;
  power: number;
}

export interface INotification {
  id: string;
  sender: string;
  receiver: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}
