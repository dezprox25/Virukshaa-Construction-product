import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true, enum: ['client', 'superadmin'] },
  receiver: { type: String, required: true, enum: ['client', 'superadmin'] },
  conversationId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

// Create compound index for faster querying
messageSchema.index({ conversationId: 1, timestamp: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
