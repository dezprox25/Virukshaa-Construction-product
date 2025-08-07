
const mongoose = require("mongoose");

const materialRequestSchema = new mongoose.Schema({
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  preferredSupplier: { type: String },
  requiredDate: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "In Transit", "Delivered"], default: "Pending" },
  requestedDate: { type: Date, default: Date.now },
  supervisor: { type: String }, 
});

module.exports = mongoose.model("MaterialRequest", materialRequestSchema);
