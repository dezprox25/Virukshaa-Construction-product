import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  phone: string;
  role: string;
  salary: number;
  workType: 'Daily' | 'Monthly' | 'Contract';
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: Date;
  endDate?: Date;
  address: string;
  username?: string;
  avatar?: string;
  department?: string;
  totalPaid?: number;
  dueAmount?: number;
  lastPaymentDate?: Date;
  supervisor?: mongoose.Types.ObjectId;
}

const employeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: [
      'Mason', 'Carpenter', 'Electrician', 'Plumber', 
      'Heavy Equipment Operator', 'Safety Inspector', 'Laborer', 
      'Welder', 'Painter', 'Roofer', 'HVAC Technician', 'Concrete Worker', 'Employee'
    ]
  },
  salary: { type: Number, required: true },
  workType: {
    type: String,
    required: true,
    enum: ['Daily', 'Monthly', 'Contract'],
  },
  status: { 
    type: String,   
    enum: ['Active', 'On Leave', 'Inactive'],
    default: 'Active'
  },
  joinDate: { type: Date, required: true },
  endDate: { type: Date },
  address: { type: String, default: '' },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  avatar: { type: String, required: false },
  department: { type: String, required: false },
  totalPaid: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  supervisor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supervisor',
    default: null
  }
}, { timestamps: true });

// Ensure we don't reuse a stale compiled model with an outdated schema (dev/hot-reload)
if (mongoose.models.Employee) {
  delete mongoose.models.Employee;
}
export default mongoose.model<IEmployee>('Employee', employeeSchema);
