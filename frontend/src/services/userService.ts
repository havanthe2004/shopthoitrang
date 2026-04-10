import api from './api';

export const getProfileAPI = async () => {
    const response = await api.get('/users/me');
    return response.data;
};


export const updateProfileAPI = async (formData: FormData) => {
    const response = await api.put('/users/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const changePasswordAPI = async (passwordData: object) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
};



export const getAddressesAPI = async () => {
    const response = await api.get('/users/addresses');
    return response.data;
};

// Thêm địa chỉ mới
export const addAddressAPI = async (addressData: object) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
};

// Cập nhật thông tin địa chỉ cụ thể
export const updateAddressAPI = async (addressId: number, addressData: object) => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
};

// Xóa địa chỉ
export const deleteAddressAPI = async (addressId: number) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
};

// Thiết lập địa chỉ mặc định (Sử dụng PATCH theo đúng Backend)
export const setDefaultAddressAPI = async (id: number) => {
    const response = await api.patch(`/users/addresses/${id}/default`);
    return response.data;
};