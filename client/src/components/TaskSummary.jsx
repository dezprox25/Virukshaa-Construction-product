import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusStyles = {
  'In Progress': 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
};

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

const TaskSummary = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('/api/tasks').then((res) => {
      setTasks(res.data);
    });
  }, []);

  const handleUpdate = async (id) => {
    const newStatus = prompt("Enter new status (Pending, In Progress, Completed):");
    const newPriority = prompt("Enter new priority (High, Medium, Low):");
    if (!newStatus || !newPriority) return;

    await axios.put(`/api/tasks/${id}`, {
      status: newStatus,
      priority: newPriority,
    });

    setTasks((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status: newStatus, priority: newPriority } : t
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-sidebar-gray-400 mt-6">
      <h2 className="text-2xl font-bold mb-1">Project Task Status</h2>
      <p className="text-sm text-gray-500 mb-4">Update or review current task status.</p>

      {tasks.map((task) => (
        <div key={task._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">{task.project}</h3>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[task.status]}`}>
                {task.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleUpdate(task._id)}
            className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition"
          >
            Update
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskSummary;
