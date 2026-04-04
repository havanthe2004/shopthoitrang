import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
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


// import axios from 'axios';
// import store from '@/redux/store';
// import { updateAccessToken } from '@/redux/slices/authSlice';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:3000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Gắn access token
// axiosInstance.interceptors.request.use((config) => {
//   const accessToken = localStorage.getItem('accessToken');
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// // Khi access token hết hạn
// axiosInstance.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     if (error.response?.status === 401) {
//       const refreshToken = localStorage.getItem('refreshToken');

//       try {
//         const res = await axios.post(
//           'http://localhost:3000/api/auth/refresh-token',
//           { refreshToken }
//         );

//         const newAccessToken = res.data.accessToken;

//         store.dispatch(updateAccessToken(newAccessToken));

//         error.config.headers.Authorization =
//           `Bearer ${newAccessToken}`;

//         return axiosInstance(error.config);
//       } catch {
//         // ❌ KHÔNG logout – chỉ đánh dấu session chết
//         localStorage.setItem('sessionExpired', 'true');
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

