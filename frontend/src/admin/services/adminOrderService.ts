import adminApi from "./adminApi";

export const adminOrderService = {
    getAll: (params: { page: number, limit: number, status?: string, search?: string }) => {
        return adminApi.get("/admin/orders", { params });
    },
    

    updateStatus: (id: number, newStatus: string) => {
        return adminApi.patch(`/admin/orders/status/${id}`, { newStatus });
    },

    updatePayment: (id: number, newPaymentStatus: string) => {
        return adminApi.patch(`/admin/orders/payment/${id}`, { newPaymentStatus });
    }
};