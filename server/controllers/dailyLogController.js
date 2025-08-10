const Project = require('../models/Project');
const Attendance = require('../models/Attendance');


exports.getAllLogs = async (req, res) => {
  try {
    const projects = await Project.find();
    const allLogs = [];

    projects.forEach(project => {
      project.tasks.forEach(task => {
        task.workLogs.forEach(log => {
          allLogs.push({
            projectId: project._id,
            projectName: project.name,
            taskName: task.name,
            log,
          });
        });
      });
    });

    res.json(allLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

exports.createOrUpdateLog = async (req, res) => {
  const { projectId, taskName, date, logData } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const task = project.tasks.find(t => t.name === taskName);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const existingLog = task.workLogs.find(w => w.date.toISOString().slice(0, 10) === date);
    if (existingLog) {
      Object.assign(existingLog, logData); 
    } else {
      task.workLogs.push({ ...logData, date: new Date(date) }); 
    }

    await project.save();
    res.json({ success: true, message: "Log saved", project });
  } catch (err) {
    res.status(500).json({ error: "Failed to save log" });
  }
};

exports.getAttendanceByProject = async (req, res) => {
  const { date, project } = req.query;

  try {
    const record = await Attendance.findOne({ date });
    if (!record) return res.json({ present: [], total: 0 });

    const employees = record.employees.filter(e => e.project === project);
    const present = employees.filter(e => e.status === "Present");
    res.json({ present: present.map(p => p.name), total: employees.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
