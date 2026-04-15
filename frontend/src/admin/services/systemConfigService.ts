import adminApi from "./adminApi";

export const systemConfigService = {
    // Website
    getWebsite: () => adminApi.get("/admin/system/website"),
    updateWebsite: (data: any) => adminApi.put("/admin/system/website", data),
    
    // Banners
    getBanners: () => adminApi.get("/admin/system/banners"),
    addBanner: (formData: FormData) => adminApi.post("/admin/system/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    deleteBanner: (id: number) => adminApi.delete(`/admin/system/banners/${id}`),
    toggleBanner: (id: number) => adminApi.patch(`/admin/system/banners/${id}/toggle`)
};