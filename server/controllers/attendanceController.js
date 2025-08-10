const Attendance = require("../models/Attendance");

exports.getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date query parameter is required" });

    const record = await Attendance.findOne({ date });
    if (!record) return res.json({ employees: [] });

    res.json({ employees: record.employees });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
};

exports.createAttendance = async (req, res) => {
  try {
    const { date, employees } = req.body;

    if (!date || !Array.isArray(employees)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const existing = await Attendance.findOne({ date });

    if (existing) {
      existing.employees = employees;
      await existing.save();
      return res.status(200).json({ message: "Attendance updated successfully", data: existing });
    }

    const attendanceId = await require("../utils/generateCustomId")(Attendance, "A");
    const newRecord = new Attendance({ attendanceId, date, employees });
    await newRecord.save();

    res.status(201).json({ message: "Attendance created successfully", data: newRecord });
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).json({ error: "Failed to save attendance" });
  }
};