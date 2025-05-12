import { calculateRating } from "@/utils";
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../types/entities";

const UserSchema: Schema = new Schema<IUser>({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  id: { type: String, required: true },
  avatar: { type: String, default: null },
  wins: { type: Number, required: true, default: 0 },
  losses: { type: Number, required: true, default: 0 },
  draws: { type: Number, required: true, default: 0 },
  cards: { type: [String], required: true, default: [] },
  createdAt: { type: Date, required: true },
  rating: { type: Number, required: true, default: 1000 },
  coins: {
    type: Number,
    required: true,
    default: +process.env.DEFAULT_USER_SCORE!,
  },
});

UserSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    doc.rating = calculateRating(doc.wins, doc.losses, doc.draws);
    await doc.save();
  }
});

export default mongoose.model<IUser & Document>("User", UserSchema);
