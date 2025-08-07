const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  project: { type: String, required: true }, 
  role: { type: String, required: true },
});

module.exports = mongoose.model("Employee", employeeSchema);
