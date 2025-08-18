import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  // General
  title: string;
  content?: string; // optional free text
  type: 'client' | 'supervisor' | 'employee' | 'supplier';
  date: Date;

  // Supervisor daily report fields
  supervisorId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  siteUpdate?: string;
  employeeSummary?: string;
  queries?: string;
  employees?: mongoose.Types.ObjectId[];
  status?: 'Draft' | 'Submitted';
}

const ReportSchema = new Schema<IReport>({
  // General
  title: { type: String, required: true },
  content: { type: String },
  type: { 
    type: String, 
    required: true, 
    enum: ['client', 'supervisor', 'employee', 'supplier']
  },
  date: { type: Date, default: Date.now },

  // Supervisor daily report fields
  supervisorId: { type: Schema.Types.ObjectId, ref: 'Supervisor' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  siteUpdate: { type: String },
  employeeSummary: { type: String },
  queries: { type: String },
  employees: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  status: { type: String, enum: ['Draft', 'Submitted'], default: 'Submitted' }
}, { timestamps: true });

// Hot-reload safety in dev
if (mongoose.models.Report) {
  delete mongoose.models.Report;
}
export default mongoose.model<IReport>('Report', ReportSchema);
