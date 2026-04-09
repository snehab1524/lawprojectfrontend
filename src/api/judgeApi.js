import axios from "axios";
import { API_BASE_URL } from "./apiConfig.js";

const API = axios.create({ baseURL: API_BASE_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getJudges = () => API.get("/judge/judges");

export const getJudgeById = (id) => API.get(`/judges/${id}`);

export const createJudge = (data) => API.post("/judges/create", data);

export const updateJudge = (id, data) => API.put(`/judges/${id}`, data);

export const deleteJudge = (id) => API.delete(`/judges/${id}`);
