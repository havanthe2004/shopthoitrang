import adminApi from "./adminApi";

export const adminUserService = {
    // Lấy danh sách (Phân trang, search, lọc status)
    getAll: (params: { page: number, limit: number, status?: string, search?: string }) => {
        return adminApi.get("/admin/users", { params });
    },
    // Xem chi tiết người dùng
    getDetail: (id: number) => {
        return adminApi.get(`/admin/users/${id}`);
    },
    // Khóa hoặc Mở khóa (Xóa mềm)
    toggleStatus: (id: number, isActive: boolean) => {
        return adminApi.patch(`/admin/users/toggle-status/${id}`, { isActive });
    }
};