import api from './api';

export interface IWebsiteConfig {
    websiteConfigId?: number;
    siteName: string;
    email: string;
    phone: string;
    address: string;
}

export const getWebsiteConfig = async (): Promise<IWebsiteConfig> => {
    const response = await api.get("/admin/system/website");
    return response.data;
};