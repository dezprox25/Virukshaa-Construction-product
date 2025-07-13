import mongoose, { Document, Schema } from 'mongoose';

export interface ISupervisor extends Document {
  name: string;
  email: string;
  phone: string;
  salary: number;
  address: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
}

const supervisorSchema = new Schema<ISupervisor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  salary: { type: Number, default: 0 },
  address: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Inactive'],
    default: 'Active' 
  },
  avatar: { type: String }
}, { timestamps: true });

// Create text index for search
supervisorSchema.index({
  name: 'text',
  email: 'text'
});

export default mongoose.models.Supervisor || mongoose.model<ISupervisor>('Supervisor', supervisorSchema);
