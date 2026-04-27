import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminAuthState {
    currentAdmin: any | null;
    adminToken: string | null;
    adminRefreshToken: string | null;
}

const initialState: AdminAuthState = {
    currentAdmin: (typeof window !== 'undefined' && localStorage.getItem('adminInfo'))
        ? JSON.parse(localStorage.getItem('adminInfo') as string) : null,
    adminToken: (typeof window !== 'undefined') ? localStorage.getItem('adminAccessToken') : null,
    adminRefreshToken: (typeof window !== 'undefined') ? localStorage.getItem('adminRefreshToken') : null,
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        adminLoginSuccess: (state, action: PayloadAction<{ admin: string, token: string, refreshToken: string }>) => {
            state.currentAdmin = action.payload.admin;
            state.adminToken = action.payload.token;
            state.adminRefreshToken = action.payload.refreshToken;

            localStorage.setItem('adminInfo', JSON.stringify(action.payload.admin));
            localStorage.setItem('adminAccessToken', action.payload.token);
            localStorage.setItem('adminRefreshToken', action.payload.refreshToken);
        },

        updateAdminInfo: (state, action: PayloadAction<any>) => {
            state.currentAdmin = action.payload;
            // Cập nhật lại bản sao dưới LocalStorage để khi F5 không bị mất dữ liệu mới
            localStorage.setItem('adminInfo', JSON.stringify(action.payload));
        },

        // Action phụ để cập nhật lại token khi refresh thành công
        updateAdminAccessToken: (state, action: PayloadAction<string>) => {
            state.adminToken = action.payload;
            localStorage.setItem('adminAccessToken', action.payload);
        },

        adminLogout: (state) => {
            state.currentAdmin = null;
            state.adminToken = null;
            state.adminRefreshToken = null;

            localStorage.removeItem('adminInfo');
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
        },
    },
});

export const { adminLoginSuccess, adminLogout, updateAdminAccessToken,updateAdminInfo } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;