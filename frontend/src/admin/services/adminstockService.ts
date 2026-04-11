import adminApi from "./adminApi";

export const stockService = {
    getAll: (params: { page: number, limit: number, search?: string, lowStock?: boolean }) => {
        return adminApi.get("/admin/stock", { params });
    },
    update: (id: number, addStock: number) => {
        return adminApi.patch(`admin/stock/update/${id}`, { addStock }); 
    }
};