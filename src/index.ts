import connectDB from "@/config/db";
import { WebSocketGameServer } from "@/gateways/game/game.ws.gateway";
import WebSocketNotificationManager from "@/gateways/notification/notification.ws.gateway";
import cardRoutes from "@/routes/card.routes";
import refreshRoutes from "@/routes/refresh.routes";
import userRoutes from "@/routes/user.routes";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import express, { Application, json, urlencoded } from "express";

dotenv.config();
const port = process.env.PORT || 8000;
const devMode = process.env.MODE === "dev";
const app: Application = express();

connectDB();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(
  cors({
    origin: devMode
      ? ["http://localhost:5173", "http://localhost:4173"]
      : "https://gwent-frontend.vercel.app",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use("/assets", express.static(path.join(__dirname, "../public/images")));

app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/refresh", refreshRoutes);

app.get("/", (_, res) => {
  res.status(200).json({ msg: "Server is up and running" });
});

const server = app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});

new WebSocketNotificationManager(server);
new WebSocketGameServer(server);
