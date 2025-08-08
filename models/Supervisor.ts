import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ISupervisor extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  salary: number;
  address: string;
  status: 'Active' | 'Inactive';
  totalPaid?: number;
  dueAmount?: number;
  lastPaymentDate?: Date;
  avatar?: string;
  employees: mongoose.Types.ObjectId[];
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
    enum: ['Active', 'Inactive'],
    default: 'Active' 
  },
  totalPaid: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  avatar: { type: String },
  employees: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Employee',
    default: []
  }]
}, { timestamps: true });

// Create text index for search
supervisorSchema.index({
  name: 'text',
  email: 'text',
  username: 'text'
});

// Hash password before saving
supervisorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
supervisorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Supervisor || mongoose.model<ISupervisor>('Supervisor', supervisorSchema);
