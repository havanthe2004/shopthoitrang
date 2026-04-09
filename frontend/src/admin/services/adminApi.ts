import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const adminApi = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Request Interceptor: Gắn Access Token của ADMIN vào header
adminApi.interceptors.request.use((config) => {
  // 🔥 SỬA Ở ĐÂY: Dùng đúng tên 'adminAccessToken'
  const adminAccessToken = localStorage.getItem('adminAccessToken');

  if (adminAccessToken) {
    config.headers.Authorization = `Bearer ${adminAccessToken}`;
  }
  return config;
});

// Response Interceptor: Xử lý lỗi 401 (Hết hạn Token)
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua nếu đang ở trang login của admin
    if (originalRequest.url === "/admin/auth/login") {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Tạm thời log out luôn nếu Access Token chết (Sau này bạn có thể ráp API refresh-token vào đây)
        // 🔥 SỬA Ở ĐÂY: Xóa đúng các biến đã lưu
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminInfo');
        
        // Đá về trang đăng nhập
        window.location.replace('/admin/login'); 
    }

    return Promise.reject(error);
  }
);

export default adminApi;