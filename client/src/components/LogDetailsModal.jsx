import { X } from "lucide-react";
const LogDetailsModal = ({ log, onClose, attendanceByDate }) => {
  const attendanceList = attendanceByDate[log.date] || [];

  const totalWorkers = attendanceList.filter(
    (e) => e.project === log.projectName
  );
  const presentWorkers = attendanceList.filter(
    (e) =>
      e.project === log.projectName &&
      ["Present", "Late", "Half Day"].includes(e.status)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <div className="px-2">
          <h2 className="text-2xl font-semibold mb-4">Daily Log Details</h2>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><strong>Date:</strong> {log.date}</div>
            <div><strong>Status:</strong> {log.status}</div>
            <div><strong>Project:</strong> {log.projectName}</div>
            <div><strong>Task:</strong> {log.taskName}</div>
            <div><strong>Weather:</strong> {log.weather}</div>
            <div><strong>Safety Issues:</strong> {log.safetyIssues || "None"}</div>
            <div><strong>Total Workers:</strong> {totalWorkers.length}</div>
            <div><strong>Workers Present:</strong> {presentWorkers.length}</div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-1">All Workers (From Attendance)</div>
            <div className="text-sm bg-gray-50 p-2 rounded border">
              {totalWorkers.length > 0 ? (
                totalWorkers.map((e, i) => (
                  <div key={i}>• {e.name} ({e.status})</div>
                ))
              ) : (
                <div>No workers found for this project</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-1">Present Workers</div>
            <div className="text-sm bg-gray-50 p-2 rounded border">
              {presentWorkers.length > 0 ? (
                presentWorkers.map((e, i) => (
                  <div key={i}>• {e.name} ({e.status})</div>
                ))
              ) : (
                <div>No present workers found</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-1">Work Progress</div>
            <div className="border p-2 rounded bg-gray-50 text-sm">
              {log.workProgress}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-1">Materials Used</div>
            <div className="border p-2 rounded bg-gray-50 text-sm space-y-1">
              {Array.isArray(log.materialsUsed) && log.materialsUsed.length > 0 ? (
                log.materialsUsed.map((item, index) => (
                  <div key={index}>
                    • {item.name} – {item.quantity} {item.unit || ""}
                  </div>
                ))
              ) : (
                <div>None</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-1">Next Day Plan</div>
            <div className="border p-2 rounded bg-gray-50 text-sm">
              {log.nextDayPlan}
            </div>
          </div>

          {log.images?.length > 0 && (
            <div className="mb-4">
              <div className="font-semibold text-sm mb-1">Progress Photos</div>
              <div className="grid grid-cols-3 gap-2">
                {log.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.startsWith("blob:") ? img : `/uploads/${img}`}
                    alt={`log-img-${idx}`}
                    className="h-24 w-full object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="text-sm bg-white-200 border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
