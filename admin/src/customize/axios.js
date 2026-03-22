import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL

const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 10000,
});

// 👉 Request interceptor (gắn token)
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

// 👉 Response interceptor (bắt lỗi chung)
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - hết hạn token");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;