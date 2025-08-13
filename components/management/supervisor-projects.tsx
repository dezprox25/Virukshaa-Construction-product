"use client";

import { useState, useEffect } from "react";

export default function TasksPage() {
  const [email, setEmail] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load logged-in email from storage
  useEffect(() => {
    const storedEmail =
      localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Fetch tasks automatically
  useEffect(() => {
    if (email) {
      fetchTasks(email);
    }
  }, [email]);

  const fetchTasks = async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      } else {
        alert(data.message || "Error fetching tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate summary numbers
  const totalTasks = tasks.length;
  const activeProjects = new Set(
    tasks
      .map((t) => t.projectId?._id || t.projectId || null)
      .filter((id) => id !== null)
  ).size;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Tasks</h1>

      {/* ✅ Summary UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold">Total Tasks</p>
          <p className="text-3xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold">Active Projects</p>
          <p className="text-3xl font-bold">{activeProjects}</p>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="border p-4 rounded-lg shadow-md bg-white hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-600 mb-2">
                Project: {task.projectId?.title || task.projectTitle || "N/A"}
              </p>

              <p className="text-sm text-gray-500 mb-2">
                {task.description || "No description provided"}
              </p>

              <div className="text-sm mb-2">
                <span className="font-semibold">Status:</span> {task.status}
              </div>

              <div className="text-sm mb-2">
                <span className="font-semibold">Priority:</span> {task.priority || "N/A"}
              </div>

              <div className="text-sm">
                <span className="font-semibold">Start Date:</span>{" "}
                {task.startDate
                  ? new Date(task.startDate).toLocaleDateString()
                  : "N/A"}
              </div>

              <div className="text-sm">
                <span className="font-semibold">End Date:</span>{" "}
                {task.endDate
                  ? new Date(task.endDate).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
