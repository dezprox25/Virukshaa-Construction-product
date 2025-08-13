import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema<IMessage>({
  conversationId: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
