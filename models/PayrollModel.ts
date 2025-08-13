import { Schema, model, models, Document, Types } from 'mongoose';

export interface IPayroll extends Document {
  user: Types.ObjectId;
  userRole: 'Employee' | 'Supervisor' | 'Client' | 'Supplier';
  amount: number;
  paymentDate: Date;
  status: 'paid' | 'pending' | 'failed';
  notes?: string;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: 'userRole',
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ['Employee', 'Supervisor', 'Client', 'Supplier'], // Mongoose refs need model names
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payroll = models.Payroll || model<IPayroll>('Payroll', PayrollSchema);

export default Payroll;
