const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProjectStats,
  updateTaskStatus,
  updateProjectStatusAndPriority,
  getProjectReport,
  getAllWorkLogs,
  createWorkLog,
  updateWorkLog,
  getWorkLogStats,
  addTaskToProject,
} = require('../controllers/projectController');

router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/:projectId/report', getProjectReport);
router.put('/:projectId/status', updateProjectStatusAndPriority);

router.put('/:projectId/tasks/:taskId', updateTaskStatus);

router.get('/worklogs', getAllWorkLogs);
router.get('/worklogs/stats', getWorkLogStats);
router.post('/:projectId/tasks/:taskId/worklogs', createWorkLog);
router.put('/:projectId/tasks/:taskId/worklogs/:logId', updateWorkLog);
router.post('/:projectId/tasks', addTaskToProject);

module.exports = router;
