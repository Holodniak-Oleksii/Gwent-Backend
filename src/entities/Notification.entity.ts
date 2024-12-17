import { INotification } from "@/types/entities";
import mongoose, { Schema } from "mongoose";

const NotificationSchema: Schema = new Schema({
  id: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>(
  "NotificationSchema",
  NotificationSchema
);
