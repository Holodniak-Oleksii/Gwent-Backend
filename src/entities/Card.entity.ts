import { ECardAbilities, EFaction } from "@/types/enums";
import { ICard } from "@/types/interfaces";
import mongoose, { Document, Schema } from "mongoose";

export const CardSchema: Schema = new Schema<ICard>({
  id: { type: String, required: true },
  fractionId: {
    type: Number,
    enum: Object.values(EFaction),
  },
  ability: { type: Number, enum: Object.values(ECardAbilities), default: null },
  image: { type: String, default: null },
  power: { type: Number, required: true },
});

export const Card = mongoose.model<ICard & Document>("Card", CardSchema);
