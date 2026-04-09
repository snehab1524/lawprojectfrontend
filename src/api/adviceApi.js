import API from "./authApi.js";

export const askAdvice = async (data) => {
  const res = await API.post("/advice/ask", data);
  return res;
};

export const getMyAdvices = async () => {
  const res = await API.get("/advice/client");
  return res;
};

export const getAllAdvices = async () => {
  const res = await API.get("/advice");
  return res;
};

export const getPendingAdvices = async () => {
  const res = await API.get("/advice/pending");
  return res;
};

export const answerAdvice = async (id, answer) => {
  const res = await API.put(`/advice/${id}/answer`, { answer });
  return res;
};
