import axios from "axios";

const API = "https://hotel-management-monolith-backend.onrender.com/api/auth";

export const refreshToken = async () => {
  const storedRefreshToken = localStorage.getItem("refreshToken");

  if (!storedRefreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await axios.post(`${API}/refresh`, {
    refreshToken: storedRefreshToken,
  });

  if (!res.data.accessToken) {
    throw new Error("Refresh response did not contain an access token");
  }

  localStorage.setItem("accessToken", res.data.accessToken);

  // Keep the new refresh token when the backend rotates it.
  if (res.data.refreshToken) {
    localStorage.setItem("refreshToken", res.data.refreshToken);
  }

  return res.data;
};
