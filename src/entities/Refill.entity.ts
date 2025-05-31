import { IRefill } from "@/types/entities";
import mongoose, { Schema } from "mongoose";

const RefillSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number },
  code: { type: String, required: true },
  fulfilled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRefill>("Refill", RefillSchema);
