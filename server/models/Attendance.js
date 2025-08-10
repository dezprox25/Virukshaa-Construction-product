const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  attendanceId: { type: String, required: true, unique: true }, 
  date: { type: String, required: true }, 
  employees: [
    {
      employeeId: String,
      name: String,
      project: String,
      status: String, 
      inTime: String,
      reason: String,
    },
  ],
});

module.exports = mongoose.model("Attendance", attendanceSchema);
