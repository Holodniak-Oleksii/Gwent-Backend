import { Game } from "@/core/Game";
import mongoose, { Schema } from "mongoose";

const DuelSchema: Schema = new Schema({
  id: { type: String, required: true },
  players: { type: Object, require: true, default: [] },
  arena: { type: Object, require: true, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Game & Document>("Duel", DuelSchema);
