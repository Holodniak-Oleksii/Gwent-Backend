export enum EFaction {
  KINGDOMS_OF_THE_NORTH = "KINGDOMS_OF_THE_NORTH",
  NILFGAARD = "NILFGAARD",
  SCOIATAEL = "SCOIATAEL",
  MONSTERS = "MONSTERS",
  UNIVERSAL = "UNIVERSAL",
}

export enum EForces {
  CLOSE = "CLOSE",
  RANGED = "RANGED",
  SIEGE = "SIEGE",
  AGILE = "AGILE",
  ANY = "ANY",
}

export enum ECardAbilities {
  HERO = "HERO",
  HORN = "HORN",
  SPY = "SPY",
  MEDIC = "MEDIC",
  SCORCH = "SCORCH",
  MUSTER = "MUSTER",
  MARDROEME = "MARDROEME",
  DECOY = "DECOY",
  BERSERK = "BERSERK",
  TIGHT_BOND = "TIGHT_BOND",
  MORALE_BOOST = "MORALE_BOOST",
  // WEATHER
  BITING_FROST = "BITING_FROST",
  IMPENETRABLE_FOG = "IMPENETRABLE_FOG",
  TORRENTIAL_RAIN = "TORRENTIAL_RAIN",
  SKELLIGE_STORM = "SKELLIGE_STORM",
  CLEAR_WEATHER = "CLEAR_WEATHER",
  // LEADER
  KING_OF_TEMERIA = "KING_OF_TEMERIA",
  HIS_IMPERIAL_MAJESTY = "HIS_IMPERIAL_MAJESTY",
  PUREBLOOD_ELF = "PUREBLOOD_ELF",
  COMMANDER_OF_THE_RED_RIDERS = "COMMANDER_OF_THE_RED_RIDERS",
}

export enum EType {
  LEADER = "LEADER",
  WEATHER = "WEATHER",
  UNIT = "UNIT",
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
