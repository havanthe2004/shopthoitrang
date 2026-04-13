// DTO cho việc tạo mới (Không cần ID vì mọi thứ đều là mới)
export interface CreateProductDTO {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  colors: {
    colorName: string;
    hexCode?: string;
    variants: {
      size: string;
      price: number;
      stock: number;
    }[];
    images: {
      url: string;
      isThumbnail: boolean;
    }[];
  }[];
}

// DTO cho việc cập nhật sâu (Bắt buộc có các ID để định danh)
export interface AdminUpdateProductDTO {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  isActive: boolean;
  colors: {
    productColorId?: number; // Có ID: Sửa/Giữ lại, Không có: Thêm mới
    colorName: string;
    hexCode?: string;
    variants: {
      productVariantId?: number;
      size: string;
      price: number;
      stock: number;
    }[];
    images: {
      productImageId?: number;
      url: string;
      isThumbnail: boolean;
    }[];
  }[];
}

// DTO cho query lọc và phân trang
export interface ProductQueryDTO {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  isActive?: string; // Thêm lọc trạng thái ẩn/hiện cho Admin
}