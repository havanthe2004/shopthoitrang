import api from './api';

export const loginAPI = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; // Trả về { accessToken, user }
};

export const registerAPI = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const forgotPasswordAPI = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

// Xác nhận OTP và đặt mật khẩu mới
export const resetPasswordAPI = async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
};