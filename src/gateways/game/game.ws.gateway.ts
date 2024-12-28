import { Game } from "@/core/Game";
import DuelEntity from "@/entities/Duel.entity";
import { EGameMessageType } from "@/types/enums";
import WebSocket, { WebSocketServer } from "ws";

type GameConnections = {
  [gameId: string]: {
    game: Game | null;
    player: {
      [nickname: string]: WebSocket;
    };
  };
};

export class WebSocketGameServer {
  private wss: WebSocketServer;
  private games: GameConnections = {};

  constructor(server: any) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req: any, socket: any, head: any) => {
      if (req.url?.startsWith("/ws/game")) {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit("connection", ws, req);
        });
      }
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.wss.on("connection", async (ws: WebSocket, req) => {
      const query = req.url?.split("?")[1];
      const params = new URLSearchParams(query);
      const nickname = params.get("nickname");
      const gameId = params.get("id");

      if (!nickname || !gameId) {
        ws.close();
        return;
      }
      const duel = await DuelEntity.findOne({ id: gameId });

      if (!duel) {
        ws.close();
        return;
      }

      console.log(`Player ${nickname} connected to game ${gameId}`);
      if (!duel.players.some((item) => item.nickname === nickname)) {
        ws.close();
        return;
      }

      if (!this.games[gameId]) {
        this.games[gameId] = { game: null, player: {} };
      }

      this.games[gameId].player[nickname] = ws;

      if (!this.games[gameId].game) {
        this.games[gameId].game = new Game(duel.players, gameId);
      }

      if (Object.values(this.games[gameId].player).length !== 2) {
        ws.send(
          JSON.stringify({
            type: EGameMessageType.WAIT_PARTNER,
          })
        );
      } else {
        Object.keys(this.games[gameId].player).forEach((p) => {
          this.games[gameId].player[p].send(
            JSON.stringify({
              type: EGameMessageType.GAME_START,
              data: this.games[gameId].game,
            })
          );
        });
      }

      ws.on("message", (message: string) => {});
      ws.on("close", () => this.deleteClient(nickname, gameId));
    });
  }

  private async deleteClient(nickname: string, gameId: string) {
    if (!this.games[gameId]) return;

    delete this.games[gameId].player[nickname];
    console.log(`Player ${nickname} disconnected from game ${gameId}.`);

    const remainingPlayers = Object.keys(this.games[gameId].player);

    remainingPlayers.forEach((p) => {
      this.games[gameId].player[p].send(
        JSON.stringify({
          type: EGameMessageType.PARTNER_LEFT,
        })
      );
    });

    if (!remainingPlayers.length) {
      delete this.games[gameId];
      console.log(`Game ${gameId} closed as no players are connected.`);
    }
  }
}
