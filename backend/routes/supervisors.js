
const express = require('express');
const router = express.Router();
const Supervisor = require('../models/Supervisor');


router.get('/:id/employees', async (req, res) => {
  try {
    const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }
    res.json(supervisor.employees || []);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/:id/employees', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  supervisor.employees.push(req.body);
  await supervisor.save();
  res.json(supervisor.employees);
});


router.put('/:id/employees/:empId', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  const empIndex = supervisor.employees.findIndex(e => e._id.toString() === req.params.empId);
  if (empIndex !== -1) {
    supervisor.employees[empIndex] = { ...supervisor.employees[empIndex], ...req.body };
  }
  await supervisor.save();
  res.json(supervisor.employees);
});


router.patch('/:id/employees/:empId/status', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  const emp = supervisor.employees.id(req.params.empId);
  if (emp) emp.status = req.body.status;
  await supervisor.save();
  res.json(supervisor.employees);
});


router.delete('/:id/employees/:empId', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  supervisor.employees = supervisor.employees.filter(e => e._id.toString() !== req.params.empId);
  await supervisor.save();
  res.json(supervisor.employees);
});


router.get('/:id/tasks', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  res.json(supervisor.tasks || []);
});


router.post('/:id/tasks', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  supervisor.tasks.push(req.body);
  await supervisor.save();
  res.json(supervisor.tasks);
});


router.patch('/:id/tasks/update-work', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });

  const { employee, task, hours, description } = req.body;


  const update = {
    employee,
    task,
    hours: Number(hours),
    description,
    timestamp: new Date().toLocaleString(),
  };

  if (!supervisor.updates) supervisor.updates = [];
  supervisor.updates.unshift(update);


  const emp = supervisor.employees.find(e => e.name === employee);
  if (emp) emp.hours += Number(hours);

  await supervisor.save();
  res.json(supervisor.updates);
});


router.get('/:id/employees', async (req, res) => {
  const supervisor = await Supervisor.findOne({ supervisorId: req.params.id });
  res.json(supervisor.employees || []);
});

module.exports = router;
