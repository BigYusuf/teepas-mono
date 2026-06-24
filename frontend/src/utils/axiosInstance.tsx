import axios from "axios";
import { runRedirectToLogin } from "./redirect";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true, // sends httpOnly cookies
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
  originalRequest: any;
}> = [];

const MAX_RETRY_COUNT = 2; // ⛔️ prevent infinite refresh loops

// --- Helper: logout safely ---
const handleLogout = () => {
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const currentPath = window.location.pathname;
  if (!publicPaths.includes(currentPath)) {
    runRedirectToLogin();
  }
};

// --- Helper: retry all queued requests after refresh ---
const processQueue = (error: any = null) => {
  failedQueue.forEach(({ reject, resolve, originalRequest }) => {
    if (error) reject(error);
    else resolve(axiosInstance(originalRequest));
  });
  failedQueue = [];
};

// --- Interceptor: Response handler ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error?.response?.status === 401;

    // Ensure retry count is tracked
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Only handle 401 (unauthorized)
    if (is401 && originalRequest._retryCount < MAX_RETRY_COUNT) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      originalRequest._retryCount += 1;
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔄 Request new access token
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        processQueue(); // retry all pending requests
        return axiosInstance(originalRequest); // retry original
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
