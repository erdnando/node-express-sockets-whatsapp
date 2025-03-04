import mongoose from "mongoose";

const GroupMessageSchema = mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
    type: {
      type: String,
      enum: ["TEXT", "IMAGE","FILE"],
    },
    tipo_cifrado: String,
    email_replied:String,
    message_replied:String,
    tipo_cifrado_replied:String,
    forwarded:Boolean,
    estatus:String,
    lectores_message:String,
    edited_message:Boolean
  },
  {
    timestamps: true,
  }
);

export const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);
