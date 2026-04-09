import API from './authApi.js';

const normalizeDocumentList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.documents)) {
    return payload.documents;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const uploadDocument = async (formData) => {
  const res = await API.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getDocumentsByCase = async (caseId) => {
  const res = await API.get(`/documents/case/${caseId}`);
  return {
    items: normalizeDocumentList(res.data),
    raw: res.data,
  };
};

export const deleteDocument = async (id) => {
  const res = await API.delete(`/documents/${id}`);
  return res.data;
};

export default API;
