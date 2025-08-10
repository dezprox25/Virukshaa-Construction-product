const express = require("express");
const router = express.Router();
const {
  createAttendance,
  getAllAttendance
} = require("../controllers/attendanceController");

router.get("/", getAllAttendance);
router.post("/", createAttendance);

module.exports = router;
