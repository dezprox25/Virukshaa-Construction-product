import React, { useState, useEffect } from "react";
import axios from "axios";

const RequestMaterialModal = ({ onClose, onRequested, materials, existingRequest }) => {
  const [form, setForm] = useState({
    material: "",
    quantity: 0,
    preferredSupplier: "",
    requiredDate: "",
    supervisor: "",
    notes: "",
  });

  useEffect(() => {
    if (existingRequest) {
      setForm({
        material: existingRequest.material || "",
        quantity: existingRequest.quantity || 0,
        preferredSupplier: existingRequest.preferredSupplier || "",
        requiredDate: existingRequest.requiredDate?.split("T")[0] || "",
        supervisor: existingRequest.supervisor || "",
        notes: existingRequest.notes || "",
      });
    }
  }, [existingRequest]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (existingRequest?._id) {
        await axios.put(`/api/material-requests/${existingRequest._id}`, form);
      } else {
        await axios.post("/api/material-requests", form);
      }
      onRequested();
      onClose();
    } catch (err) {
      console.error("Failed to submit material request", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-2">
          {existingRequest ? "Edit Material Request" : "Request Materials"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {existingRequest ? "Update the request details below." : "Submit a request for materials needed for your project."}
        </p>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 font-medium">Material *</label>
            <select
              name="material"
              className="w-full border p-2 rounded"
              value={form.material}
              onChange={handleChange}
            >
              <option value="">Select a material</option>
              {materials?.map((m) => (
                <option key={m._id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Quantity *</label>
            <input
              name="quantity"
              type="number"
              className="w-full border p-2 rounded"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Preferred Supplier</label>
            <input
              name="preferredSupplier"
              className="w-full border p-2 rounded"
              value={form.preferredSupplier}
              onChange={handleChange}
              placeholder="e.g., JSW Steel"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Required Date *</label>
            <input
              name="requiredDate"
              type="date"
              className="w-full border p-2 rounded"
              value={form.requiredDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Supervisor Name *</label>
            <input
              name="supervisor"
              className="w-full border p-2 rounded"
              value={form.supervisor}
              onChange={handleChange}
              placeholder="Enter supervisor name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea
              name="notes"
              className="w-full border p-2 rounded"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes or special requirements..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-black text-white rounded text-sm">
            {existingRequest ? "Update Request" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestMaterialModal;
