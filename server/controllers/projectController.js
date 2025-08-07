const Project = require('../models/Project');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee'); 

const updateProjectStatusAndPriority = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (status) project.status = status;
    if (priority) project.priority = priority;
    project.lastUpdated = new Date().toISOString();

    await project.save();
    res.json({ message: "Project updated successfully", project });
  } catch (err) {
    console.error("Failed to update project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
};




const updateWorkLog = async (req, res) => {
  const { projectId, taskId, logId } = req.params;
  const updatedLog = req.body;

  try {
    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const task = project.tasks.find(t => t.taskId === taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const logIndex = task.workLogs.findIndex(l => l.logId === logId);
    if (logIndex === -1) return res.status(404).json({ error: "Log not found" });

    task.workLogs[logIndex] = { ...task.workLogs[logIndex], ...updatedLog };
    await project.save();

    res.status(200).json({ message: "Log updated successfully" });
  } catch (err) {
    console.error("Error updating work log:", err);
    res.status(500).json({ error: "Server error while updating log" });
  }
};




const getProjectStats = async (req, res) => {
  try {
    const projects = await Project.find();
    const totalWorkers = await Employee.countDocuments(); 

    const assignedProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;

    const totalProgress = projects.reduce((acc, p) => {
      const totalTasks = p.tasks.length;
      const completed = p.tasks.filter(t => t.isCompleted).length;
      return acc + (totalTasks > 0 ? (completed / totalTasks) * 100 : 0);
    }, 0);

    const avgProgress = projects.length > 0 ? (totalProgress / projects.length).toFixed(0) : 0;

    res.json({ assignedProjects, activeProjects, totalWorkers, avgProgress });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    const employees = await Employee.find();

    const updatedProjects = projects.map(project => {
      const workersOnThisProject = employees.filter(
        e => e.project.trim().toLowerCase() === project.name.trim().toLowerCase()
      );
      return {
        ...project.toObject(),
        assignedWorkers: workersOnThisProject.length,
      };
    });

    res.json(updatedProjects); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};



const updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { isCompleted } = req.body;

    const project = await Project.findOne({ projectId }); 
    if (!project) return res.status(404).json({ error: "Project not found" });

    const task = project.tasks.find(t => t.taskId === taskId); 
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.isCompleted = isCompleted;
    task.completedDate = isCompleted ? new Date().toISOString() : null;

    await project.save();
    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error("Failed to update task status:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
};

const getNextTaskId = (tasks = []) => {
  const ids = tasks.map((t) => parseInt(t.taskId?.slice(1) || 0)).filter(Boolean);
  const next = Math.max(...ids, 0) + 1;
  return `T${next.toString().padStart(3, "0")}`;
};

const addTaskToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const newTask = {
      taskId: getNextTaskId(project.tasks),
      name,
      description,
      isCompleted: false,
      workLogs: [],
    };

    project.tasks.push(newTask);
    await project.save();

    res.status(201).json(newTask);
  } catch (err) {
    console.error("Add Task Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



const getAllWorkLogs = async (req, res) => {
  try {
    const projects = await Project.find();
    const logs = [];

    projects.forEach(proj => {
      logs.push({
        _id: proj._id,
        name: proj.name,
        status: proj.status,
        priority: proj.priority,
        lastUpdated: proj.lastUpdated,
      });
    });

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

const Material = require('../models/Material'); 

const createWorkLog = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const log = req.body;

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const task = project.tasks.find(t => t.taskId === taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const existingIds = task.workLogs.map(l => parseInt(l.logId.replace("W", "")));
    const maxId = existingIds.length ? Math.max(...existingIds) : 0;
    log.logId = `W${String(maxId + 1).padStart(3, "0")}`;

    task.workLogs.push(log);
    await project.save();

    if (Array.isArray(log.materialsUsed)) {
      for (const used of log.materialsUsed) {
        const mat = await Material.findOne({ name: used.name });
        if (mat) {
          mat.currentStock = Math.max(0, mat.currentStock - Number(used.quantity || 0));
          await mat.save();
        }
      }
    }

    res.status(201).json({ message: "Log saved successfully", logId: log.logId });
  } catch (err) {
    console.error("Failed to save work log:", err);
    res.status(500).json({ error: "Failed to save work log" });
  }
};



const getWorkLogStats = async (req, res) => {
  try {
    const projects = await Project.find();
    let total = 0, drafts = 0, pending = 0, thisWeek = 0;

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    projects.forEach(proj => {
      proj.tasks.forEach(task => {
        task.workLogs.forEach(log => {
          total++;
          if (log.status === 'draft') drafts++;
          if (log.status === 'submitted') pending++;
          const d = new Date(log.date);
          if (d >= start && d <= end) thisWeek++;
        });
      });
    });

    res.json({ total, drafts, pending, thisWeek });
  } catch (err) {
    console.error("Error fetching log stats:", err);
    res.status(500).json({ error: "Failed to fetch work log stats" });
  }
};

const getProjectReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({
      project,
      date: new Date().toLocaleDateString(),
      completedTasks: project.tasks.filter(t => t.isCompleted),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get project report" });
  }
};

module.exports = {
  getProjectStats,
  getProjects,
  updateTaskStatus,
  getAllWorkLogs,
  createWorkLog,
  getWorkLogStats,
  getProjectReport,
  updateWorkLog,
  addTaskToProject,
  updateProjectStatusAndPriority, 
};
