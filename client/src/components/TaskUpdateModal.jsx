import { useEffect, useState } from "react";
import { updateTaskStatus } from "../services/projectService";

const TaskUpdateModal = ({ project, onClose, onUpdated }) => {
  const [updating, setUpdating] = useState(false);
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    setLocalTasks(project.tasks || []);
  }, [project]);

  const handleCheckbox = async (taskId, isCompleted) => {
    if (!project?.projectId || !taskId) {
      console.error("Missing projectId or taskId", { projectId: project?.projectId, taskId });
      return;
    }

    try {
      setUpdating(true);

      setLocalTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, isCompleted } : task
        )
      );

      await updateTaskStatus(project.projectId, taskId, { isCompleted });
      await onUpdated();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update task.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl w-full max-w-lg mx-4">
    <h2 className="text-xl font-semibold mb-4">{project.name} - Tasks</h2>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {localTasks.map((task) => (
            <li key={task.taskId} className="flex justify-between items-center">
              <span>{task.name}</span>
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={(e) => handleCheckbox(task.taskId, e.target.checked)}
                disabled={updating}
              />
            </li>
          ))}
        </ul>
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskUpdateModal;
