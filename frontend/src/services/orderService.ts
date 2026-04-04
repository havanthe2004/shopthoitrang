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
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    /**
     * 3. Lấy chi tiết một đơn hàng
     * @param orderId ID của đơn hàng
     */
    getOrderDetail: async (orderId: number) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    /**
     * 4. Hủy đơn hàng (Nếu trạng thái còn là Pending)
     */
    cancelOrder: async (orderId: number) => {
        const response = await api.put(`/orders/cancel/${orderId}`);
        return response.data;
    }
};