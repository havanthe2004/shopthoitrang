import adminApi from "./adminApi";

export const adminManagementService = {
    getAll: (params: { page: number, limit: number, search?: string, role?: string, status?: string }) => {
        return adminApi.get("/admin/admin-management", { params });
    },
    create: (data: any) => {
        return adminApi.post("/admin/admin-management", data);
    },
    update: (id: number, data: any) => {
        return adminApi.put(`/admin/admin-management/${id}`, data);
    },
    toggleStatus: (id: number) => {
        return adminApi.patch(`/admin/admin-management/toggle/${id}`);
    }
};