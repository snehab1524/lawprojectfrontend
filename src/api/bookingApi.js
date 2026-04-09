import API from "./authApi.js";

const normalizeBooking = (booking) => ({
  ...booking,
  lawyerName:
    booking?.lawyerName ||
    booking?.lawyer?.User?.name ||
    booking?.lawyer?.user?.name ||
    booking?.lawyer?.name ||
    "Lawyer pending",
  lawyerSpecialization:
    booking?.lawyerSpecialization ||
    booking?.lawyer?.specialization ||
    "General Practice",
  clientName:
    booking?.clientName ||
    booking?.client?.name ||
    "Client",
});

export const getClientBookings = async (clientId) => {
  const res = await API.get(`/bookings/client/${clientId}`);
  const bookings = Array.isArray(res.data) ? res.data : [];
  return bookings.map(normalizeBooking);
};

export const getLawyerBookings = async (lawyerId) => {
  const res = await API.get(`/bookings/lawyer/${lawyerId}`);
  const bookings = Array.isArray(res.data) ? res.data : [];
  return bookings.map(normalizeBooking);
};

export const createBooking = async (bookingData) => {
  const res = await API.post("/bookings/create", bookingData);
  if (res.data.booking) {
    return {
      ...normalizeBooking(res.data.booking),
      caseId: res.data.caseId,
      caseCreated: res.data.caseCreated
    };
  }
  return normalizeBooking(res.data);
};

export const updateBookingStatus = async (id, status) => {
  const res = await API.put(`/bookings/update/${id}`, { status });
  return res.data; // Return full response with booking + caseId
};

export default API;
