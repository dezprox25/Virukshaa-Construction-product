const express = require('express');
const { getAllLogs, createOrUpdateLog, getAttendanceByProject } = require('../controllers/dailyLogController');
const router = express.Router();

router.get('/', getAllLogs);
router.post('/', createOrUpdateLog);
router.get('/attendance', getAttendanceByProject);

module.exports = router;
