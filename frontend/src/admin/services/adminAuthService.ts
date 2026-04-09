import adminApi from './adminApi';

export const adminAuthService = {
    // Gọi API Đăng nhập
    adminLoginAPI: async (credentials: any) => {
        const response = await adminApi.post('/admin/auth/login', credentials);
        return response.data;
    },
    
    // Gọi API Đăng xuất (Truyền refreshToken lên để Backend xóa)
    adminLogoutAPI: async (refreshToken: string) => {
        const response = await adminApi.post('/admin/auth/logout', { refreshToken });
        return response.data;
    }
};