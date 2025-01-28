import { IDuel } from "@/types/entities";
import mongoose, { Schema } from "mongoose";

const DuelSchema: Schema = new Schema({
  id: { type: String, required: true },
  order: { type: String, default: "" },
  players: { type: Object, require: true, default: {} },
  boardCards: { type: [Object], required: true, default: [] },
  rate: { type: Number, require: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDuel & Document>("Duel", DuelSchema);
