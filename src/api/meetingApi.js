import API from "./authApi.js";

const normalizeMeeting = (meeting) => ({
  ...meeting,
  title: meeting?.title || "Meeting",
  notes: meeting?.notes || "",
  start: meeting?.meetingDate ? new Date(meeting.meetingDate) : null,
  end: meeting?.endTime ? new Date(meeting.endTime) : (meeting?.meetingDate ? new Date(meeting.meetingDate) : null),
});

export const createMeeting = async (meetingData) => {
  const res = await API.post("/meetings/create", meetingData);
  return normalizeMeeting(res.data);
};

export const getClientMeetings = async (clientId) => {
  const res = await API.get(`/meetings/client/${clientId}`);
  return Array.isArray(res.data) ? res.data.map(normalizeMeeting) : [];
};

export const getLawyerMeetings = async (lawyerId) => {
  const res = await API.get(`/meetings/lawyer/${lawyerId}`);
  return Array.isArray(res.data) ? res.data.map(normalizeMeeting) : [];
};

export default API;
