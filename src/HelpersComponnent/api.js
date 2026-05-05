import axios from "axios";
import { refreshToken } from "..FunctionsofTheProject/RefrechToken";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        await refreshToken();

        err.config.headers.Authorization =
          "Bearer " + localStorage.getItem("accessToken");

        return api(err.config); // إعادة الطلب
      } catch (e) {
       
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;