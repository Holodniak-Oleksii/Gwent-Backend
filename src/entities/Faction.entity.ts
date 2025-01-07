import { IFaction } from "@/types/entities";
import { EFaction } from "@/types/enums";
import mongoose, { Document, Schema } from "mongoose";

const FactionSchema: Schema = new Schema<IFaction>({
  id: { type: Number, enum: Object.values(EFaction), required: true },
  name: { type: String, required: true },
  emblem: { type: String, required: true },
});

export default mongoose.model<IFaction & Document>("Faction", FactionSchema);
