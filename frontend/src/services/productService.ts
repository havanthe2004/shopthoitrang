import api from './api';

export const getProductsAPI = async (params: { category?: string; sort?: string; minPrice?: string; maxPrice?: string }) => {
    const response = await api.get('/products', { params });
    return response.data;
};

export const getProductBySlug = async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
};