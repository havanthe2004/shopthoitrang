import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../redux/store';
import { adminLogout } from '../../redux/slices/adminAuthSlice';
import { adminAuthService } from '../services/adminAuthService';
import { toast } from 'react-toastify';
import {
    LayoutDashboard,
    FolderTree,
    Package,
    PackagePlus,
    Warehouse,
    ClipboardList,
    Newspaper,
    Users,
    ShieldAlert,
    MessageSquare,
    Settings,
    UserCheck,
    Search,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    LogOut,
    X,
    Store
} from 'lucide-react';
import { FaUserShield } from 'react-icons/fa';

interface NavigationItem {
    path: string;
    title: string;
    subtitle: string;
    category: string;
    icon: React.ElementType;
    roles?: string[];
}

const MENU_ROUTES: NavigationItem[] = [
    {
        path: '/admin/dashboard',
        title: 'Tổng quan hệ thống',
        subtitle: 'Thống kê doanh số, đơn hàng và hiệu suất bán hàng',
        category: 'Báo cáo & Thống kê',
        icon: LayoutDashboard,
        roles: ['admin', 'manager']
    },
    {
        path: '/admin/categories',
        title: 'Quản lý danh mục',
        subtitle: 'Phân cấp danh mục sản phẩm và nhóm thời trang',
        category: 'Cửa hàng',
        icon: FolderTree,
        roles: ['admin', 'manager']
    },
    {
        path: '/admin/products',
        title: 'Quản lý sản phẩm',
        subtitle: 'Danh sách sản phẩm, giá bán, biến thể và trạng thái',
        category: 'Sản phẩm',
        icon: Package,
        roles: ['admin', 'manager', 'staff']
    },
    {
        path: '/admin/products/add',
        title: 'Thêm sản phẩm mới',
        subtitle: 'Đăng tải sản phẩm mới, thiết lập màu sắc & kích cỡ',
        category: 'Sản phẩm',
        icon: PackagePlus,
        roles: ['admin', 'manager', 'staff']
    },
    {
        path: '/admin/inventory',
        title: 'Quản lý kho hàng',
        subtitle: 'Kiểm soát tồn kho theo từng biến thể và cảnh báo hết hàng',
        category: 'Kho vận',
        icon: Warehouse,
        roles: ['admin', 'manager', 'staff']
    },
    {
        path: '/admin/orders',
        title: 'Xử lý đơn hàng',
        subtitle: 'Theo dõi tiến trình, xác nhận và cập nhật trạng thái đơn',
        category: 'Bán hàng',
        icon: ClipboardList,
        roles: ['admin', 'manager', 'staff']
    },
    {
        path: '/admin/posts',
        title: 'Quản lý tin tức',
        subtitle: 'Bài viết khuyến mãi, cẩm nang thời trang & tin tức',
        category: 'Nội dung',
        icon: Newspaper,
        roles: ['admin', 'manager']
    },
    {
        path: '/admin/users',
        title: 'Quản lý người dùng',
        subtitle: 'Danh sách khách hàng đăng ký và thông tin tài khoản',
        category: 'Khách hàng',
        icon: Users,
        roles: ['admin', 'manager']
    },
    {
        path: '/admin/staffs',
        title: 'Quản lý nhân viên',
        subtitle: 'Danh sách tài khoản quản trị và phân quyền chức vụ',
        category: 'Hệ thống',
        icon: ShieldAlert,
        roles: ['admin', 'manager']
    },
    {
        path: '/admin/chat',
        title: 'Tin nhắn hỗ trợ trực tuyến',
        subtitle: 'Tư vấn trực tiếp và phản hồi khách hàng theo thời gian thực',
        category: 'Chăm sóc khách hàng',
        icon: MessageSquare,
        roles: ['admin', 'manager', 'staff']
    },
    {
        path: '/admin/settings',
        title: 'Cấu hình hệ thống',
        subtitle: 'Thông tin cửa hàng, banner quảng cáo và chính sách',
        category: 'Hệ thống',
        icon: Settings,
        roles: ['admin']
    },
    {
        path: '/admin/profile',
        title: 'Thông tin cá nhân',
        subtitle: 'Quản lý hồ sơ cá nhân và đổi mật khẩu quản trị',
        category: 'Tài khoản',
        icon: UserCheck,
        roles: ['admin', 'manager', 'staff']
    }
];

const Header: React.FC = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY || '';
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentAdmin } = useSelector((state: RootState) => state.adminAuth);
    const { pendingOrdersCount, unreadChatCount } = useSelector((state: RootState) => state.adminNotification);
    const userRole = currentAdmin?.role || 'staff';

    // States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Refs for outside click
    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close popups on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Shortcut Ctrl+K / Cmd+K to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                searchInputRef.current?.focus();
            } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsProfileOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Current page info matching
    const currentPage = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith('/admin/products/edit')) {
            return {
                title: 'Chỉnh sửa sản phẩm',
                subtitle: 'Cập nhật thông tin chi tiết, màu sắc và biến thể sản phẩm',
                category: 'Sản phẩm',
                icon: Package
            };
        }
        const matched = MENU_ROUTES.find(item => item.path === path);
        if (matched) return matched;

        return {
            title: 'Trang quản trị',
            subtitle: 'Bảng điều khiển hệ thống quản trị cửa hàng',
            category: 'Admin',
            icon: LayoutDashboard
        };
    }, [location.pathname]);

    // Role display information
    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'admin':
                return {
                    label: 'Quản trị viên',
                    className: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100',
                    dotColor: 'bg-red-500'
                };
            case 'manager':
                return {
                    label: 'Quản lý',
                    className: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100',
                    dotColor: 'bg-amber-500'
                };
            case 'staff':
            default:
                return {
                    label: 'Nhân viên',
                    className: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100',
                    dotColor: 'bg-blue-500'
                };
        }
    };

    const roleInfo = getRoleBadge(userRole);

    // Filter search items
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return MENU_ROUTES.filter(item => !item.roles || item.roles.includes(userRole));
        }
        const q = searchQuery.toLowerCase().trim();
        return MENU_ROUTES.filter(item => {
            const hasRole = !item.roles || item.roles.includes(userRole);
            const matchesText = item.title.toLowerCase().includes(q) ||
                item.subtitle.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q);
            return hasRole && matchesText;
        });
    }, [searchQuery, userRole]);

    const handleLogout = async () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?")) {
            try {
                const refreshToken = localStorage.getItem('adminRefreshToken');
                if (refreshToken) {
                    await adminAuthService.adminLogoutAPI(refreshToken);
                }
            } catch (error) {
                console.error("Lỗi khi đăng xuất backend:", error);
            } finally {
                dispatch(adminLogout());
                toast.success("Đã đăng xuất thành công!");
                navigate('/admin/login');
            }
        }
    };

    const CurrentIcon = currentPage.icon;

    return (
        <header className="h-20 bg-white/85 backdrop-blur-xl border-b border-gray-200/70 flex items-center justify-between px-6 lg:px-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] sticky top-0 z-30 font-sans transition-all">
            {/* 1. LEFT: DYNAMIC PAGE TITLE & BREADCRUMB */}
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
                    <CurrentIcon size={22} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col min-w-0">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Link to="/admin/dashboard" className="hover:text-red-600 transition-colors">
                            Admin
                        </Link>
                        <ChevronRight size={12} className="text-gray-400" />
                        <span className="text-gray-400">{currentPage.category}</span>
                        <ChevronRight size={12} className="text-gray-400" />
                        <span className="text-red-600 font-semibold truncate">
                            {currentPage.title}
                        </span>
                    </div>

                    {/* Page Title */}
                    <h1 className="text-lg lg:text-xl font-black text-gray-900 tracking-tight leading-snug truncate mt-0.5">
                        {currentPage.title}
                    </h1>
                </div>
            </div>

            {/* 2. CENTER: QUICK SEARCH / COMMAND PALETTE */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative" ref={searchRef}>
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm nhanh chức năng, trang quản lý... (Ctrl + K)"
                        value={searchQuery}
                        onFocus={() => setIsSearchOpen(true)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-16 py-2 bg-gray-50/90 hover:bg-gray-100/80 focus:bg-white text-xs font-medium text-gray-800 placeholder-gray-400 border border-gray-200/80 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all shadow-inner"
                    />
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-md"
                        >
                            <X size={14} />
                        </button>
                    ) : (
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-200/70 border border-gray-300/50 rounded shadow-xs">
                            Ctrl K
                        </kbd>
                    )}
                </div>

                {/* SEARCH RESULTS DROPDOWN */}
                {isSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <span>Tính năng quản trị</span>
                            <span>{searchResults.length} kết quả</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
                            {searchResults.length > 0 ? (
                                searchResults.map((item, idx) => {
                                    const ItemIcon = item.icon;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                navigate(item.path);
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50/70 text-left transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-gray-600 transition-colors shrink-0">
                                                <ItemIcon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-gray-800 group-hover:text-red-600 truncate">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-6 text-center text-xs text-gray-400">
                                    Không tìm thấy trang quản trị phù hợp
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. RIGHT: ACTIONS & USER PROFILE */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* Storefront Link Button */}
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200/80 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all shadow-xs group"
                    title="Mở trang bán hàng cho khách hàng trong tab mới"
                >
                    <Store size={14} className="text-gray-500 group-hover:text-red-600 transition-colors" />
                    <span>Xem Cửa Hàng</span>
                    <ExternalLink size={12} className="text-gray-400 group-hover:text-red-500 ml-0.5" />
                </a>

                {/* Quick Orders Button */}
                <button
                    type="button"
                    onClick={() => navigate('/admin/orders')}
                    className="relative p-2.5 text-gray-600 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-200/80 transition-all shadow-xs"
                    title="Xử lý đơn hàng"
                >
                    <ClipboardList size={18} />
                    {pendingOrdersCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black leading-[18px] text-center text-white bg-red-600 rounded-full ring-2 ring-white shadow-xs animate-bounce">
                            {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                        </span>
                    )}
                </button>

                {/* Quick Chat Button */}
                <button
                    type="button"
                    onClick={() => navigate('/admin/chat')}
                    className="relative p-2.5 text-gray-600 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-200/80 transition-all shadow-xs"
                    title="Tin nhắn khách hàng"
                >
                    <MessageSquare size={18} />
                    {unreadChatCount > 0 ? (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black leading-[18px] text-center text-white bg-emerald-500 rounded-full ring-2 ring-white shadow-xs animate-pulse">
                            {unreadChatCount > 99 ? '99+' : unreadChatCount}
                        </span>
                    ) : (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200/80 mx-1 hidden sm:block" />

                {/* 4. ADMIN USER PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl transition-all border ${
                            isProfileOpen
                                ? 'bg-white border-gray-200 shadow-md ring-2 ring-red-500/10'
                                : 'border-transparent hover:border-gray-200/80 hover:bg-white shadow-none'
                        }`}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                {currentAdmin?.avatar ? (
                                    <img
                                        src={
                                            currentAdmin.avatar.startsWith('http')
                                                ? currentAdmin.avatar
                                                : `${BASE_URL}/${currentAdmin.avatar}`
                                        }
                                        alt="Admin Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => {
                                            e.currentTarget.src = "/avt_default/download.jpg";
                                        }}
                                    />
                                ) : (
                                    <FaUserShield className="text-gray-200" />
                                )}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${roleInfo.dotColor} rounded-full ring-2 ring-white`} />
                        </div>

                        {/* Name & Role Text */}
                        <div className="hidden sm:flex flex-col text-left justify-center min-w-[90px]">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-gray-900 truncate max-w-[110px]">
                                    {currentAdmin?.username || 'Quản trị viên'}
                                </span>
                            </div>
                            <div className="mt-0.5">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${roleInfo.className}`}>
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>

                        <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform duration-200 ${
                                isProfileOpen ? 'rotate-180 text-red-600' : ''
                            }`}
                        />
                    </button>

                    {/* USER PROFILE DROPDOWN MENU */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            {/* Profile Header Summary */}
                            <div className="p-4 bg-gradient-to-br from-gray-900 to-slate-800 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                                        {currentAdmin?.avatar ? (
                                            <img
                                                src={
                                                    currentAdmin.avatar.startsWith('http')
                                                        ? currentAdmin.avatar
                                                        : `${BASE_URL}/${currentAdmin.avatar}`
                                                }
                                                alt="avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e: any) => {
                                                    e.currentTarget.src = "/avt_default/download.jpg";
                                                }}
                                            />
                                        ) : (
                                            <FaUserShield size={20} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate">
                                            {currentAdmin?.username || 'Quản trị viên'}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[11px] text-slate-300 font-medium">
                                                {roleInfo.label} • Online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Links */}
                            <div className="p-2 space-y-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate('/admin/profile');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 hover:text-red-600 hover:bg-red-50/70 rounded-xl transition-colors"
                                >
                                    <UserCheck size={16} className="text-gray-400 group-hover:text-red-500" />
                                    <span>Hồ sơ cá nhân</span>
                                </button>

                                {userRole === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate('/admin/settings');
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 hover:text-red-600 hover:bg-red-50/70 rounded-xl transition-colors"
                                    >
                                        <Settings size={16} className="text-gray-400 group-hover:text-red-500" />
                                        <span>Cấu hình hệ thống</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate('/admin/chat');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 hover:text-red-600 hover:bg-red-50/70 rounded-xl transition-colors"
                                >
                                    <MessageSquare size={16} className="text-gray-400 group-hover:text-red-500" />
                                    <span>Hỗ trợ khách hàng</span>
                                </button>

                                <a
                                    href="/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:text-red-600 hover:bg-red-50/70 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Store size={16} className="text-gray-400" />
                                        <span>Xem trang bán hàng</span>
                                    </div>
                                    <ExternalLink size={13} className="text-gray-400" />
                                </a>
                            </div>

                            <div className="border-t border-gray-100 my-1" />

                            {/* Logout Action */}
                            <div className="p-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Đăng xuất tài khoản</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;