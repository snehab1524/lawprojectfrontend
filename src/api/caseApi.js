import API, { getCurrentUser as readStoredUser } from './authApi.js';

const buildParams = (params = {}) => {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

const normalizeListResponse = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.cases)) {
    return payload.cases;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const getCases = async (params = {}) => {
  const user = readStoredUser() || {};
  const role = user.role || 'admin';
  
  let endpoint = '/cases';
  if (role === 'client') {
    endpoint = '/cases/client';
  } else if (role === 'lawyer') {
    endpoint = '/cases/lawyer';
  }
  
  const response = await API.get(endpoint, { params: buildParams(params) });
  return {
    items: normalizeListResponse(response),
    raw: response.data,
  };
};


export const getCaseById = async (id) => {
  const response = await API.get(`/cases/${id}`);
  return response.data?.case || response.data;
};

export const getClientCases = async (clientId, params = {}) => {
  const response = await API.get(`/cases/client/${clientId}`, { params: buildParams(params) });
  return {
    items: normalizeListResponse(response),
    raw: response.data,
  };
};

export const getLawyerCases = async (lawyerId, params = {}) => {
  const response = await API.get(`/cases/lawyer/${lawyerId}`, { params: buildParams(params) });
  return {
    items: normalizeListResponse(response),
    raw: response.data,
  };
};

export const getLawyerCasesLoggedIn = async () => {
  const response = await API.get('/cases/lawyer');
  return normalizeListResponse(response);
};

export const getDashboardStats = async () => {
  const response = await API.get('/cases/stats');
  return response.data;
};

export const createCase = async (data) => {
  const response = await API.post('/cases/create', data);
  return response.data;
};

export const updateCase = async (id, data) => {
  const response = await API.put(`/cases/update/${id}`, data);
  return response.data;
};

export const addUpdate = async (id, text) => {
  const response = await API.post(`/cases/add-update/${id}`, { text });
  return response.data;
};

export const changeStatus = async (id, status) => {
  const response = await API.put(`/cases/status/${id}`, { status });
  return response.data;
};

export const assignLawyer = async (id, lawyerId) => {
  const response = await API.put(`/cases/assign-lawyer/${id}`, { lawyerId });
  return response.data;
};

export default API;
