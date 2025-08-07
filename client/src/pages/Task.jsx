import { useEffect, useState } from "react";
import {
  UserCircle, File, Clock, Users, CheckCircle2,
  MapPin, ListChecks, Calendar, Clock4, FileText,
  Pencil, Search, X, Filter, Plus, Menu
} from "lucide-react";
import { getProjects, getStats } from "../services/projectService";
import axios from "axios";
import TaskUpdateModal from "../components/TaskUpdateModal";
import ProjectReportModal from "../components/ProjectReportModal";

const priorityColors = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-700",
};

const statusColors = {
  "In Progress": "bg-blue-100 text-blue-700",
  Planning: "bg-yellow-100 text-yellow-800",
  "On Hold": "bg-gray-200 text-gray-700",
  Completed: "bg-green-100 text-green-700",
};

const Task = ({ setSidebarOpen }) => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedProject, setSelectedProject] = useState(null);
  const [reportProject, setReportProject] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ projectId: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const data = await getProjects();
    const s = await getStats();
    setProjects(data);
    setStats(s);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
  };

  const filteredProjects = projects.filter((proj) =>
    proj.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "All Status" || proj.status === statusFilter)
  );

  const openAddTaskModal = () => {
    if (projects.length === 0) {
      alert("No projects available to add tasks.");
      return;
    }
    setShowAddTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.projectId || !taskForm.name.trim()) {
      alert("Project and Task Name are required.");
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      await axios.post(
        `/api/projects/${taskForm.projectId}/tasks`,
        {
          name: taskForm.name,
          description: taskForm.description,
        }
      );

      alert("Task added successfully!");
      setShowAddTaskModal(false);
      setTaskForm({ projectId: "", name: "", description: "" });
      await fetchData();

    } catch (error) {
      console.error("Failed to add task:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white px-6 py-4 mb-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Supervisor - Task</h1>
        </div>
        <div className="flex items-center gap-10 mt-2 text-gray-600">
          <UserCircle size={20} className="cursor-pointer hover:text-green-600" />
        </div>
      </div>

      <div className="px-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Projects</h2>
          <p className="text-sm text-gray-600">Manage and track your assigned construction projects</p>
        </div>
        <button
          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2"
          onClick={openAddTaskModal}
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 px-4">
        <StatCard label="Assigned Projects" value={stats.assignedProjects || 0} icon={<File size={18} className="text-blue-600" />} />
        <StatCard label="Active Projects" value={stats.activeProjects || 0} icon={<Clock size={18} className="text-green-600" />} />
        <StatCard label="Total Workers" value={stats.totalWorkers || 0} icon={<Users size={18} className="text-purple-600" />} />
        <StatCard label="Avg. Progress" value={`${stats.avgProgress || 0}%`} icon={<CheckCircle2 size={18} className="text-red-600" />} />
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-8 mb-6 px-6">
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full max-w-md bg-white">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none"
          />
          {search && (
            <X size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setSearch("")} />
          )}
        </div>

        <Filter size={18} className="text-gray-600" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option>All Status</option>
          <option>In Progress</option>
          <option>Planning</option>
          <option>On Hold</option>
          <option>Completed</option>
        </select>

        <button onClick={clearFilters} className="text-sm px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800">
          Clear Filters
        </button>

        <span className="text-xs text-black border border-gray-400 bg-sidebar-gray rounded-xl px-2">
          {filteredProjects.length} Projects
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-12">
        {filteredProjects.map((proj) => {
          const completedTasks = proj.tasks?.filter((t) => t.isCompleted).length || 0;
          const totalTasks = proj.tasks?.length || 0;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div key={proj.projectId} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 text-lg">{proj.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[proj.status] || "bg-gray-200 text-gray-800"}`}>
                  {proj.status}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">{proj.clientCompany}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[proj.priority] || "bg-gray-200 text-gray-800"}`}>
                  {proj.priority}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium">Progress</p>
                <div className="h-2 bg-gray-200 rounded-full mt-1 mb-1">
                  <div className="h-2 bg-black rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-right text-gray-500">{progress}%</p>
              </div>

              <div className="mt-2 space-y-2 text-sm text-gray-700">
                <div className="flex gap-2 items-center"><MapPin size={14} /> {proj.location}</div>
                <div className="flex gap-2 items-center"><Users size={14} /> {proj.assignedWorkers} Workers</div>
                <div className="flex gap-2 items-center"><ListChecks size={14} /> {completedTasks}/{totalTasks} Tasks</div>
                <div className="flex gap-2 items-center"><Calendar size={14} /> {proj.startDate} - {proj.endDate}</div>
                <div className="flex gap-2 items-center"><Clock4 size={14} /> Updated: {proj.lastUpdated ? new Date(proj.lastUpdated).toLocaleDateString("en-GB") : "N/A"}</div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => setSelectedProject(proj)} className="flex-1 min-w-[110px] flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-1 hover:bg-gray-100">
                  <Pencil size={16} /> Update
                </button>
                <button onClick={() => setReportProject(proj)} className="flex-1 min-w-[110px] flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-1 hover:bg-gray-100">
                  <FileText size={16} /> Reports
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProject && (
        <TaskUpdateModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdated={fetchData}
        />
      )}
      {reportProject && (
        <ProjectReportModal
          project={reportProject}
          onClose={() => setReportProject(null)}
        />
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[420px] space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Add New Task</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={taskForm.projectId}
                onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj.projectId} value={proj.projectId}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                placeholder="Enter task name"
                value={taskForm.name}
                onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter task description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                onClick={() => {
                  setShowAddTaskModal(false);
                  setTaskForm({ projectId: "", name: "", description: "" });
                }}
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                onClick={handleSaveTask}
              >
                {saving ? "Saving..." : "Save Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className="mb-8">{icon}</div>
  </div>
);

export default Task;
