import api from './api';

export const orderService = {
    /**
     * 1. Tạo đơn hàng mới
     * @param orderData Bao gồm danh sách ID giỏ hàng, thông tin người nhận, phương thức thanh toán...
     * @returns Nếu là COD/Bank: trả về { orderId }
     * Nếu là VNPAY: trả về { url } để chuyển hướng
     */
    createOrder: async (orderData: any) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    /**
     * 2. Lấy danh sách đơn hàng của người dùng (Để hiển thị ở trang Profile)
     */
    // getMyOrders: async (status: string = 'all') => {
    //     const response = await api.get(`/orders/my-orders?status=${status}`);
    //     return response.data; // Trả về mảng các đơn hàng
    // },

    getMyOrders: async (status: string = 'all', page: number = 1,limit:number=10) => {
        const response = await api.get(`/orders/my-orders?status=${status}&page=${page}&limit=${limit}`);
        return response.data; // Trả về { success, data, pagination }
    },

    /**
     * 3. Lấy chi tiết một đơn hàng
     * @param orderId ID của đơn hàng
     */
    getOrderDetail: async (orderId: number) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    // Hủy đơn hàng (Chỉ dùng khi status = pending)
    cancelOrder: async (orderId: number) => {
        const response = await api.patch(`/orders/${orderId}/cancel`);
        return response.data;
    },
    // Trả hàng (Chỉ dùng khi status = completed)
    returnOrder: async (orderId: number) => {
        const response = await api.patch(`/orders/${orderId}/return`);
        return response.data;
    }
};
