import API from './authApi.js';

const normalizeTaskList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.tasks)) {
    return payload.tasks;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const createTask = async (taskData) => {
  const res = await API.post('/tasks', taskData);
  return res.data;
};

export const getTasksByCase = async (caseId) => {
  const res = await API.get(`/tasks/case/${caseId}`);
  return normalizeTaskList(res.data);
};

export const getTask = async (id) => {
  const res = await API.get(`/tasks/${id}`);
  return res.data?.task || res.data;
};

export const updateTask = async (id, updates) => {
  const res = await API.put(`/tasks/${id}`, updates);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await API.delete(`/tasks/${id}`);
  return res.data;
};

export const getPendingTasks = async (status = 'pending') => {
  const params = status && status !== 'pending' ? { status } : undefined;
  const res = await API.get('/tasks/pending', { params });
  return normalizeTaskList(res.data);
};

export default API;
