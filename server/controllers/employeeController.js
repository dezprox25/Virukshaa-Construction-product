const Employee = require('../models/Employee');
const Project = require('../models/Project');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    const projects = await Project.find({}, { projectId: 1, name: 1 });

    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.projectId?.trim()] = p.name;
    });

    const result = employees.map(emp => ({
      ...emp.toObject(),
      projectName: projectMap[emp.project?.trim()] || 'Unknown Project',
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, project, role } = req.body;

    const count = await Employee.countDocuments();
    const employeeId = `E${String(count + 1).padStart(3, "0")}`;

    const newEmp = new Employee({ employeeId, name, project, role });
    await newEmp.save();

    res.json(newEmp);
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};
