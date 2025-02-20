import { IDuel } from "@/types/entities";
import mongoose, { Schema } from "mongoose";

const DuelSchema: Schema = new Schema({
  id: { type: String, required: true },
  order: { type: String, default: "" },
  winner: { type: String, default: null },
  players: { type: Object, require: true, default: {} },
  boardCards: { type: [Object], required: true, default: [] },
  rounds: { type: [Object], required: true, default: [] },
  rate: { type: Number, require: true },
  effects: { type: [Object], required: true, default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDuel & Document>("Duel", DuelSchema);
