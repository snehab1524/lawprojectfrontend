import API from './authApi.js';

const normalize = (payload) => Array.isArray(payload) ? payload : (payload.data || payload.items || []);
const normalizeChat = (chat) => ({
  ...chat,
  partner: chat?.partner || null,
  participants: Array.isArray(chat?.participants) ? chat.participants : [],
});

export const getMyChats = async () => {
  try {
    const res = await API.get('/chats/my');
    return normalize(res.data).map(normalizeChat);
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    return [];
  }
};

export const getOrCreateChat = async (otherUserId) => {
  const res = await API.post('/chats/chat', { otherUserId });
  return normalizeChat(res.data);
};

export const getChatMessages = async (chatId) => {
  const res = await API.get(`/chats/${chatId}/messages`);
  return normalize(res.data);
};

export const sendChatMessage = async (chatId, message) => {
  const res = await API.post(`/chats/${chatId}/messages`, { chatId, message });
  return res.data;
};

export default API;

