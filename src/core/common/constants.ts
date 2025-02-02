export const GAME_REQUEST_MESSAGE = {
  WAIT_PARTNER: `{"type":"waitPartner"}`,
  PARTNER_LEFT: `{"type":"partnerLeft"}`,
  GAME_START: `{"type":"gameStart"}`,
  GAME_END: (winner: string) =>
    `{"type":"gameEnd", "data": {"winner": "${winner}"}}`,
  PREPARATION: `{"type":"preparation"}`,
  PARTNER_SET_DECK: `{"type":"partnerSetDeck"}`,
  PREPARATION_COMPLETED: `{"type":"preparationCompleted"}`,
};
