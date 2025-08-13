import mongoose, { Schema, Document } from "mongoose"

export interface IPayment extends Document {
  clientEmail: string
  project: string
  milestone: string
  amount: number
  dueDate?: string
  paidDate?: string
  status: "Paid" | "Pending" | "Overdue" | "Upcoming"
  description: string
  invoiceNumber: string
  transactionId?: string
  method?: string
  type: "Schedule" | "History"
}

const PaymentSchema: Schema = new Schema({
  clientEmail: { type: String, required: true },
  project: String,
  milestone: String,
  amount: Number,
  dueDate: String,
  paidDate: String,
  status: { type: String, enum: ["Paid", "Pending", "Overdue", "Upcoming"] },
  description: String,
  invoiceNumber: String,
  transactionId: String,
  method: String,
  type: { type: String, enum: ["Schedule", "History"] }
})

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)
