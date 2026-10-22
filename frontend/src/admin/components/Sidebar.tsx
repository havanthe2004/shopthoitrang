import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../redux/store';
import { adminLogout } from '../../redux/slices/adminAuthSlice';
import { adminAuthService } from '../services/adminAuthService';
import { decodeAdminToken } from '../utils/adminTokenUtils';
import {
    FaChartPie, FaList, FaBoxOpen, FaWarehouse,
    FaClipboardList, FaRegNewspaper, FaUsers,
    FaUserTie, FaCog, FaUserCircle, FaSignOutAlt, FaComments
} from 'react-icons/fa';

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentAdmin, adminToken } = useSelector((state: RootState) => state.adminAuth);
    const { pendingOrdersCount, unreadChatCount } = useSelector((state: RootState) => state.adminNotification);

    // Quyền được giải mã trực tiếp từ token hợp lệ, tuyệt đối không lấy từ localStorage
    const currentRole = useMemo(() => {
        if (currentAdmin?.role) return currentAdmin.role;
        const token = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null);
        const payload = decodeAdminToken(token);
        return payload?.role || 'staff';
    }, [currentAdmin?.role, adminToken]);

    // Cấu hình Menu và Phân quyền
    const menuItems = [
        { title: 'Tổng quan', path: '/admin/dashboard', icon: <FaChartPie />, roles: ['admin', 'manager'] },
        { title: 'Quản lý danh mục', path: '/admin/categories', icon: <FaList />, roles: ['admin', 'manager'] },
        { title: 'Quản lý sản phẩm', path: '/admin/products', icon: <FaBoxOpen />, roles: ['admin', 'manager', 'staff'] },
        { title: 'Quản lý tồn kho', path: '/admin/inventory', icon: <FaWarehouse />, roles: ['admin', 'manager', 'staff'] },
        { title: 'Xử lý đơn hàng', path: '/admin/orders', icon: <FaClipboardList />, roles: ['admin', 'manager', 'staff'] },
        { title: 'Quản lý tin tức', path: '/admin/posts', icon: <FaRegNewspaper />, roles: ['admin', 'manager'] },
        { title: 'Quản lý người dùng', path: '/admin/users', icon: <FaUsers />, roles: ['admin', 'manager'] },
        { title: 'Quản lý nhân viên', path: '/admin/staffs', icon: <FaUserTie />, roles: ['admin', "manager"] },
        { title: 'Tin nhắn', path: '/admin/chat', icon: <FaComments />, roles: ['admin', 'manager', 'staff'] },
    ];

    const settingItems = [
        { title: 'Cấu hình hệ thống', path: '/admin/settings', icon: <FaCog />, roles: ['admin'] },
        { title: 'Thông tin cá nhân', path: '/admin/profile', icon: <FaUserCircle />, roles: ['admin', 'manager', 'staff'] },
    ];

    // Hàm lọc menu dựa trên role hiện tại
    const filterMenuByRole = (items: any[]) => {
        return items.filter(item => item.roles.includes(currentRole));
    };


    const handleLogout = async () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?")) {
            try {
                // Lấy refresh token hiện tại
                const refreshToken = localStorage.getItem('adminRefreshToken');

                if (refreshToken) {
                    // Gọi API để Backend xóa token này trong Database
                    await adminAuthService.adminLogoutAPI(refreshToken);
                }
            } catch (error) {
                console.error("Lỗi khi đăng xuất backend:", error);
                // Dù lỗi mạng hay lỗi gì thì vẫn cứ tiếp tục xóa local để cho user thoát ra
            } finally {
                dispatch(adminLogout());
                // Chuyển hướng về trang đăng nhập
                navigate('/admin/login');
            }
        }
    };

    return (
        <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 h-screen sticky top-0 flex flex-col shadow-lg font-sans">
            <div className="h-20 flex items-center justify-center border-b border-gray-300">
                <h1 className="text-3xl font-black text-red-600 italic tracking-widest">Admin</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {/* Render menu chính đã được lọc theo quyền */}
                    {filterMenuByRole(menuItems).map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-6 py-3 text-sm font-bold transition-all
                                    ${isActive ? 'bg-red-50 text-red-600 border-r-4 border-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}
                                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.title}</span>

                                {item.path === '/admin/orders' && pendingOrdersCount > 0 && (
                                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-black leading-none text-white bg-red-600 rounded-full shadow-sm shadow-red-500/50 animate-pulse">
                                        {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                                    </span>
                                )}

                                {item.path === '/admin/chat' && unreadChatCount > 0 && (
                                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-black leading-none text-white bg-emerald-600 rounded-full shadow-sm shadow-emerald-500/50 animate-pulse">
                                        {unreadChatCount > 99 ? '99+' : unreadChatCount}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="my-4 border-t border-gray-300 mx-4 border-dashed"></div>

                <ul className="space-y-1">
                    {/* Render menu cài đặt đã được lọc theo quyền */}
                    {filterMenuByRole(settingItems).map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-6 py-3 text-sm font-bold transition-all
                                    ${isActive ? 'bg-red-50 text-red-600 border-r-4 border-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}
                                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.title}
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <span className="text-lg"><FaSignOutAlt /></span>
                            Đăng xuất
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;