import adminApi from "./adminApi";

export const adminPostService = {
    getAll: (params: any) => adminApi.get("/admin/posts", { params }),
    create: (formData: FormData) => adminApi.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    update: (id: number, formData: FormData) => adminApi.put(`/admin/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    delete: (id: number) => adminApi.delete(`/admin/posts/${id}`),
};