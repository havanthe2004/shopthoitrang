import api from "./api"


export const postService = {
    getAll: (params: any) => api.get('/posts', { params }),
    getDetail: (id: string) => api.get(`/posts/${id}`),
    getLatestPosts: () => api.get('/posts/posts-latest'),
};

