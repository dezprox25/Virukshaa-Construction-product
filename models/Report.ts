import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  title: string;
  content: string;
  type: string;
  date: Date;
  // Add other fields as needed
}

const ReportSchema = new Schema<IReport>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Date, default: Date.now },
  // Add other fields as needed
});

// Check if the model already exists before creating it
export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
