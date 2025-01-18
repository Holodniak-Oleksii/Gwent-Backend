import { ICard } from "@/types/entities";
import { ECardAbilities, EFaction, EForces, EType } from "@/types/enums";
import mongoose, { Document, Schema } from "mongoose";

export const CardSchema: Schema = new Schema<ICard>({
  id: { type: String, required: true },
  fractionId: {
    type: String,
    enum: Object.values(EFaction),
  },
  forces: {
    type: String,
    enum: Object.values(EForces),
  },
  type: {
    type: String,
    enum: Object.values(EType),
    default: EType.UNIT,
  },
  ability: { type: String, enum: Object.values(ECardAbilities), default: null },
  image: { type: String, default: null },
  power: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
});

export default mongoose.model<ICard & Document>("Card", CardSchema);
