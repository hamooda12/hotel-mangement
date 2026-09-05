import api from "../HelpersComponnent/api";

// Axios handles the access token through the shared request interceptor.
// Keeping authentication in one place prevents stale or missing headers.

// ================= HOTELS =================

export const getHotels = async () => {
  const response = await api.get("/hotels");
  return response.data;
};

export const createHotel = async (hotelData) => {
  const response = await api.post("/hotels", hotelData);
  return response.data;
};

export const deleteHotel = async (hotelId) => {
  const response = await api.delete(`/hotels/${hotelId}`);
  return response.data;
};

// ================= ROOM TYPES =================

export const getRoomTypes = async (params = {}) => {
  const response = await api.get("/room-types", { params });
  return response.data;
};

export const createRoomType = async (hotelId, roomData) => {
  const response = await api.post(`/hotels/${hotelId}/room-types`, roomData);
  return response.data;
};

export const updateRoomType = async (roomTypeId, roomData) => {
  const response = await api.put(`/room-types/${roomTypeId}`, roomData);
  return response.data;
};

export const deleteRoomType = async (roomTypeId) => {
  const response = await api.delete(`/room-types/${roomTypeId}`);
  return response.data;
};

// ================= BOOKINGS =================

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export const getGuestBookingHistory = async () => {
  const response = await api.get("/bookings/guest-history");
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`, {});
  return response.data;
};

// ================= PAYMENTS =================

export const createPaymentIntent = async (paymentData) => {
  const response = await api.post("/payments/intent", paymentData);
  return response.data;
};

export const simulatePayment = async (paymentId, outcome = "SUCCESS") => {
  const response = await api.post(`/payments/${paymentId}/simulate`, {
    outcome,
  });
  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

export const getPayments = async () => {
  const response = await api.get("/payments");
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};
