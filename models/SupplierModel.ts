import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  materialTypes: string[];
  supplyStartDate?: Date;
  paymentType: 'Cash' | 'Credit';
  address: string;
  status: 'Active' | 'Inactive';
  totalPaid?: number;
  dueAmount?: number;
  lastPaymentDate?: Date;
  avatar?: string;
}

const supplierSchema = new Schema<ISupplier>({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  materialTypes: [{ type: String, required: true }],
  supplyStartDate: { type: Date },
  paymentType: {
    type: String,
    enum: ['Cash', 'Credit'],
    required: true
  },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  totalPaid: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  avatar: { type: String }
}, {
  timestamps: true
});

// Create the model or retrieve it if it already exists to prevent OverwriteModelError
const Supplier = mongoose.models.Supplier as mongoose.Model<ISupplier> || 
                 mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;
