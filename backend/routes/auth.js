const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Supervisor = require('../models/Supervisor');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { supervisorId, name, password } = req.body;

  try {
    const existing = await Supervisor.findOne({ supervisorId });
    if (existing) {
      return res.status(400).json({ message: 'Supervisor ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSupervisor = new Supervisor({
      supervisorId,
      name,
      password: hashedPassword,
      tasks: [],
      employees: [],
    });

    await newSupervisor.save();

    res.status(201).json({ message: 'Supervisor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/login', async (req, res) => {
  const { supervisorId, password } = req.body;

  try {
    const supervisor = await Supervisor.findOne({ supervisorId });
    if (!supervisor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, supervisor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: supervisor.supervisorId }, 'secret', { expiresIn: '1h' });

    res.json({ token, supervisorId: supervisor.supervisorId, name: supervisor.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
