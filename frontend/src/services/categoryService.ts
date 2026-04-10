import api from './api';

export const getCategoryTree = async () => {
    const response = await api.get('/categories/tree');
    return response.data;
};
