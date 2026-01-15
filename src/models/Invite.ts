import mongoose, { Schema, type InferSchemaType } from "mongoose";

const InviteSchema = new Schema(
  {
    inviteId: { type: String, required: true, unique: true, index: true },
    senderName: { type: String, required: true, trim: true },
    inviteeName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    place: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["sent", "seen", "accepted", "rejected"],
      default: "sent",
      index: true,
    },
    viewCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type InviteDoc = InferSchemaType<typeof InviteSchema>;

export const InviteModel =
  (mongoose.models.Invite as mongoose.Model<InviteDoc>) ||
  mongoose.model<InviteDoc>("Invite", InviteSchema);

