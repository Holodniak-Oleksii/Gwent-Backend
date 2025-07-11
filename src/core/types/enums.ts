export enum EFiledType {
  MELEE = "MELEE",
  RANGED = "RANGED",
  SIEGE = "SIEGE",
}

export enum EGameErrors {
  ALIEN_PLAYER = "alienPlayers",
  TOO_MANY_PLAYER = "tooManyPlayers",
}

export enum EGameResponseMessageType {
  UPDATE_CARDS = "updateCards",
  APPLY_CARD = "applyCard",
  PLAYER_PASS = "playerPass",
}

export enum EGameMessageType {
  UPDATE = "update",
}

export enum ESpecialFiled {
  SAVED_POWER = "savedPower",
  IS_WEATHER = "isWeather",
  IS_CURSED = "isCursed",
  IS_MOTIVATE = "isMotivate",
  IS_SPY = "isSpy",
}
