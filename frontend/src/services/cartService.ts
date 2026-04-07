import api from './api';
import { useParams } from 'react-router-dom';

export const cartService = {
    // Lưu sản phẩm vào MySQL thông qua Backend
    addToCart: async (productVariantId: number, quantity: number) => {
        const response = await api.post('/cart/add', { productVariantId, quantity });
        return response.data;
    },

    // Lấy toàn bộ giỏ hàng của User từ Database (Rất quan trọng khi F5 trang)
    getCart: async (page = 1, limit = 10) => {
        const response = await api.get(`/cart?page=${page}&limit=${limit}`);
        return response.data;
    },
    // Cập nhật số lượng item trong giỏ
    updateQuantity: async (productVariantId: number, quantity: number) => {
        const response = await api.put(`/cart/update/${productVariantId}`, { quantity });
        return response.data;
    },

    // Xóa sản phẩm khỏi giỏ
    removeFromCart: async (productVariantId: number) => {
        const response = await api.delete(`/cart/delete/${productVariantId}`);
        return response.data;
    }
};