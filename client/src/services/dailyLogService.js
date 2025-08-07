import axios from 'axios';

const API = 'http://localhost:5000/api/projects';

export const fetchLogs = async () => (await axios.get(`${API}/worklogs`)).data;
export const fetchLogStats = async () => (await axios.get(`${API}/worklogs/stats`)).data;
export const createLog = async (projectId, taskId, data) =>
  (await axios.post(`${API}/${projectId}/tasks/${taskId}/worklogs`, data)).data;
