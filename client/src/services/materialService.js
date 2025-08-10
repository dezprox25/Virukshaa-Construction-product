
import axios from "axios";

export const getMaterials = async () => {
  const res = await axios.get("/api/materials");
  return res.data;
};

export const addMaterial = async (data) => {
  const res = await axios.post("/api/materials", data);
  return res.data;
};

export const getMaterialRequests = async () => {
  const res = await axios.get("/api/material-requests");
  return res.data;
};

export const requestMaterial = async (data) => {
  const res = await axios.post("/api/material-requests", data);
  return res.data;
};


export const updateMaterialRequest = async (id, data) => {
  const res = await axios.put(`/api/material-requests/${id}`, data);
  return res.data;
};

export const deleteMaterialRequest = async (id) => {
  const res = await axios.delete(`/api/material-requests/${id}`);
  return res.data;
};
