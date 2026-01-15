import mongoose, { Schema, type InferSchemaType } from "mongoose";

const InviteResponseSchema = new Schema(
  {
    inviteId: { type: String, required: true, index: true },
    response: {
      type: String,
      required: true,
      enum: ["accepted", "rejected"],
    },
    respondedAt: { type: Date, required: true, default: () => new Date() },
    ipAddress: { type: String, required: false },
  },
  { timestamps: false },
);

export type InviteResponseDoc = InferSchemaType<typeof InviteResponseSchema>;

export const InviteResponseModel =
  (mongoose.models.InviteResponse as mongoose.Model<InviteResponseDoc>) ||
  mongoose.model<InviteResponseDoc>("InviteResponse", InviteResponseSchema);

