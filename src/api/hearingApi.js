import API from './authApi.js';

const normalizeHearingList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.hearings)) {
    return payload.hearings;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const createHearing = async (hearingData) => {
  const res = await API.post('/hearings', hearingData);
  return res.data;
};

export const getUpcomingHearings = async () => {
  const res = await API.get('/hearings/upcoming');
  return normalizeHearingList(res.data);
};

export const getHearingsByCase = async (caseId) => {
  const res = await API.get(`/hearings/case/${caseId}`);
  return {
    items: normalizeHearingList(res.data),
    raw: res.data,
  };
};

export const updateHearing = async (id, updates) => {
  const res = await API.put(`/hearings/${id}`, updates);
  return res.data;
};

export const deleteHearing = async (id) => {
  const res = await API.delete(`/hearings/${id}`);
  return res.data;
};

export default API;
