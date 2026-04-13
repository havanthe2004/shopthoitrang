import adminApi from './adminApi';

export const adminCategoryService = {
    // Lấy danh sách có phân trang, tìm kiếm và lọc thùng rác
    getAllCategories: async (params: { page: number; limit: number; search: string; isTrash: boolean }) => {
        const response = await adminApi.get('/admin/categories', { params });
        return response.data; // { success, data: { items, total, totalPages, ... } }
    },

    // Lấy danh sách danh mục cấp 1 để làm Menu chọn Cha
    getLevel1Categories: async () => {
        const response = await adminApi.get('/admin/categories/level1');
        return response.data;
    },
    getLevel2Categories: async () => {
        const response = await adminApi.get('/admin/categories/level2');
        return response.data; 
    },

    // Thêm mới
    createCategory: async (data: any) => {
        const response = await adminApi.post('/admin/categories', data);
        return response.data;
    },

    // Cập nhật
    updateCategory: async (id: number, data: any) => {
        const response = await adminApi.put(`/admin/categories/${id}`, data);
        return response.data;
    },

    // Xóa mềm (Vào thùng rác)
    softDeleteCategory: async (id: number) => {
        const response = await adminApi.patch(`/admin/categories/${id}/soft-delete`);
        return response.data;
    },

    // Khôi phục
    restoreCategory: async (id: number) => {
        const response = await adminApi.patch(`/admin/categories/${id}/restore`);
        return response.data;
    }
};