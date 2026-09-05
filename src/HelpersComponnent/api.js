import axios from "axios";

const API_BASE_URL = "https://hotel-management-monolith-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Prevent multiple simultaneous 401 responses from refreshing the same
// session more than once.
let refreshPromise = null;

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      })
      .then((response) => {
        const { accessToken, refreshToken } = response.data;

        if (!accessToken) {
          throw new Error("Refresh response did not contain an access token");
        }

        localStorage.setItem("accessToken", accessToken);

        // Support refresh-token rotation if the backend returns a new token.
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Do not attempt to refresh authentication requests themselves.
    const isAuthRequest = originalRequest.url?.includes("/auth/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearSession();

        // There is no /login route in App.jsx. Return to the home page where
        // the existing Sign In modal is available instead of navigating to a
        // non-existent route.
        if (window.location.pathname !== "/home") {
          window.location.assign("/home");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
