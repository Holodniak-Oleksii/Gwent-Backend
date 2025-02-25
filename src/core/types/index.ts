import { ESpecialFiled } from "@/core/types/enums";
import { ICard } from "@/types/entities";
import { EForces } from "@/types/enums";
import { WebSocket } from "ws";

export interface IPlayer {
  nickname: string;
  avatar: string | null;
  pass: boolean;
  enemy: {
    nickname: string;
    avatar: string | null;
    cardsCount: number;
    pass: boolean;
  };
  deck: ICard[];
  playingCards: ICard[];
  promisedCards: number;
}

export interface IConnection {
  online?: boolean;
  ws?: WebSocket;
}

export interface IBoardCard {
  card: ICard;
  [ESpecialFiled.SAVED_POWER]?: number;
  [ESpecialFiled.IS_WEATHER]?: boolean;
  [ESpecialFiled.IS_MOTIVATE]?: boolean;
  [ESpecialFiled.IS_SPY]?: boolean;
  ownerNickname: string;
  position: EForces;
}
