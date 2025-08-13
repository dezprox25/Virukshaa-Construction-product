import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IMaterial extends Document {
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  pricePerUnit: number;
  supplier: string;
  lastUpdated: Date;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
  description?: string;
  notes?: string;
  minOrderQuantity?: number;
  location?: string;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialDocument extends IMaterial {
  _id: Types.ObjectId;
}

const materialSchema = new Schema<IMaterial>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    category: { 
      type: String, 
      required: true,
      enum: ['Cement', 'Steel', 'Masonry', 'Concrete', 'Electrical', 'Plumbing', 'Tools', 'Safety']
    },
    unit: { 
      type: String,
      required: false,
      trim: true
    },
    currentStock: { 
      type: Number, 
      required: true,
      min: 0
    },
    reorderLevel: { 
      type: Number, 
      required: true,
      min: 0
    },
    pricePerUnit: { 
      type: Number, 
      required: true,
      min: 0
    },
    supplier: { 
      type: String, 
      required: false,
      trim: true
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'On Order'],
      default: 'In Stock'
    },
    description: { type: String },
    notes: { type: String },
    minOrderQuantity: { type: Number },
    location: { type: String },
    barcode: { type: String },
    sku: { type: String },
    imageUrl: { type: String },
    tags: [{ type: String }]
  },
  {
    timestamps: true
  }
);

// Update status based on stock level before saving
materialSchema.pre<IMaterial>('save', function(next) {
  if (this.currentStock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.currentStock <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  this.lastUpdated = new Date();
  next();
});

// Check if the model has already been compiled
const Material: Model<IMaterial> = 
  (mongoose.models.Material as Model<IMaterial>) || 
  mongoose.model<IMaterial>('Material', materialSchema);

export { Material };
