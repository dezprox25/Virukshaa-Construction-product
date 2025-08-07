import React, { useState, useEffect } from "react";
import axios from "axios";

const categories = [
  "Cement", "Steel", "Masonry", "Concrete", "Electrical", "Plumbing", "Tools", "Safety"
];

const AddMaterialModal = ({ onClose, onSuccess, material }) => {
  const isEdit = !!material;

  const [form, setForm] = useState({
    name: "",
    category: "",
    currentStock: 0,
    reorderLevel: 0,
    unit: "",
    pricePerUnit: 0,
    status: "In Stock",
    supplier: "",
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: material.name || "",
        category: material.category || "",
        currentStock: material.currentStock || 0,
        reorderLevel: material.reorderLevel || 0,
        unit: material.unit || "",
        pricePerUnit: material.pricePerUnit || 0,
        status: material.status || "In Stock",
        supplier: material.supplier || "",
      });
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.put(`/api/materials/${material._id}`, {
          ...form,
          lastUpdated: new Date(),
        });
      } else {
        await axios.post("/api/materials", {
          ...form,
          lastUpdated: new Date(),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to submit material", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-12 z-50">
    
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg border overflow-hidden">
       
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <h2 className="text-lg font-semibold mb-2">
            {isEdit ? "Update Material" : "Add New Material"}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {isEdit
              ? "Edit the details below to update the material."
              : "Fill in the details to add a new material to inventory."}
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <label className="block mb-1">Material Name *</label>
              <input
                name="name"
                placeholder="e.g., Portland Cement"
                className="w-full border p-2 rounded"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Category *</label>
              <select
                name="category"
                className="w-full border p-2 rounded"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Current Stock *</label>
              <input
                name="currentStock"
                type="number"
                className="w-full border p-2 rounded"
                value={form.currentStock}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Reorder Level *</label>
              <input
                name="reorderLevel"
                type="number"
                className="w-full border p-2 rounded"
                value={form.reorderLevel}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Unit</label>
              <input
                name="unit"
                placeholder="e.g., Bags, Pieces"
                className="w-full border p-2 rounded"
                value={form.unit}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Price per Unit *</label>
              <input
                name="pricePerUnit"
                type="number"
                className="w-full border p-2 rounded"
                value={form.pricePerUnit}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Status *</label>
              <select
                name="status"
                className="w-full border p-2 rounded"
                value={form.status}
                onChange={handleChange}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="On Order">On Order</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Supplier</label>
              <input
                name="supplier"
                placeholder="Supplier Name"
                className="w-full border p-2 rounded"
                value={form.supplier}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded text-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-black text-white rounded text-sm"
            >
              {isEdit ? "Update Material" : "Add Material"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialModal;
