import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
const API_URL = import.meta.env.VITE_API_KEY;
const adminApi = axios.create({
  // baseURL: `import.meta.env.VITE_API_KEY/api`,\
  baseURL: `${API_URL}/api`,
});

// ==========================================
// 1. REQUEST INTERCEPTOR
// ==========================================
adminApi.interceptors.request.use((config) => {
  const adminAccessToken = localStorage.getItem('adminAccessToken');
  if (adminAccessToken) {
    config.headers.Authorization = `Bearer ${adminAccessToken}`;
  }
  return config;
});

// ==========================================
// 2. RESPONSE INTERCEPTOR (XỬ LÝ REFRESH TOKEN)
// ==========================================
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

        // 🔥 GỌI API REFRESH TOKEN (Dùng axios gốc để tránh interceptor này lặp lại)
        const res = await axios.post(`${API_URL}/api/admin/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        // Backend trả về accessToken mới
        const { accessToken } = res.data;

        // 1. Cập nhật vào LocalStorage
        localStorage.setItem('adminAccessToken', accessToken);

        // 2. Gắn token mới vào request cũ bị lỗi và thực hiện lại nó
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApi(originalRequest);

      } catch (refreshError) {
        // Nếu Refresh Token cũng hết hạn hoặc lỗi -> Xóa sạch và logout thật sự
        console.error("Refresh token expired or invalid:", refreshError);

        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminInfo');

        // Ép tải lại trang để Redux/State về null và đẩy ra trang login
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;