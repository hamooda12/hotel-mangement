import axios from "axios";
const API = "http://localhost:8080/api/auth";
export const refreshToken = async () => {
  const res = await axios.post(`${API}/refresh`, {
    refreshToken: localStorage.getItem("refreshToken"),
  });

  localStorage.setItem("accessToken", res.data.accessToken);

  return res.data;
};