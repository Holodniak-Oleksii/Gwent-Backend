import connectDB from "@/config/db";
import { initWebSocket } from "@/gateways/ws.gateway";
import cardRoutes from "@/routes/card.routes";
import userRoutes from "@/routes/user.routes";
import dotenv from "dotenv";

import express, { Application, json, urlencoded } from "express";

dotenv.config();
const port = process.env.PORT || 8000;
const app: Application = express();

connectDB();

app.use(urlencoded({ extended: true }));
app.use(json());

app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Server is up and running" });
});

const server = app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});

initWebSocket(server);
