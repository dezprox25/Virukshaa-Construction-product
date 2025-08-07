import React, { useState, useEffect } from "react";
import axios from "axios";

const AttendanceTable = ({ employees, attendanceData = [], selectedDate }) => {
  const [attendance, setAttendance] = useState([]);
  const [projectMap, setProjectMap] = useState({});

  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/projects");
        const map = {};
        res.data.forEach((proj) => {
          map[proj.projectId?.trim()] = proj.name;
        });
        setProjectMap(map);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  
  useEffect(() => {
    if (!employees || employees.length === 0) return;

    const filled = employees.map((emp) => {
      const existing = attendanceData?.find(
        (a) => a.employeeId?.trim() === emp.employeeId?.trim()
      );

      return {
        ...emp,
        status: existing?.status || "Absent",
        inTime: existing?.inTime || "",
        reason: existing?.reason || "",
      };
    });

    setAttendance(filled);
  }, [employees, attendanceData]);

  const handleChange = (index, field, value) => {
    const updated = [...attendance];
    updated[index][field] = value;

    
    if (field === "status" && (value === "Present" || value === "Absent")) {
      updated[index].inTime = "";
      updated[index].reason = "";
    }

    setAttendance(updated);
  };

  const saveAttendance = async () => {
    try {
      const cleanAttendance = attendance.map((emp) => ({
  ...emp,
  project: projectMap[emp.project?.trim()] || emp.project, 
}));

await axios.post("/api/attendance", {
  date: selectedDate,
  employees: cleanAttendance,
});
      alert("Attendance Saved Successfully!");
    } catch (err) {
      alert("Error saving attendance");
      console.error(err);
    }
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Project</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">In-Time</th>
            <th className="p-2 border">Reason</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((emp, i) => (
            <tr key={i} className="border-b">
              <td className="p-2 border">{emp.name}</td>
              <td className="p-2 border">
                {projectMap[emp.project?.trim()] || emp.project}
              </td>
              <td className="p-2 border">
                <select
                  className="border rounded p-1"
                  value={emp.status}
                  onChange={(e) => handleChange(i, "status", e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </td>
              <td className="p-2 border">
                <input
                  type="time"
                  className="border rounded p-1"
                  value={emp.inTime}
                  onChange={(e) => handleChange(i, "inTime", e.target.value)}
                  disabled={emp.status === "Present" || emp.status === "Absent"}
                />
              </td>
              <td className="p-2 border">
                <input
                  type="text"
                  className="border rounded p-1"
                  value={emp.reason}
                  onChange={(e) => handleChange(i, "reason", e.target.value)}
                  disabled={emp.status === "Present" || emp.status === "Absent"}
                  placeholder="Optional"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={saveAttendance}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Attendance
      </button>
    </div>
  );
};

export default AttendanceTable;
