import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  UserCircle,
  CalendarDays,
  Clock3,
  UserCheck,
  Users,
  Download,
  XCircle,
  Clock4,
} from "lucide-react";

const Employee = ({ setSidebarOpen }) => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [projects, setProjects] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [filterProject, setFilterProject] = useState("All Projects");

  const [showModal, setShowModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", project: "", role: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (employees.length > 0 && date) {
      fetchAttendanceByDate(date);
    }
  }, [employees, date]);

  const fetchInitialData = async () => {
    try {
      const empRes = await axios.get("/api/employees");
      const projRes = await axios.get("/api/projects");

      setEmployees(empRes.data);

      const map = {};
      projRes.data.forEach((p) => {
        map[p.projectId] = p.name;
      });
      setProjectMap(map);
      setProjects(["All Projects", ...projRes.data.map((p) => p.name)]);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  const fetchAttendanceByDate = async (selectedDate) => {
    try {
      const res = await axios.get(`/api/attendance?date=${selectedDate}`);
      const freshStatuses = {};

      const records = res.data.employees || [];
      employees.forEach((emp) => {
        const match = records.find((a) => a.employeeId === emp.employeeId);
        freshStatuses[emp.employeeId] = {
          status: match?.status || "",
          inTime: match?.inTime || "",
          reason: match?.reason || "",
        };
      });

      setStatuses(freshStatuses);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleStatusChange = (id, status) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        ...(status !== "Late" && status !== "Half Day"
          ? { inTime: "", reason: "" }
          : {}),
      },
    }));
  };

  const handleSave = async () => {
    const attendance = employees.map((emp) => ({
      employeeId: emp.employeeId,
      name: emp.name,
      project: projectMap[emp.project] || emp.project,
      status: statuses[emp.employeeId]?.status || "Absent",
      inTime: statuses[emp.employeeId]?.inTime || "",
      reason: statuses[emp.employeeId]?.reason || "",
    }));

    const payload = {
      date,
      employees: attendance,
    };

    try {
      await axios.post("/api/attendance", payload);
      alert("Attendance saved successfully.");
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Error saving attendance.");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Employee Attendance", 14, 15);

    const tableData = filteredEmployees.map((emp) => {
      const status = statuses[emp.employeeId]?.status || "Absent";
      const inTime = statuses[emp.employeeId]?.inTime || "-";
      const reason = statuses[emp.employeeId]?.reason || "-";
      const projectName = projectMap[emp.project] || emp.project;
      return [emp.name, projectName, status, inTime, reason];
    });

    autoTable(doc, {
      startY: 20,
      head: [["Name", "Project", "Status", "In Time", "Reason"]],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`Attendance-${date}.pdf`);
  };

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.project || !newEmp.role) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await axios.post("/api/employees", newEmp);
      setShowModal(false);
      setNewEmp({ name: "", project: "", role: "" });
      fetchInitialData();
    } catch (err) {
      console.error("Error adding employee:", err);
      alert("Failed to add employee.");
    }
  };

  const filteredEmployees =
    filterProject === "All Projects"
      ? employees
      : employees.filter((emp) => {
          const name = projectMap[emp.project] || emp.project;
          return name === filterProject;
        });

  const presentCount = Object.values(statuses).filter(
    (s) => ["Present", "Late", "Half Day"].includes(s.status)
  ).length;

  const lateCount = Object.values(statuses).filter(
    (s) => s.status === "Late"
  ).length;

  // Replace only your existing return () JSX with this part:

return (
  <div className="min-h-screen bg-gray-50">
    <div className="sticky top-0 bg-white px-6 py-5 shadow flex items-center justify-between z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden block text-gray-700 hover:text-green-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800 mt-1">Supervisor - Employee</h1>
      </div>
      <UserCircle className="cursor-pointer hover:text-green-600 text-gray-600" size={20} />
    </div>

    <div className="px-6 pt-4 pb-3 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Attendance Management</h2>
        <p className="text-sm text-gray-500">Mark and track worker attendance</p>
      </div>
      <button className="px-4 py-2 bg-black text-white rounded-md" onClick={() => setShowModal(true)}>
        + Add Employee
      </button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 px-6">
      <div className="bg-white rounded-lg p-4 shadow border">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">Today's Present</div>
            <div className="text-xl font-semibold">{presentCount}/{employees.length}</div>
          </div>
          <UserCheck size={18} className="text-green-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow border">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">Late Comers</div>
            <div className="text-xl font-semibold">{lateCount}</div>
          </div>
          <Clock3 size={18} className="text-yellow-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow border">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">Weekly Avg</div>
            <div className="text-xl font-semibold">82%</div>
          </div>
          <CalendarDays size={18} className="text-blue-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow border">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">Motivational Tip</div>
            <div className="text-xs text-gray-700">"Attendance is a habit, not a chore."</div>
          </div>
          <Users size={18} className="text-purple-600 text-xl" />
        </div>
      </div>
    </div>

    <div className="px-6 pt-4 pb-4 flex flex-wrap items-center gap-3">
      <input type="date" className="px-3 py-2 border border-gray-300 rounded-md"
        value={date} onChange={(e) => setDate(e.target.value)} />
      <select className="px-3 py-2 border border-gray-300 rounded-md"
        value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
        {projects.map((p, idx) => (<option key={idx}>{p}</option>))}
      </select>
      <button className="px-3 py-2 bg-white border border-gray-300 rounded-md"
        onClick={() => {
          setFilterProject("All Projects");
          setDate(() => new Date().toISOString().split("T")[0]);
        }}>
        Clear Filters
      </button>
      <button className="px-3 py-2 bg-white border rounded-md flex items-center gap-1"
        onClick={handleExportPDF}>
        <Download size={16} /> Export PDF
      </button>
      <button className="ml-auto px-4 py-2 bg-black text-white rounded-md"
        onClick={handleSave}>
        Save Attendance
      </button>
    </div>

    <div className="px-2 sm:px-6 pb-10 overflow-x-auto">
      {filteredEmployees.length === 0 ? (
        <p className="text-center text-gray-500 text-sm">No employees found</p>
      ) : (
        <table className="min-w-full bg-white rounded-md shadow border border-gray-200 overflow-hidden">
          <thead className="bg-gray-100 rounded-md">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Project</th>
              <th className="p-3">Status</th>
              <th className="p-3">In Time</th>
              <th className="p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.employeeId} className="border-t text-sm even:bg-gray-50">
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{projectMap[emp.project] || emp.project}</td>
                <td className="p-3">
                  {["Present", "Absent", "Late", "Half Day"].map((label) => {
                    const config = {
                      Present: { icon: <UserCheck size={14} />, bg: "bg-green-100", text: "text-green-700" },
                      Absent: { icon: <XCircle size={14} />, bg: "bg-red-100", text: "text-red-700" },
                      Late: { icon: <Clock3 size={14} />, bg: "bg-yellow-100", text: "text-yellow-800" },
                      "Half Day": { icon: <Clock4 size={14} />, bg: "bg-blue-100", text: "text-blue-700" },
                    }[label];

                    return (
                      <button
                        key={label}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 mr-2 mb-1 rounded-full border whitespace-nowrap ${
                          statuses[emp.employeeId]?.status === label
                            ? `${config.bg} ${config.text} font-medium`
                            : "bg-gray-100 text-gray-600"
                        }`}
                        onClick={() => handleStatusChange(emp.employeeId, label)}
                      >
                        {config.icon} {label}
                      </button>
                    );
                  })}
                </td>
                <td className="p-3">
                  {["Late", "Half Day"].includes(statuses[emp.employeeId]?.status) && (
                    <input
                      type="time"
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={statuses[emp.employeeId]?.inTime || ""}
                      onChange={(e) =>
                        setStatuses((prev) => ({
                          ...prev,
                          [emp.employeeId]: {
                            ...prev[emp.employeeId],
                            inTime: e.target.value,
                          },
                        }))
                      }
                    />
                  )}
                </td>
                <td className="p-3">
                  {["Late", "Half Day"].includes(statuses[emp.employeeId]?.status) && (
                    <input
                      type="text"
                      placeholder="Reason"
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={statuses[emp.employeeId]?.reason || ""}
                      onChange={(e) =>
                        setStatuses((prev) => ({
                          ...prev,
                          [emp.employeeId]: {
                            ...prev[emp.employeeId],
                            reason: e.target.value,
                          },
                        }))
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

};

export default Employee;
