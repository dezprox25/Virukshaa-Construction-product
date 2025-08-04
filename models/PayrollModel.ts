import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IUserReference {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface IPayroll extends Document {
  user: Types.ObjectId | IUserReference;
  userRole: 'Employee' | 'Supervisor' | 'Client' | 'Supplier';
  amount: number;
  paymentDate: Date;
  status: 'paid' | 'pending' | 'failed';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const PayrollSchema = new Schema<IPayroll>(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: 'userRole',
      required: [true, 'User ID is required'],
    },
    userRole: {
      type: String,
      required: [true, 'User role is required'],
      enum: {
        values: ['Employee', 'Supervisor', 'Client', 'Supplier'],
        message: 'Invalid user role. Must be one of: Employee, Supervisor, Client, Supplier'
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['paid', 'pending', 'failed'],
        message: 'Invalid status. Must be one of: paid, pending, failed'
      },
      default: 'paid',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be longer than 500 characters'],
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        const { _id, __v, ...rest } = ret as any;
        return { id: _id, ...rest };
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        const { _id, __v, ...rest } = ret as any;
        return { id: _id, ...rest };
      }
    }
  }
);

// Add indexes for better query performance
PayrollSchema.index({ user: 1, paymentDate: -1 });
PayrollSchema.index({ status: 1 });
PayrollSchema.index({ paymentDate: -1 });

// Add a pre-save hook to validate the user reference
PayrollSchema.pre('save', async function(next) {
  if (this.isModified('user') || this.isNew) {
    try {
      // Check if the referenced user exists
      const Model = mongoose.model(this.userRole);
      const user = await Model.findById(this.user).select('_id').lean();
      
      if (!user) {
        throw new Error(`Referenced ${this.userRole} not found`);
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Create the model if it doesn't exist
const Payroll = models.Payroll || model<IPayroll>('Payroll', PayrollSchema);

export default Payroll;
