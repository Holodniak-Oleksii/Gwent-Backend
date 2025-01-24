import { Game } from "@/core/Game";
import DuelEntity from "@/entities/Duel.entity";
import { IGamesMessageRequest } from "@/types/entities";
import WebSocket, { WebSocketServer } from "ws";

type GameConnections = {
  [gameId: string]: Game;
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
      if (!duel.players[nickname]) {
        ws.close();
        return;
      }

      if (!this.games[gameId]) {
        this.games[gameId] = new Game(
          gameId,
          duel.rate,
          duel.players,
          duel.boardCards
        );
      }

      this.games[gameId].addPlayer(nickname, ws);

      ws.on("message", (message: string) => {
        if (this.games[gameId]) {
          const data = JSON.parse(message) as IGamesMessageRequest;
          this.games[gameId].actionManage(data, nickname);
        }
      });
      ws.on("close", () => this.deleteClient(nickname, gameId));
    });
  }

  private async deleteClient(nickname: string, gameId: string) {
    if (!this.games[gameId]) return;
    this.games[gameId].removePlayer(nickname);

    if (!Object.keys(this.games[gameId].connection).length) {
      delete this.games[gameId];
      console.log(`Game ${gameId} closed as no players are connected.`);
    }
  }
}
