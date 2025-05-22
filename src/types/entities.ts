import { EGameResponseMessageType } from "@/core/types/enums.js";
import { IBoardCard, IPlayer } from "@/core/types/index.js";
import { ECardAbilities, EFaction, EForces, EType } from "./enums.js";

export interface IUser {
  _id: string;
  nickname: string;
  email: string;
  password: string;
  avatar: string | null;
  wins: number;
  losses: number;
  draws: number;
  cards: string[];
  coins: number;
  createdAt: string | Date;
  rating: number;
}

export interface ITimeStamp {
  _ts: {
    ct: Date;
    ut: Date;
  };
}

export interface ITokenUserData extends Pick<IUser, "nickname" | "_id"> {}

export interface IFaction {
  id: EFaction;
  name: string;
  emblem: string;
}

export interface ICard {
  _id: string;
  fractionId: EFaction;
  ability: ECardAbilities | null;
  image: string | null;
  power: number;
  price: number;
  forces: EForces;
  type: EType;
  isDefault: boolean;
}

export interface INotification {
  _id: string;
  rate: number;
  sender: string;
  receiver: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

export interface IGamesMessageRequest {
  type: EGameResponseMessageType;
  data: any;
}

export interface IRound {
  winner: string;
  score: {
    [x: string]: number;
  };
}

export interface IEffect {
  row: EForces;
  ability: ECardAbilities;
  type: EType;
  applyTo: string[];
}

export interface IDuel {
  _id: string;
  rate: number;
  players: Record<string, IPlayer>;
  createdAt: Date;
  boardCards: IBoardCard[];
  order: string;
  rounds: IRound[];
  winner: string | null;
  effects: IEffect[];
}
