import axios from 'axios';

const API = 'http://localhost:5000/api/projects';

export const getStats = async () => (await axios.get(`${API}/stats`)).data;
export const getProjects = async () => (await axios.get(API)).data;
export const updateTaskStatus = async (projectId, taskId, data) => {
  return axios.put(`/api/projects/${projectId}/tasks/${taskId}`, data);
};export const getProjectReport = async (projectId) =>
  (await axios.get(`${API}/${projectId}/report`)).data;
export const getAllLogs = async () =>
  (await axios.get(`${API}/logs`)).data;

export const createWorkLog = async (projectId, taskId, log) =>
  (await axios.post(`${API}/${projectId}/tasks/${taskId}/logs`, log)).data;
export const addTaskToProject = async (projectId, taskData) => {
  const res = await fetch(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error("Failed to add task");
  return res.json();
};
