import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  taxId?: string;
  website?: string;
  status: 'Active' | 'Inactive';
  projectTotalAmount: number;
  totalPaid?: number;
  dueAmount?: number;
  lastPaymentDate?: Date;
  avatar?: string; // Optional avatar URL
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    company: { type: String }, // optional
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    taxId: { type: String },
    website: { type: String },
    status: { 
      type: String, 
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    projectTotalAmount: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    lastPaymentDate: { type: Date },
    avatar: { type: String }, // Optional avatar URL
  },
  { timestamps: true }
);

// Create the model or return existing one to prevent recompilation errors
const Client = mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
