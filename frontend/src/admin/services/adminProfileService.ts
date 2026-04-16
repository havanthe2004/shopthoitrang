import api from './adminApi'; // Sử dụng axios instance đã gom chung của bạn

export const adminProfileService = {

    getAdminProfile: async () => {
        const response = await api.get('/admin/profile/me');
        return response.data;
    },


    updateAdminProfile: async (data: any) => {
        const formData = new FormData();

        // Chỉ append nếu dữ liệu tồn tại để tránh gửi giá trị undefined lên BE
        if (data.username) formData.append('username', data.username);
        if (data.phone) formData.append('phone', data.phone);

        // Tên field 'avatar' phải khớp hoàn toàn với .single('avatar') ở Backend Route
        if (data.avatarFile) {
            formData.append('avatar', data.avatarFile);
        }

        if (data.oldPassword) formData.append('oldPassword', data.oldPassword);
        if (data.newPassword) formData.append('newPassword', data.newPassword);

        const response = await api.put('/admin/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};