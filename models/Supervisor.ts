import mongoose, { Document, Schema } from 'mongoose';

export interface ISupervisor extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  salary: number;
  address: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  totalPaid?: number;
  dueAmount?: number;
  lastPaymentDate?: Date;
  avatar?: string;
}

const supervisorSchema = new Schema<ISupervisor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  salary: { type: Number, default: 0 },
  address: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Inactive'],
    default: 'Active' 
  },
  totalPaid: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  avatar: { type: String }
}, { timestamps: true });

// Create text index for search
supervisorSchema.index({
  name: 'text',
  email: 'text',
  username: 'text'
});

export default mongoose.models.Supervisor || mongoose.model<ISupervisor>('Supervisor', supervisorSchema);
