import { INotification } from "@/types/entities";
import { EStatusNotification } from "@/types/enums";
import mongoose, { Schema } from "mongoose";

const NotificationSchema: Schema = new Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  rate: { type: Number, required: true },
  status: {
    type: String,
    enum: EStatusNotification,
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
