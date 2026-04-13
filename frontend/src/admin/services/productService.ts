import adminApi from "./adminApi";

export const productService = {
  // 1. Lấy danh sách sản phẩm
  getProducts: (page: number, limit: number, search: string, categoryId?: string,isActive: boolean = true) => {
    return adminApi.get('/admin/products', {
      params: { page, limit, search, categoryId,isActive }
    });
  },

  // 2. Lấy chi tiết sản phẩm (Đã có logic hasOrders từ BE)
  getDetail: (id: string | number) => {
    return adminApi.get(`/admin/products/${id}`);
  },

  // 3. Thêm mới sản phẩm
  createProduct: (formData: FormData) => {
    return adminApi.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 4. Cập nhật sản phẩm (Logic chặn sửa size nếu có đơn hàng)
  updateFullProduct: (id: string | number, formData: FormData) => {
    return adminApi.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 5. Ẩn/Hiện toàn bộ sản phẩm
  toggleProduct: (productId: number) => {
    return adminApi.patch(`/admin/products/toggle/${productId}`);
  },

  // 6. Ẩn/Hiện từng biến thể (Size/Màu) lẻ
  toggleVariant: (variantId: number) => {
    return adminApi.patch(`/admin/products/toggle-variant/${variantId}`);
  },

  // 7. Khôi phục biến thể
  restoreVariant: (variantId: number) => {
    return adminApi.patch(`/admin/products/restore-variant/${variantId}`);
  }
};