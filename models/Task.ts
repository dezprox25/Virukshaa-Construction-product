import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // ✅ Ref matches model name
    projectTitle: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor" },
    startDate: Date,
    endDate: Date,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
