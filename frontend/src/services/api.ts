import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Request: gắn access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login") {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.replace('/login');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          'http://localhost:3000/api/auth/refresh-token',
          { refreshToken },
          { headers: { Authorization: '' } }
        );

        const { accessToken } = res.data;
        localStorage.setItem('token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.replace('/login');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

