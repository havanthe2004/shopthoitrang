import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn token tự động
axiosInstance.interceptors.request.use((config) => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    const { accessToken } = JSON.parse(user);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

export default axiosInstance;

