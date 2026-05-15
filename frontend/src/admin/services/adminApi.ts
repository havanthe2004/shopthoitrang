import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
const API_URL = import.meta.env.VITE_API_KEY;
const adminApi = axios.create({
  baseURL: `${API_URL}/api`,
});

// gắn token 
adminApi.interceptors.request.use((config) => {
  const adminAccessToken = localStorage.getItem('adminAccessToken');
  if (adminAccessToken) {
    config.headers.Authorization = `Bearer ${adminAccessToken}`;
  }
  return config;
});

// REFRESH token
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tránh vòng lặp vô tận nếu API login hoặc refresh-token bị lỗi 401
    if (
      originalRequest.url === "/admin/auth/login" ||
      originalRequest.url === "/admin/auth/refresh-token" 
    ) {
      return Promise.reject(error);
    }

    // Nếu lỗi 401 (Hết hạn Access Token) và chưa thử retry lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('adminRefreshToken');

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post(`${API_URL}/api/admin/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        const { accessToken } = res.data;

        localStorage.setItem('adminAccessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApi(originalRequest);

      } catch (refreshError) {
        console.error("Refresh token expired or invalid:", refreshError);

        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminInfo');

        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;