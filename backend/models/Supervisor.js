const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  project: String,
  assignedTo: String,
  status: String,
  progress: Number,
  dueDate: String,
  description: String,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  role: String,
  rate: Number,
  hours: Number,
  status: String,
});

const updateSchema = new mongoose.Schema({
  employee: String,
  task: String,
  hours: Number,
  description: String,
  timestamp: String,
});

const supervisorSchema = new mongoose.Schema({
  supervisorId: String,
  name: String,
  password: String,
  employees: [employeeSchema],
  tasks: [taskSchema],
  updates: [updateSchema], 
});

module.exports = mongoose.model('Supervisor', supervisorSchema);
