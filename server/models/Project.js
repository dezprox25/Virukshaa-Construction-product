const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true }, 
  date: String,
  workProgress: String,
  materialsUsed: [
    {
      name: String,
      quantity: Number,
      unit: String,
    }
  ],
  workersPresent: [String],
  nextDayPlan: String,
  safetyIssues: String,
  weather: String,
  images: [String],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved'],
    default: 'draft'
  }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true }, 
  name: String,
  description: String,
  isCompleted: { type: Boolean, default: false },
  completedDate: String,
  workLogs: { type: [WorkLogSchema], default: [] }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true }, 
  name: String,
  clientCompany: String,
  status: String,
  priority: String,
  location: String,
  assignedWorkers: Number,
  startDate: String,
  endDate: String,
  lastUpdated: String,
  tasks: { type: [TaskSchema], default: [] }
});

module.exports = mongoose.model('Project', ProjectSchema);
