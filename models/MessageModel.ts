import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  sender: string;
  text: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
