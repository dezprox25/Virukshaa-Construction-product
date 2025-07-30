import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  startDate?: Date;
  endDate?: Date;
  documentUrl?: string;
  documentType?: string;
  projectId?: mongoose.Schema.Types.ObjectId;
  projectTitle?: string;
  assignedTo: mongoose.Schema.Types.ObjectId;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  startDate: { type: Date },
  endDate: { type: Date },
  documentUrl: { type: String },
  documentType: { type: String },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  projectTitle: { type: String },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true,
  },
}, { timestamps: true });

taskSchema.index({
  title: 'text',
  description: 'text',
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
