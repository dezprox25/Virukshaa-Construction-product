import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  sender: 'client' | 'superadmin';
  conversationId: string;
  timestamp: Date;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>({
  text: { type: String, required: true },
  sender: { type: String, enum: ['client', 'superadmin'], required: true },
  conversationId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
