import mongoose, { Schema, Document } from 'mongoose'

export interface IConversation extends Document {
  participants: string[] // [adminEmail, clientEmail]
}

const ConversationSchema = new Schema<IConversation>({
  participants: [String]
})

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema)
