import axios from "axios";
const API = " https://hotel-management-monolith-backend.onrender.com/api/auth";
export const refreshToken = async () => {
  const res = await axios.post(`${API}/refresh`, {
    refreshToken: localStorage.getItem("refreshToken"),
  });

  localStorage.setItem("accessToken", res.data.accessToken);

  return res.data;
};