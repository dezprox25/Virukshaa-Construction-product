import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import axios from "axios";
import { X, Trash2 } from "lucide-react";

const NewLogForm = ({ onClose, editingLog }) => {
  const [projects, setProjects] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(editingLog?.projectId || "");
  const [selectedTaskId, setSelectedTaskId] = useState(editingLog?.taskId || "");
  const [date, setDate] = useState(editingLog?.date?.split("T")[0] || new Date().toISOString().substr(0, 10));
  const [workersPresent, setWorkersPresent] = useState(editingLog?.workersPresent || []);

  const [form, setForm] = useState({
    workProgress: editingLog?.workProgress || "",
    materialsUsed: editingLog?.materialsUsed?.map((mat) => ({
  materialName: mat.materialName || mat.name || "",
  quantityUsed: mat.quantityUsed || mat.quantity || ""
})) || [],
    nextDayPlan: editingLog?.nextDayPlan || "",
    safetyIssues: editingLog?.safetyIssues || "None",
    weather: editingLog?.weather || "",
    images: editingLog?.images || [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const projectData = await getProjects();
      setProjects(projectData);
      const materialsRes = await axios.get("/api/materials");
      setMaterialsList(materialsRes.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find((p) => p.projectId === selectedProjectId);
      setTasks(proj?.tasks || []);
    }
  }, [selectedProjectId, projects]);

  useEffect(() => {
    if (selectedProjectId && date) {
      const fetchAttendance = async () => {
        try {
          const res = await axios.get(`/api/attendance?date=${date}`);
          const present = res.data?.employees?.filter(
            (e) =>
              (e.projectId === selectedProjectId || e.project === selectedProjectId) &&
              ["Present", "Late", "Half Day"].includes(e.status)
          );
          setWorkersPresent(present?.map((e) => e.name) || []);
        } catch (err) {
          console.error("Attendance fetch error:", err);
          setWorkersPresent([]);
        }
      };
      fetchAttendance();
    }
  }, [selectedProjectId, date]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
  };

  const handleAddMaterial = () => {
    setForm((prev) => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, { materialName: "", quantityUsed: "" }],
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...form.materialsUsed];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, materialsUsed: updated }));
  };

  const handleRemoveMaterial = (index) => {
    const updated = [...form.materialsUsed];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, materialsUsed: updated }));
  };

  const handleSave = async (status) => {
    if (!selectedProjectId || !selectedTaskId) {
      alert("Please select both project and task.");
      return;
    }

    const logData = {
      ...form,
      date,
      workersPresent,
      status,
      materialsUsed: form.materialsUsed.map((mat) => ({
        name: mat.materialName,
        quantity: mat.quantityUsed,
        unit: "Nos",
      })),
    };

    try {
      if (editingLog) {
        await axios.put(
          `/api/projects/${selectedProjectId}/tasks/${selectedTaskId}/worklogs/${editingLog.logId}`,
          logData
        );
      } else {
        await axios.post(
          `/api/projects/${selectedProjectId}/tasks/${selectedTaskId}/worklogs`,
          logData
        );
      }
      onClose();
    } catch (err) {
      console.error("Log save failed", err);
      alert("Failed to save log.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-12 z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">{editingLog ? "Update Log" : "New Log Entry"}</h2>
              <p className="text-sm text-gray-500">
                {editingLog ? "Edit the log details." : "Enter new log details."}
              </p>
            </div>
            <X className="cursor-pointer" onClick={onClose} />
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label>Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Task</option>
                  {tasks.map((t) => (
                    <option key={t.taskId} value={t.taskId}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Weather</label>
                <input
                  name="weather"
                  value={form.weather}
                  onChange={handleInput}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div>
              <label>Work Progress</label>
              <textarea
                name="workProgress"
                value={form.workProgress}
                onChange={handleInput}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label>Materials Used</label>
              {form.materialsUsed.map((mat, i) => (
                <div key={`mat-${i}`} className="flex items-center gap-2 mb-2">
                  <select
                    value={mat.materialName}
                    onChange={(e) => handleMaterialChange(i, "materialName", e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Material</option>
                    {materialsList.map((m) => (
                      <option key={m.materialId} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={mat.quantityUsed || ""}
                    onChange={(e) => handleMaterialChange(i, "quantityUsed", e.target.value)}
                    className="border p-2 rounded w-24"
                  />
                  <Trash2 className="text-red-500 cursor-pointer" onClick={() => handleRemoveMaterial(i)} />
                </div>
              ))}
              <button onClick={handleAddMaterial} className="text-sm text-blue-500 mt-1">
                + Add Material
              </button>
            </div>

            <div>
              <label>Safety Issues</label>
              <input
                name="safetyIssues"
                value={form.safetyIssues}
                onChange={handleInput}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label>Next Day Plan</label>
              <textarea
                name="nextDayPlan"
                value={form.nextDayPlan}
                onChange={handleInput}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label>Upload Images</label>
              <input type="file" multiple onChange={handleImageUpload} className="text-sm" />
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`img-${idx}`} className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button onClick={onClose} className="px-4 py-2 border rounded text-sm">
                Cancel
              </button>
              <button
                onClick={() => handleSave("draft")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave("submitted")}
                className="px-4 py-2 bg-black text-white rounded text-sm"
              >
                {editingLog ? "Update & Submit" : "Submit Log"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogForm;
