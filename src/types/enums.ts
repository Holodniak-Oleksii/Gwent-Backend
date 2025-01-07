export enum EFaction {
  KINGDOMS_OF_THE_NORTH,
  NILFGAARD,
  SCOIATAEL,
  MONSTERS,
  UNIVERSAL,
}

export enum ECardAbilities {
  HERO,
  EXECUTION,
  HORN,
  SPY,
  MEDIC,
  STRONG_CONNECTION,
  SURGE_OF_STRENGTH,
  DOUBLE,
  AGILITY,
  CALLING_OF_AVENGER,
  MARDREM,
  BERSERK,
}

export enum EResponseMessage {
  IS_REQUIRED = "requiredFields",
  PASSWORD_LENGTH = "passwordLength",
  EMAIL_TAKEN = "emailTaken",
  NICKNAME_TAKEN = "nicknameTaken",
  USER_REGISTERED = "userRegistered",
  USER_LOGIN = "userLogin",
  INVALID_CREDENTIALS = "invalidCredentials",
  PASS_MISS_MACH = "passMissMatch",
  USER_NOT_FOUND = "userNotFound",
  TOKEN_REQUIRED = "tokenRequired",
  INVALID_TOKEN = "invalidToken",
  TOKEN_REFRESHED = "tokenRefreshed",
  SERVER_ERROR = "serverError",
}

export enum EOperationNotificationType {
  NEW_DUEL = "new_duel",
  RESPOND_DUEL = "respond_duel",
  STORED_DUELS = "stored_duels",
}

export enum EStatusNotification {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum EGameRequestMessageType {
  WAIT_PARTNER = "waitPartner",
  PARTNER_LEFT = "partnerLeft",
  GAME_START = "gameStart",
  PARTNER_FINISH_CARDS_UPDATE = "partnerFinishCardsUpdate",
}

export enum EGameResponseMessageType {
  UPDATE_CARDS = "updateCards",
}
