import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import AccountInfo from '../components/profile/AccountInfo';
import ChangePassword from '../components/profile/ChangePassword';
import AddressBook from '../components/profile/AddressBook';
import {
    User,
    Lock,
    MapPin,
    Package,
    LogOut,
    ChevronRight,
    Home,
    Shield,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'password' | 'address'>('info');
    const [addressCount, setAddressCount] = useState<number | null>(null);
    const [userData, setUserData] = useState<any>(null);

    const { currentUser } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Tự động cuộn lên đầu trang khi chuyển tab hoặc vào trang
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
            dispatch(logout());
            dispatch(clearCart());
            navigate('/login');
        }
    };

    const displayUser = userData || currentUser;
    const avatarUrl = displayUser?.avatar ? getImageUrl(displayUser.avatar) : "/avt_default/download.jpg";

    const menuItems = [
        {
            id: 'info',
            label: 'Thông tin cá nhân',
            desc: 'Quản lý tên, SĐT & ảnh đại diện',
            icon: <User className="w-4 h-4" />
        },
        {
            id: 'address',
            label: 'Sổ địa chỉ nhận hàng',
            desc: addressCount !== null ? `${addressCount} địa chỉ đã lưu` : 'Địa chỉ giao hàng',
            icon: <MapPin className="w-4 h-4" />,
            badge: addressCount !== null && addressCount > 0 ? addressCount : undefined
        },
        {
            id: 'password',
            label: 'Đổi mật khẩu',
            desc: 'Bảo mật tài khoản & đăng nhập',
            icon: <Lock className="w-4 h-4" />
        },
    ];

    const currentTabLabel = menuItems.find(m => m.id === activeTab)?.label || 'Thông tin cá nhân';

    // Trường hợp chưa đăng nhập
    if (!currentUser && !localStorage.getItem('token')) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 text-center shadow-xl border border-gray-100 space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                        <Lock className="w-9 h-9" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            Yêu cầu đăng nhập
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Vui lòng đăng nhập để xem và quản lý thông tin tài khoản cá nhân, sổ địa chỉ và lịch sử đơn hàng của bạn.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            to="/login"
                            className="w-full py-3.5 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-600 transition shadow-md"
                        >
                            Đăng nhập ngay
                        </Link>
                        <Link
                            to="/register"
                            className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200 transition"
                        >
                            Đăng ký tài khoản
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/70 pb-20">
            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b border-gray-200/80 sticky top-16 md:top-24 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Link to="/" className="flex items-center gap-1.5 hover:text-black transition-colors">
                            <Home className="w-3.5 h-3.5" />
                            <span>Trang chủ</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-gray-400">Tài khoản</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-red-600 font-bold">{currentTabLabel}</span>
                    </div>

                    <Link
                        to="/my-order"
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-red-600 transition"
                    >
                        <Package className="w-3.5 h-3.5 text-red-600" />
                        <span>Đơn hàng của tôi</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar */}
                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-36">
                        {/* User Identity Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-100 shadow-md bg-gray-100">
                                    <img
                                        src={avatarUrl}
                                        alt={displayUser?.name || "Avatar"}
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => {
                                            e.currentTarget.src = "/avt_default/download.jpg";
                                        }}
                                    />
                                </div>
                                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-black text-gray-900 truncate">
                                        {displayUser?.name || "Khách hàng"}
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {displayUser?.email}
                                </p>
                                {/* <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                                    ● Tài khoản đã kích hoạt
                                </p> */}
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 divide-y divide-gray-100">
                            <nav className="space-y-1.5 pb-2">
                                {menuItems.map((item) => {
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setActiveTab(item.id as any)}
                                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 text-left group ${isActive
                                                ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/10'
                                                : 'bg-white text-gray-700 hover:bg-red-50/60 hover:text-red-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl transition-colors ${isActive
                                                    ? 'bg-white/15 text-white'
                                                    : 'bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600'
                                                    }`}>
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-xs md:text-sm font-bold tracking-tight">
                                                        {item.label}
                                                    </p>
                                                    <p className={`text-[11px] font-medium transition-colors ${isActive ? 'text-neutral-400' : 'text-gray-400 group-hover:text-red-400'
                                                        }`}>
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {item.badge !== undefined && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white translate-x-0.5' : 'text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5'
                                                    }`} />
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Quick Link to My Orders */}
                                <Link
                                    to="/my-order"
                                    className="w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 text-left group bg-white text-gray-700 hover:bg-red-50/60 hover:text-red-600"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm font-bold tracking-tight">
                                                Đơn hàng của tôi
                                            </p>
                                            <p className="text-[11px] font-medium text-gray-400 group-hover:text-red-400">
                                                Theo dõi & tra cứu đơn hàng
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            </nav>

                            {/* Logout Action */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs md:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <div className="p-2 rounded-xl bg-red-100/60 text-red-600">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <span>Đăng xuất tài khoản</span>
                                </button>
                            </div>
                        </div>

                        {/* Customer Support Card */}
                        <div className="bg-gradient-to-br from-red-50/60 to-orange-50/30 rounded-3xl p-5 border border-red-100/80 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider">
                                <Shield className="w-4 h-4" />
                                <span>Hỗ trợ khách hàng</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Cần hỗ trợ thay đổi thông tin hoặc thắc mắc đơn hàng? Đội ngũ CSKH sẵn sàng phục vụ bạn.
                            </p>
                            <div className="pt-1">
                                <a
                                    href="tel:0796419162"
                                    className="text-xs font-black text-red-600 hover:underline"
                                >
                                    Hotline: 0796419162
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Right Main Content Card */}
                    <main className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 min-h-[560px]">
                        {activeTab === 'info' && (
                            <AccountInfo
                                onUserUpdated={(u) => setUserData(u)}
                            />
                        )}
                        {activeTab === 'password' && <ChangePassword />}
                        {activeTab === 'address' && (
                            <AddressBook
                                onAddressCountChanged={(count) => setAddressCount(count)}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;