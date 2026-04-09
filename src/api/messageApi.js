import API from './authApi.js';

const normalizeMessageList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.messages)) {
    return payload.messages;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const sendMessage = async (messageData) => {
  const res = await API.post('/messages/send', messageData);
  return res.data;
};

export const getMessagesByCase = async (caseId) => {
  const res = await API.get(`/messages/case/${caseId}`);
  return {
    items: normalizeMessageList(res.data),
    raw: res.data,
  };
};

export default API;
