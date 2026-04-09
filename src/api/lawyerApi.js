import API from './authApi.js';

const normalizeLawyer = (lawyer) => ({
  id: lawyer?.id,
  profileId: lawyer?.id,
  userId: lawyer?.User?.id || lawyer?.userId || null,
  name: lawyer?.User?.name || lawyer?.name || 'Lawyer',
  email: lawyer?.User?.email || lawyer?.email || '',
  specialization: lawyer?.specialization || 'General Practice',
  experience: lawyer?.experience || 0,
  bio: lawyer?.bio || '',
  rating: Number(lawyer?.rating || 0),
  raw: lawyer,
});

export const getAllLawyers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await API.get(`/lawyers?${params}`);
  const lawyers = Array.isArray(response.data) ? response.data : [];
  return lawyers.map(normalizeLawyer);
};

export const getLawyers = getAllLawyers; // for ClientDashboard

export const getLawyerById = async (id) => {
  const response = await API.get(`/lawyers/${id}`);
  return response.data;
};

export const getTopRatedLawyers = async () => {
  const response = await API.get('/lawyers/top-rated');
  return response.data || [];
};

export const updateLawyerProfile = async (id, data) => {
  const response = await API.put(`/lawyers/${id}`, data);
  return response.data;
};

export const getLawyerDashboardStats = async (id) => {
  const response = await API.get(`/lawyers/${id}/stats`);
  return response.data;
};

