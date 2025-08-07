import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  CheckCircle,
  Package,
  TriangleAlert,
  UserCircle,
  Pencil,
  Save,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import QuickActions from "../components/QuickActions";

const badgeStyle = {
  "Planning": "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "On Hold": "bg-gray-100 text-gray-800",
  "Completed": "bg-green-100 text-green-700",
  "High": "bg-red-100 text-red-600",
  "Medium": "bg-yellow-100 text-yellow-700",
  "Low": "bg-green-100 text-green-700",
};

const Dashboard = ({ setSidebarOpen }) => {
  const [attendance, setAttendance] = useState([]);
  const [projectStats, setProjectStats] = useState(null);
  const [latestLogs, setLatestLogs] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [safetyIssuesCount, setSafetyIssuesCount] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadAll() {
      try {
        const [attRes, statsRes, logsRes, projectsRes] = await Promise.all([
          axios.get("/api/attendance", { params: { date: today } }),
          axios.get("/api/projects/stats"),
          axios.get("/api/daily-logs"),
          axios.get("/api/projects"),
        ]);

        setAttendance(attRes.data.employees || []);
        setProjectStats(statsRes.data);

        let totalSafetyIssues = 0;
        projectsRes.data.forEach((project) => {
          project.tasks?.forEach((task) => {
            task.workLogs?.forEach((log) => {
              const issue = log.safetyIssues?.trim();
              if (issue && issue.toLowerCase() !== "none") {
                totalSafetyIssues++;
              }
            });
          });
        });
        setSafetyIssuesCount(totalSafetyIssues);

        const projectMap = {};
        projectsRes.data.forEach((proj) => {
          projectMap[proj._id] = proj;
        });

        const grouped = {};
        logsRes.data.forEach((log) => {
          const id = log.projectId;
          if (
            !grouped[id] ||
            new Date(log.log.date) > new Date(grouped[id].log.date)
          ) {
            grouped[id] = {
              ...log,
              project: projectMap[id],
            };
          }
        });

        setLatestLogs(Object.values(grouped));
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [today]);

  const getBadge = (text) => {
    const style = badgeStyle[text] || "bg-gray-100 text-gray-800";
    return (
      <span key={text} className={`px-3 py-1 text-xs rounded-full ${style}`}>
        {text}
      </span>
    );
  };

  const handleEdit = (projectId, currentStatus, currentPriority) => {
    setEditMode((prev) => ({ ...prev, [projectId]: true }));
    setEditData((prev) => ({
      ...prev,
      [projectId]: {
        status: currentStatus,
        priority: currentPriority,
      },
    }));
  };

  const handleChange = (projectId, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (projectId) => {
    try {
      const updated = editData[projectId];
      await axios.put(`/api/projects/${projectId}/status`, updated);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">

      <div className="sticky top-0 z-20 bg-white shadow px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
  <button
    onClick={() => setSidebarOpen(true)}
    className="md:hidden block text-gray-700 hover:text-green-600"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
  <h1 className="text-xl font-bold text-gray-800">Supervisor – Dashboard</h1>
</div>

        <div className="flex items-center gap-10 text-xl text-gray-600">
          <UserCircle size={20} className="cursor-pointer hover:text-virukshaa-green" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 py-5 space-y-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard
            title="Workers Present"
            value={
              attendance.length > 0
                ? `${attendance.filter((e) => e.status !== "Absent").length}/${attendance.length}`
                : "Take today's attendance"
            }
            icon={<Users size={18} className="text-green-500" />}
          />
          <DashboardCard
            title="Tasks Completed"
            value={projectStats ? `${projectStats.avgProgress}%` : "--"}
            icon={<CheckCircle size={18} className="text-blue-500" />}
          />
          <DashboardCard
            title="Materials Used"
            value="85%"
            icon={<Package size={18} className="text-yellow-500" />}
          />
          <DashboardCard
            title="Safety Issues"
            value={safetyIssuesCount}
            icon={<TriangleAlert size={18} className="text-red-500 " />}
          />
        </div>

        <div className="bg-white border rounded-xl p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold">Recent Tasks</h2>
          <p className="text-gray-500 mb-4 text-sm">Latest updates from active projects</p>

          {latestLogs.length === 0 ? (
            <p className="text-gray-600">No logs available.</p>
          ) : (
            latestLogs.map((entry, idx) => {
              const project = entry.project || {};
              const projectId = project._id;
              const isEditing = editMode[projectId];
              const update = editData[projectId] || {};

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between border p-4 rounded-lg hover:shadow-sm transition"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{entry.taskName}</h3>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(entry.log.date).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2 mt-1">
                      {isEditing ? (
                        <>
                          <select
                            value={update.status}
                            onChange={(e) => handleChange(projectId, "status", e.target.value)}
                            className="text-xs rounded px-2 py-1 border"
                          >
                            <option>Planning</option>
                            <option>In Progress</option>
                            <option>On Hold</option>
                            <option>Completed</option>
                          </select>

                          <select
                            value={update.priority}
                            onChange={(e) => handleChange(projectId, "priority", e.target.value)}
                            className="text-xs rounded px-2 py-1 border"
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </>
                      ) : (
                        <>
                          {getBadge(project.status || "Pending")}
                          {getBadge(project.priority || "Medium")}
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <button
                      className="flex items-center gap-1 border px-4 py-1 rounded-lg text-sm font-medium hover:bg-green-100"
                      onClick={() => handleSave(projectId)}
                    >
                      <Save size={14} />
                      Save
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-3 border px-4 py-1 rounded-md text-md font-medium hover:bg-gray-100"
                      onClick={() => handleEdit(projectId, project.status, project.priority)}
                    >
                      <Pencil size={15} />
                      Update
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
