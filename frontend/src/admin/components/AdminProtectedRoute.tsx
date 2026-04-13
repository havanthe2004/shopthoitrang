import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    // Tạm thời chúng ta check token trong localStorage.
    // Nếu bạn dùng Redux cho Admin (vd: state.adminAuth.token), bạn có thể lấy từ useSelector
    const adminToken = localStorage.getItem('adminAccessToken'); 

    // Nếu không có token -> Chuyển hướng về trang đăng nhập Admin
    if (!adminToken) {
        return <Navigate to="/admin/login" replace />;
    }

    // Nếu có token -> Cho phép đi tiếp vào giao diện Admin
    return <Outlet />;
};

export default AdminProtectedRoute;