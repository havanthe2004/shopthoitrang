import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { decodeAdminToken } from '../../admin/utils/adminTokenUtils';

export interface AdminUser {
    adminId: number;
    username: string;
    role: 'admin' | 'manager' | 'staff';
    avatar?: string;
    phone?: string;
    isActive?: boolean;
}

interface AdminAuthState {
    currentAdmin: AdminUser | null;
    adminToken: string | null;
    adminRefreshToken: string | null;
}

// Khởi tạo state: Tuyệt đối KHÔNG đọc role từ localStorage,
// mà giải mã trực tiếp từ adminAccessToken có chữ ký số bí mật của backend
const getInitialAdmin = (): AdminUser | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('adminAccessToken');
    if (!token) return null;

    const tokenPayload = decodeAdminToken(token);
    if (!tokenPayload) {
        return null;
    }

    const storedInfoStr = localStorage.getItem('adminInfo');
    let adminData: any = {};
    if (storedInfoStr) {
        try {
            adminData = JSON.parse(storedInfoStr);
            // Xóa triệt để 'role' khỏi localStorage nếu có tàn dư từ phiên bản cũ
            if (adminData.role) {
                delete adminData.role;
                localStorage.setItem('adminInfo', JSON.stringify(adminData));
            }
        } catch (e) {
            adminData = {};
        }
    }

    // Dọn dẹp bất kỳ key role độc lập nào trong localStorage
    localStorage.removeItem('role');
    localStorage.removeItem('adminRole');

    return {
        ...adminData,
        adminId: tokenPayload.adminId,
        role: tokenPayload.role // Luôn luôn lấy role từ token JWT!
    };
};

const initialState: AdminAuthState = {
    currentAdmin: getInitialAdmin(),
    adminToken: (typeof window !== 'undefined') ? localStorage.getItem('adminAccessToken') : null,
    adminRefreshToken: (typeof window !== 'undefined') ? localStorage.getItem('adminRefreshToken') : null,
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        adminLoginSuccess: (state, action: PayloadAction<{ admin: any, token: string, refreshToken: string }>) => {
            const tokenPayload = decodeAdminToken(action.payload.token);
            const role = tokenPayload?.role || 'staff';

            // Loại bỏ hoàn toàn trường role khỏi admin object trước khi lưu vào localStorage
            const { role: _discardRole, ...adminWithoutRole } = action.payload.admin || {};

            state.currentAdmin = {
                ...adminWithoutRole,
                adminId: tokenPayload?.adminId || adminWithoutRole.adminId,
                role: role // Role được xác định độc quyền từ JWT token
            };
            state.adminToken = action.payload.token;
            state.adminRefreshToken = action.payload.refreshToken;

            // Chỉ lưu adminInfo KHÔNG chứa role vào localStorage
            localStorage.setItem('adminInfo', JSON.stringify(adminWithoutRole));
            localStorage.setItem('adminAccessToken', action.payload.token);
            localStorage.setItem('adminRefreshToken', action.payload.refreshToken);

            // Xóa sạch mọi key role đơn lẻ
            localStorage.removeItem('role');
            localStorage.removeItem('adminRole');
        },

        updateAdminInfo: (state, action: PayloadAction<any>) => {
            const { role: _discardRole, ...adminWithoutRole } = action.payload || {};
            state.currentAdmin = {
                ...state.currentAdmin,
                ...adminWithoutRole,
                // Bảo vệ role: luôn giữ nguyên role được trích xuất từ token
                role: state.currentAdmin?.role || 'staff'
            };
            // Lưu bản cập nhật không chứa role vào localStorage
            localStorage.setItem('adminInfo', JSON.stringify(adminWithoutRole));
        },

        // Cập nhật lại token khi refresh thành công và đồng bộ role mới từ token
        updateAdminAccessToken: (state, action: PayloadAction<string>) => {
            state.adminToken = action.payload;
            localStorage.setItem('adminAccessToken', action.payload);

            const tokenPayload = decodeAdminToken(action.payload);
            if (tokenPayload?.role && state.currentAdmin) {
                state.currentAdmin.role = tokenPayload.role;
            }
        },

        adminLogout: (state) => {
            state.currentAdmin = null;
            state.adminToken = null;
            state.adminRefreshToken = null;

            localStorage.removeItem('adminInfo');
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('role');
            localStorage.removeItem('adminRole');
        },
    },
});

export const { adminLoginSuccess, adminLogout, updateAdminAccessToken, updateAdminInfo } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;