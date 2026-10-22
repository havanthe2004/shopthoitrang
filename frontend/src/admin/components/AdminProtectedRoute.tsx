import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { decodeAdminToken, isTokenExpired } from '../utils/adminTokenUtils';

interface AdminProtectedRouteProps {
    allowedRoles?: Array<'admin' | 'manager' | 'staff'>;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ allowedRoles }) => {
    const { currentAdmin, adminToken } = useSelector((state: RootState) => state.adminAuth);
    const token = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null);

    // 1. Kiểm tra tồn tại token
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    // 2. Giải mã và kiểm tra tính hợp lệ của token
    const tokenPayload = decodeAdminToken(token);
    if (!tokenPayload || isTokenExpired(token)) {
        return <Navigate to="/admin/login" replace />;
    }

    // 3. Lấy role bảo mật trực tiếp từ token
    const currentRole = currentAdmin?.role || tokenPayload.role;

    // 4. Nếu route yêu cầu danh sách quyền cụ thể
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(currentRole)) {
            // Chuyển hướng người dùng về trang mặc định phù hợp với quyền của họ
            const fallbackPath = currentRole === 'staff' ? '/admin/products' : '/admin/dashboard';
            return <Navigate to={fallbackPath} replace />;
        }
    }

    return <Outlet />;
};

export default AdminProtectedRoute;