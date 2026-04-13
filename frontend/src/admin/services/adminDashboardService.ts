import adminApi from './adminApi';

export const adminDashboardService = {
    getDashboardData: async (filters: any) => {
        // Truyền object filters thành query string (?revFilter=...&revStart=...)
        const response = await adminApi.get('/admin/dashboard', { params: filters });
        return response.data;
    }
};