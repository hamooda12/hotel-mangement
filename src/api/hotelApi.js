import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ================= HOTELS =================

export const getHotels = async () => {
  const response = await axios.get(`${API_BASE_URL}/hotels`);
  return response.data;
};

// ================= ROOM TYPES =================

export const getRoomTypes = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/room-types`, {
    params,
  });

  return response.data;
};

// ================= BOOKINGS =================

export const createBooking = async (bookingData) => {
  const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getBookingById = async (bookingId) => {
  const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getGuestBookingHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/bookings/guest-history`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await axios.patch(
    `${API_BASE_URL}/bookings/${bookingId}/cancel`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// ================= PAYMENTS =================

export const createPaymentIntent = async (paymentData) => {
  const response = await axios.post(
    `${API_BASE_URL}/payments/intent`,
    paymentData,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const simulatePayment = async (paymentId, outcome = "SUCCESS") => {
  const response = await axios.post(
    `${API_BASE_URL}/payments/${paymentId}/simulate`,
    {
      outcome,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getPayments = async () => {
  const response = await axios.get(`${API_BASE_URL}/payments`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};