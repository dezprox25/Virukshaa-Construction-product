import html2pdf from "html2pdf.js";

const ProjectReportModal = ({ project, onClose }) => {
  if (!project) return null;

  const downloadPDF = () => {
    const report = document.getElementById("pdf-report");
    html2pdf().from(report).save(`${project.name}_report.pdf`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date) ? date.toLocaleDateString("en-GB") : "N/A";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative mx-4">
        <div id="pdf-report">
          <h2 className="text-2xl font-bold mb-4">{project.name} Report</h2>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><strong>Client:</strong> {project.clientCompany}</div>
            <div><strong>Status:</strong> {project.status}</div>
            <div><strong>Priority:</strong> {project.priority}</div>
            <div><strong>Location:</strong> {project.location}</div>
            <div><strong>Workers:</strong> {project.assignedWorkers}</div>
            <div><strong>Start Date:</strong> {formatDate(project.startDate)}</div>
            <div><strong>End Date:</strong> {formatDate(project.endDate)}</div>
            <div><strong>Last Updated:</strong> {project.lastUpdated ? new Date(project.lastUpdated).toLocaleDateString("en-GB") : "N/A"}</div>

          </div>

          <h3 className="font-semibold text-md mb-2">Tasks</h3>
          <table className="w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Task Name</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Completed</th>
                <th className="p-2 border">Completed Date</th>
              </tr>
            </thead>
            <tbody>
              {project.tasks.map((task) => (
                <tr key={task._id || task.name}>
                  <td className="p-2 border">{task.name}</td>
                  <td className="p-2 border">{task.description}</td>
                  <td className="p-2 border">{task.isCompleted ? "Yes" : "No"}</td>
                  <td className="p-2 border">
                    {task.completedDate ? formatDate(task.completedDate) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="text-right mt-4">
          <button
            onClick={downloadPDF}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mr-2"
          >
            Export as PDF
          </button>
          <button
            onClick={onClose}
            className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectReportModal;
