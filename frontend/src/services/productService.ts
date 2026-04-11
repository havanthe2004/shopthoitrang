import api from './api';
// Ảnh theo màu
export interface ProductImage {
    productImageId: number;
    url: string;
}

// Màu
export interface ProductColor {
    productColorId: number;
    color: string;
    images: ProductImage[];
}

// Variant (size + price)
export interface ProductVariant {
    productVariantId: number;
    size: string;
    price: string;
    stock: number;
    color: {
        color: string;
    };
}

// Product
export interface Product {
    productId: number;
    name: string;
    slug: string;
    description: string;

    variants: ProductVariant[];
    colors: ProductColor[];
}

// Pagination
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Response list
export interface ProductListResponse {
    data: Product[];
    pagination: Pagination;
}

// ==============================
// QUERY PARAMS
// ==============================
export interface ProductQueryParams {
    category?: string;
    sort?: 'price-asc' | 'price-desc';
    minPrice?: number | string;
    maxPrice?: number | string;
    keyword?: string;
    page?: number;
    limit?: number;
}
export interface SearchResponse {
    success: boolean;
    data: Product[];
}
// ==============================
// API: GET LIST PRODUCTS
// ==============================
export const getProductsAPI = async (
    params: ProductQueryParams = {}
): Promise<ProductListResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
};

export const searchAPI = async (keyword: string,limit:number): Promise<SearchResponse> => {
    const response = await api.get(`/products/search?keyword=${keyword}&limit=${limit}`);
    return response.data;
};

// ==============================
// API: GET PRODUCT DETAIL
// ==============================
export const getProductBySlug = async (
    slug: string
): Promise<Product> => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
};