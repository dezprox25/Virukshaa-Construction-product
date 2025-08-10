import React, { useState } from "react";
import axios from "axios";

const AddTaskModal = ({ projectId, onClose, onTaskAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!name || !description) {
      alert("Please enter name and description");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/projects/${projectId}/tasks`, {
        name,
        description,
      });

      onTaskAdded(); 
      onClose();     
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Task</h2>
        
        <label className="block text-sm font-medium text-gray-600 mb-1">Task Name</label>
        <input
          type="text"
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Site Cleaning"
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
        <textarea
          rows={4}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Clean the debris around Block A..."
        />

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTask}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            {loading ? "Saving..." : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
