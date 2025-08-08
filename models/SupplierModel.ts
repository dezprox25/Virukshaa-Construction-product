import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectMaterial {
  projectId: mongoose.Types.ObjectId;
  materialType: string;
  quantity: number;
  amount: number;
}

export interface ISupplier extends Document {
  companyName: string;
  contactPerson: string;
  email: string;
  // username: string;
  // password: string;
  phone: string;
  materialTypes: string[];
  projectMaterials?: IProjectMaterial[];
  supplyStartDate?: Date;
  address: string;
  status: 'Active' | 'Inactive';
  totalPaid?: number;
  dueAmount?: number;
  lastPaymentDate?: Date;
  avatar?: string;
  bankDetails?: {
    accountNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    branch?: string;
    ifscCode?: string;
    upiId?: string;
    accountType?: 'Savings' | 'Current' | 'Other';
    isPrimary?: boolean;
  }[];
}

const projectMaterialSchema = new Schema<IProjectMaterial>({
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project',
    required: true 
  },
  materialType: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const supplierSchema = new Schema<ISupplier>({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // username: { type: String, required: true, unique: true },
  // password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  materialTypes: [{ type: String, required: true }],
  projectMaterials: [projectMaterialSchema],
  supplyStartDate: { type: Date },
  address: { type: String, required: true },
  bankDetails: [{
    accountNumber: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branch: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },
    upiId: { type: String, trim: true, lowercase: true },
    accountType: {
      type: String,
      enum: ['Savings', 'Current', 'Other'],
      default: 'Savings'
    },
    isPrimary: { type: Boolean, default: false }
  }],
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

// Create text index for search
supplierSchema.index({
  companyName: 'text',
  email: 'text',
  // username: 'text',  
  contactPerson: 'text'
});

// Create the model or retrieve it if it already exists to prevent OverwriteModelError
const Supplier = mongoose.models.Supplier as mongoose.Model<ISupplier> || 
                 mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;
