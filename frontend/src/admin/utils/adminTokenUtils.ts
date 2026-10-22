export interface AdminTokenPayload {
    adminId: number;
    role: 'admin' | 'manager' | 'staff';
    exp?: number;
    iat?: number;
}

/**
 * Giải mã an toàn Payload của token JWT bên Admin (không cần thư viện ngoài)
 */
export const decodeAdminToken = (token: string | null): AdminTokenPayload | null => {
    if (!token || typeof token !== 'string') return null;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const parsed = JSON.parse(jsonPayload);
        if (!parsed || typeof parsed !== 'object') return null;

        return {
            adminId: parsed.adminId,
            role: parsed.role,
            exp: parsed.exp,
            iat: parsed.iat
        };
    } catch (err) {
        return null;
    }
};

/**
 * Kiểm tra xem token còn hạn hay không
 */
export const isTokenExpired = (token: string | null): boolean => {
    const payload = decodeAdminToken(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 < Date.now();
};

/**
 * Lấy role trực tiếp từ adminAccessToken đang lưu
 */
export const getAdminRoleFromToken = (): 'admin' | 'manager' | 'staff' | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('adminAccessToken');
    const payload = decodeAdminToken(token);
    return payload?.role || null;
};
