import api from "./api";

export const bannerService = {
    getHomeBanners: async () => {
        const response = await api.get("/banners/active");
        return response.data;
    }
};