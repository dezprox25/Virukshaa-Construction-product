const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  materialId: { type: String, unique: true }, 
  name: { type: String, required: true },
  category: { type: String },
  currentStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  unit: { type: String },
  pricePerUnit: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["In Stock", "Low Stock", "Out of Stock"],
    default: "In Stock",
  },
  supplier: { type: String },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Material", materialSchema);
