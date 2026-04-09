import API from './authApi.js';

const normalizeLawyerProfile = (lawyer) => ({
  id: lawyer?.id,
  profileId: lawyer?.id,
  userId: lawyer?.UserId || lawyer?.userId || lawyer?.User?.id,
  name: lawyer?.fullName || lawyer?.User?.name || 'Lawyer',
  specialization: lawyer?.specialization || 'General Practice',
  experience: lawyer?.experience || 0,
  bio: lawyer?.bio || '',
  consultationFee: lawyer?.consultationFee || 0,
  availability: lawyer?.availability || [],
  location: lawyer?.location || '',
  profileImage: lawyer?.profileImage || 'https://i.pravatar.cc/150',
  rating: Number(lawyer?.rating || 0),
  raw: lawyer,
});

export const getMyLawyerProfile = async () => {
  const response = await API.get('/lawyer-profile/me');
  return normalizeLawyerProfile(response.data);
};

export const createOrUpdateLawyerProfile = async (data) => {
  const response = await API.post('/lawyer-profile/create-or-update', data);
  return normalizeLawyerProfile(response.data);
};

export const getAllLawyerProfiles = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await API.get(`/lawyer-profile/all?${params}`);
  const lawyers = Array.isArray(response.data) ? response.data : [];
  return lawyers.map(normalizeLawyerProfile);
};

export const getLawyerProfileById = async (id) => {
  const response = await API.get(`/lawyer-profile/${id}`);
  return normalizeLawyerProfile(response.data);
};
