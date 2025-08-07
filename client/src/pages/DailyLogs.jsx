import React, { useEffect, useState } from "react";
import {
  Search, CalendarDays, Filter, Plus, Eye, Users, Image,
  FileText, StickyNote, ClipboardList, PenLine,
  PackageOpen, ShieldAlert, CloudSun, Pencil, UserCircle,
} from "lucide-react";
import { getProjects } from "../services/projectService";
import NewLogForm from "../components/NewLogForm";
import LogDetailsModal from "../components/LogDetailsModal";
import axios from "axios";

const DailyLogs = ({ setSidebarOpen }) => {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [editLog, setEditLog] = useState(null);
  const [attendanceByDate, setAttendanceByDate] = useState({});

  useEffect(() => {
    fetchLogs();
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("/api/materials");
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const fetchLogs = async () => {
    const data = await getProjects();
    setProjects(data);

    const allLogs = [];

    for (const project of data) {
      const projectId = project.projectId || project._id;
      const projectName = project.name;

      for (const task of project.tasks || []) {
        const taskId = task.taskId || task._id;
        const taskName = task.name;

        for (const log of task.workLogs || []) {
          allLogs.push({
            ...log,
            _id: log._id || log.id || log.logId,
            projectId,
            projectName,
            taskId,
            taskName,
          });
        }
      }
    }

    setLogs(allLogs);

    const uniqueDates = [...new Set(allLogs.map((log) => log.date))];
    const attendancePromises = uniqueDates.map((date) =>
      axios.get(`/api/attendance?date=${date}`).then((res) => ({
        date,
        employees: res.data.employees || [],
      }))
    );
    const attendanceResults = await Promise.all(attendancePromises);
    const attendanceMap = {};
    attendanceResults.forEach(({ date, employees }) => {
      attendanceMap[date] = employees;
    });
    setAttendanceByDate(attendanceMap);
  };

  const handleSubmitForApproval = async (log) => {
    if (!log.projectId || !log.taskId || !log._id) {
      alert("Invalid log data. Cannot submit.");
      return;
    }

    try {
      await axios.put(`/api/projects/${log.projectId}/tasks/${log.taskId}/worklogs/${log._id}`, {
        ...log,
        status: "submitted",
      });
      fetchLogs();
    } catch (err) {
      console.error("Failed to submit for approval:", err);
      alert("Error submitting log for approval.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setSelectedDate("");
  };

  const filterLogs = () => {
    return logs.filter(log => {
      const matchesStatus = statusFilter === "All Status" || log.status === statusFilter;
      const matchesSearch = searchTerm === "" || log.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = selectedDate === "" || new Date(log.date).toISOString().split("T")[0] === selectedDate;
      return matchesStatus && matchesSearch && matchesDate;
    });
  };

  const countLogs = (type) => {
    const today = new Date();
    const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);

    return logs.filter(log => {
      const logDate = new Date(log.date);
      if (type === "total") return true;
      if (type === "week") return logDate >= thisWeekStart && logDate <= thisWeekEnd;
      if (type === "pending") return log.status === "submitted";
      if (type === "draft") return log.status === "draft";
    }).length;
  };

  const getMaterialName = (idOrObject) => {
    if (!idOrObject) return "Unknown Material";
    if (typeof idOrObject === "object" && idOrObject.name) return idOrObject.name;

    const id = typeof idOrObject === "string" ? idOrObject : idOrObject._id;
    const material = materials.find((m) => m._id === id);
    return material ? material.name : "Unknown Material";
  };

  const normalize = (str) => (str || "").toLowerCase().trim();

  return (
    <div className="p-0 bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-10 bg-white px-6 py-5 shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-gray-600 hover:text-green-600 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800 mt-1">Supervisor - Daily Logs</h1>
        </div>
        <div className="flex items-center gap-8 text-gray-600">
          <UserCircle className="cursor-pointer hover:text-green-600" size={20} />
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Daily Logs</h2>
            <p className="text-sm text-gray-500">Record and manage daily work progress logs</p>
          </div>
          <button
  onClick={() => setShowForm(true)}
  className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap w-fit"
>
  <Plus size={16} /> New Log Entry
</button>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Logs" count={countLogs("total")} icon={<FileText />} iconColor="#3B82F6" />
          <StatCard label="This Week" count={countLogs("week")} icon={<CalendarDays />} iconColor="#10B981" />
          <StatCard label="Pending Approval" count={countLogs("pending")} icon={<ClipboardList />} iconColor="#F97316" />
          <StatCard label="Draft Logs" count={countLogs("draft")} icon={<StickyNote />} iconColor="#8B5CF6" />
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white border rounded-lg text-sm outline-none"
            />
          </div>

          <Filter size={16} className="text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded border text-sm bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded border text-sm bg-white"
          >
            <option>All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
          </select>
          <button
            onClick={clearFilters}
            className="text-sm text-white bg-black border px-3 py-2 rounded hover:opacity-90"
          >
            Clear Filters
          </button>
          <span className="text-xs text-black border border-black-600 px-2 rounded-full mb-1 bg-sidebar-gray">
            {filterLogs().length} Logs
          </span>
        </div>

        <div className="space-y-6">
          {filterLogs().map((log, index) => {
            const attendanceList = attendanceByDate[log.date] || [];

            const present = attendanceList.filter(
              (e) =>
                normalize(e.project) === normalize(log.projectName) &&
                ["present", "late", "half day"].includes(normalize(e.status))
            );

            const total = attendanceList.filter(
              (e) => normalize(e.project) === normalize(log.projectName)
            );

            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{log.projectName}</h3>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-6 mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} /> {new Date(log.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {present.length} / {total.length} Workers
                      </span>
                      <span className="flex items-center gap-1">
                        <Image size={14} /> {log.images?.length || 0} Photos
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    log.status === "submitted"
                      ? "bg-blue-100 text-blue-700"
                      : log.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </div>

                <div className="text-sm space-y-3">
                  <p className="flex items-start gap-2 text-black">
                    <ClipboardList size={16} className="mt-0.5" />
                    <span>
                      <strong className="block text-black">Work Progress:</strong>
                      <span className="text-gray-600 block">{log.workProgress}</span>
                    </span>
                  </p>

                  <div className="flex items-start gap-2 text-black">
                    <PackageOpen size={16} className="mt-0.5" />
                    <div>
                      <strong className="block text-black">Materials Used:</strong>
                      {Array.isArray(log.materialsUsed) && log.materialsUsed.length > 0 ? (
                        <ul className="text-gray-600 ml-4 list-disc">
                          {log.materialsUsed.map((item, idx) => (
                            <li key={idx}>
                              {item.name} – {item.quantity} {item.unit || ""}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-600 block">None</span>
                      )}
                    </div>
                  </div>

                  <p className="flex items-start gap-2 text-black">
                    <ShieldAlert size={16} className="mt-0.5" />
                    <span>
                      <strong className="block text-black">Safety Issues:</strong>
                      <span className="text-gray-600 block">{log.safetyIssues || "None"}</span>
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-black">
                    <CloudSun size={16} className="mt-0.5" />
                    <span>
                      <strong className="block text-black">Weather:</strong>
                      <span className="text-gray-600 block">{log.weather}</span>
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {log.status === "draft" ? (
                    <>
                      <button
                        onClick={() => setEditLog(log)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border rounded hover:bg-gray-100"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleSubmitForApproval(log)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded hover:opacity-90"
                      >
                        <PenLine size={16} /> Submit for Approval
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center gap-3 px-4 py-2 text-md border rounded-md hover:bg-gray-100"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && <NewLogForm onClose={() => { setShowForm(false); fetchLogs(); }} />}
      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          attendanceByDate={attendanceByDate}
        />
      )}
      {editLog && <NewLogForm editingLog={editLog} onClose={() => { setEditLog(null); fetchLogs(); }} />}
    </div>
  );
};

const StatCard = ({ label, count, icon, iconColor }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-start">
    <div>
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{count}</div>
    </div>
    <div className="mt-1">
      {icon && React.cloneElement(icon, { color: iconColor, size: 20 })}
    </div>
  </div>
);

export default DailyLogs;
