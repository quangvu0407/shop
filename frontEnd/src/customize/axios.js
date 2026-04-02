import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL

const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 10000,
});

// Request interceptor — gắn access_token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — tự động refresh khi 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      // Không có refresh token → logout
      if (!refreshToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang refresh → queue request lại
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${backendUrl}/user/refresh-token`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: new_refresh_token } = res.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("refresh_token", new_refresh_token);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
