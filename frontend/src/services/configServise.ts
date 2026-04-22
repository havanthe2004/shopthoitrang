import api from './api'
export const getWebsiteConfig = async () => {
    const response = await api.get("/admin/system/website")
    return response.data; 
};