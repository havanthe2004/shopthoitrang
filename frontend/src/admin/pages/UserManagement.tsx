import { useEffect, useState, useMemo } from 'react';
import { adminUserService } from '../services/adminUserService';
import {
    Search,
    User,
    UserX,
    UserCheck,
    Eye,
    X,
    MapPin,
    Mail,
    Phone,
    Calendar,
    ShieldAlert,
    ShieldCheck,
    ShoppingBag,
    AlertCircle,
    RefreshCw,
    Copy,
    Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { getImageUrl } from '../../utils/imageUrl';

// ================= INTERFACES =================
interface AddressItem {
    addressId: number;
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
}

interface UserOrderItem {
    orderId: number;
    status: string;
    totalPrice: number | string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
}

interface UserItem {
    userId: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    addresses?: AddressItem[];
    orders?: UserOrderItem[];
}

interface ConfirmToggleState {
    isOpen: boolean;
    userId: number;
    userName: string;
    nextStatus: boolean;
}

const UserManagement = () => {
    // ================= STATES =================
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter & Pagination States
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        status: '',
        search: ''
    });
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

    // Detail Modal States
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState<'addresses' | 'orders'>('addresses');

    // Confirm Toggle (Lock/Unlock) Modal
    const [confirmToggle, setConfirmToggle] = useState<ConfirmToggleState>({
        isOpen: false,
        userId: 0,
        userName: '',
        nextStatus: false
    });

    // ================= DATA FETCHING =================
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminUserService.getAll({
                page: params.page,
                limit: params.limit,
                status: params.status || undefined,
                search: params.search.trim() || undefined
            });

            setUsers(res.data.items || []);
            setMeta(res.data.meta || { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch (err) {
            console.error('Lỗi tải danh sách người dùng:', err);
            toast.error('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.page, params.limit, params.status, params.search]);

    // ================= SUMMARY KPIS =================
    const stats = useMemo(() => {
        let active = 0;
        let blocked = 0;

        users.forEach((u) => {
            if (u.isActive) active += 1;
            else blocked += 1;
        });

        return {
            activeCount: active,
            blockedCount: blocked
        };
    }, [users]);

    // ================= HANDLERS =================
    const handleOpenDetail = async (userId: number) => {
        setDetailLoading(true);
        setIsDetailOpen(true);
        setActiveDetailTab('addresses');
        try {
            const res = await adminUserService.getDetail(userId);
            setSelectedUser(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể lấy thông tin chi tiết người dùng');
            setIsDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const triggerToggleStatus = (userId: number, userName: string, currentStatus: boolean) => {
        setConfirmToggle({
            isOpen: true,
            userId,
            userName,
            nextStatus: !currentStatus
        });
    };

    const handleConfirmToggle = async () => {
        if (!confirmToggle.isOpen) return;

        setSubmitting(true);
        try {
            await adminUserService.toggleStatus(confirmToggle.userId, confirmToggle.nextStatus);
            toast.success(
                confirmToggle.nextStatus
                    ? `Đã kích hoạt lại tài khoản "${confirmToggle.userName}" thành công!`
                    : `Đã tạm khóa tài khoản "${confirmToggle.userName}"`
            );
            setConfirmToggle({ isOpen: false, userId: 0, userName: '', nextStatus: false });
            setIsDetailOpen(false);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams((prev) => ({ ...prev, page }));
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.info(`Đã sao chép ${label}`);
    };

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(val) || 0);
    };

    const getOrderStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Chờ duyệt', css: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'approved':
                return { label: 'Đã duyệt', css: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'shipping':
                return { label: 'Đang giao', css: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            case 'completed':
                return { label: 'Hoàn tất', css: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'cancelled':
                return { label: 'Đã hủy', css: 'bg-rose-50 text-rose-700 border-rose-200' };
            case 'returned':
                return { label: 'Trả hàng', css: 'bg-gray-100 text-gray-700 border-gray-200' };
            default:
                return { label: status, css: 'bg-gray-50 text-gray-600 border-gray-200' };
        }
    };

    return (
        <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
            {/* ================= 1. EXECUTIVE WELCOME BANNER ================= */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white p-6 lg:p-8 shadow-xl border border-white/10">
                {/* Decorative background glows */}
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                            <span>Quản trị khách hàng</span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Hồ sơ tài khoản &amp; Phân quyền người dùng
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <Users className="text-red-500" size={32} />
                            Quản Lý Khách Hàng &amp; Người Dùng
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            Quản lý thông tin tài khoản người dùng, giám sát sổ địa chỉ, lịch sử mua sắm và kiểm soát trạng thái kích hoạt hoặc khóa tài khoản nhằm bảo vệ an toàn hệ thống.
                        </p>
                    </div>
                </div>

                {/* Micro Stat Chips */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <User className="text-red-400" size={14} />
                        <span className="text-neutral-300">Tổng tài khoản:</span>
                        <strong className="text-white font-extrabold">{meta.totalItems} người dùng</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-neutral-300">Đang hoạt động:</span>
                        <strong className="text-white font-extrabold">{stats.activeCount}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-neutral-300">Đang bị khóa:</span>
                        <strong className="text-white font-extrabold">{stats.blockedCount}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <span className="text-neutral-400">Trang:</span>
                        <strong className="text-white font-extrabold">
                            {params.page} / {meta.totalPages || 1}
                        </strong>
                    </div>
                </div>
            </div>

            {/* ================= 2. KPI SUMMARY CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Total Users */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng thành viên đăng ký</p>
                        <h3 className="text-2xl font-black text-gray-900">{meta.totalItems}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Toàn bộ tài khoản trong hệ thống</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
                        <Users size={22} />
                    </div>
                </div>

                {/* Card 2: Active Accounts */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Đang hoạt động</p>
                        <h3 className="text-2xl font-black text-emerald-600">{stats.activeCount}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Tài khoản hợp lệ, mua sắm bình thường</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-xs">
                        <ShieldCheck size={22} />
                    </div>
                </div>

                {/* Card 3: Blocked Accounts */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Đang bị khóa</p>
                        <h3 className="text-2xl font-black text-rose-600">{stats.blockedCount}</h3>
                        <p className="text-[11px] text-rose-500 font-bold">Bị vô hiệu hóa quyền đăng nhập</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/60 shadow-xs">
                        <ShieldAlert size={22} />
                    </div>
                </div>
            </div>

            {/* ================= 3. TOOLBAR: SEARCH & STATUS TABS ================= */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email hoặc số điện thoại..."
                        value={params.search}
                        onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs font-medium text-gray-800 rounded-2xl border border-gray-200 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all placeholder:text-gray-400"
                    />
                    {params.search && (
                        <button
                            type="button"
                            onClick={() => setParams({ ...params, search: '', page: 1 })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Tabs & Limit selector */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => setParams({ ...params, status: '', page: 1 })}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.status === ''
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Tất cả
                        </button>

                        <button
                            type="button"
                            onClick={() => setParams({ ...params, status: 'active', page: 1 })}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.status === 'active'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-emerald-700'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Hoạt động</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setParams({ ...params, status: 'blocked', page: 1 })}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.status === 'blocked'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-rose-700'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Bị khóa</span>
                        </button>
                    </div>

                    {/* Page Limit Selector */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
                        <span className="text-[11px] font-bold text-gray-400">Hiển thị:</span>
                        <select
                            value={params.limit}
                            onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
                            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer"
                        >
                            <option value={10}>10 người</option>
                            <option value={20}>20 người</option>
                            <option value={50}>50 người</option>
                            <option value={100}>100 người</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ================= 4. USERS TABLE ================= */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-4 pl-6 pr-4 w-24 text-center">Mã ID</th>
                                <th className="py-4 px-4 w-72">Khách hàng</th>
                                <th className="py-4 px-4 w-60">Liên hệ</th>
                                <th className="py-4 px-4 text-center w-40">Ngày tham gia</th>
                                <th className="py-4 px-4 text-center w-36">Trạng thái</th>
                                <th className="py-4 pr-6 pl-4 text-right w-40">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400">
                                        <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={24} />
                                        <span className="font-semibold text-xs">Đang tải danh sách người dùng...</span>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <User size={28} />
                                        </div>
                                        <p className="font-bold text-gray-700 text-sm">Không tìm thấy khách hàng nào</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                            {params.search || params.status
                                                ? 'Không có tài khoản nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.'
                                                : 'Hệ thống chưa có khách hàng nào đăng ký.'}
                                        </p>
                                        {(params.search || params.status) && (
                                            <button
                                                type="button"
                                                onClick={() => setParams({ ...params, search: '', status: '', page: 1 })}
                                                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold transition hover:bg-black active:scale-95 cursor-pointer shadow-sm"
                                            >
                                                <span>Đặt lại bộ lọc</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.userId}
                                        className={`group transition-colors ${
                                            !user.isActive ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-red-50/20'
                                        }`}
                                    >
                                        {/* ID */}
                                        <td className="py-4 pl-6 pr-4 text-center">
                                            <span className="font-mono font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                                                #{user.userId}
                                            </span>
                                        </td>

                                        {/* User Details */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-2xl border border-gray-200/80 bg-gray-50 overflow-hidden flex-shrink-0 shadow-2xs p-0.5">
                                                    <img
                                                        src={
                                                            user.avatar
                                                                ? getImageUrl(user.avatar)
                                                                : '/avt_default/download.jpg'
                                                        }
                                                        alt="avatar"
                                                        className="w-full h-full object-cover rounded-xl"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/avt_default/download.jpg';
                                                        }}
                                                    />
                                                </div>

                                                <div className="min-w-0 space-y-0.5">
                                                    <p
                                                        onClick={() => handleOpenDetail(user.userId)}
                                                        className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-xs line-clamp-1 cursor-pointer"
                                                        title={user.name}
                                                    >
                                                        {user.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="py-4 px-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-gray-700 font-semibold font-mono text-xs">
                                                    <Phone size={11} className="text-gray-400 flex-shrink-0" />
                                                    <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Created Date */}
                                        <td className="py-4 px-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold">
                                                <Calendar size={12} className="text-red-500" />
                                                <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                    user.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-600 border-rose-200'
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        user.isActive ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                                                    }`}
                                                />
                                                <span>{user.isActive ? 'Hoạt động' : 'Bị khóa'}</span>
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 pr-6 pl-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Lock / Unlock button */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        triggerToggleStatus(user.userId, user.name, user.isActive)
                                                    }
                                                    className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-2xs ${
                                                        user.isActive
                                                            ? 'bg-white hover:bg-rose-50 text-gray-500 hover:text-rose-600 border-gray-200 hover:border-rose-200'
                                                            : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-200'
                                                    }`}
                                                    title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                                                >
                                                    {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                                </button>

                                                {/* View Detail button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetail(user.userId)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                                                    title="Xem hồ sơ chi tiết"
                                                >
                                                    <Eye size={13} />
                                                    <span>Hồ sơ</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= 5. PAGINATION ================= */}
            <Pagination
                currentPage={params.page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={params.limit}
                onPageChange={handlePageChange}
                itemName="khách hàng"
            />

            {/* ================= 6. USER DETAIL MODAL ================= */}
            {isDetailOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white px-8 py-6 flex items-center justify-between border-b border-white/10">
                            {detailLoading || !selectedUser ? (
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="animate-spin text-red-500" size={20} />
                                    <span className="text-sm font-bold text-neutral-300">Đang tải hồ sơ...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl border-2 border-white/20 bg-white/10 p-0.5 overflow-hidden flex-shrink-0 shadow-lg">
                                        <img
                                            src={
                                                selectedUser.avatar
                                                    ? getImageUrl(selectedUser.avatar)
                                                    : '/avt_default/download.jpg'
                                            }
                                            alt={selectedUser.name}
                                            className="w-full h-full object-cover rounded-xl"
                                            onError={(e) => {
                                                e.currentTarget.src = '/avt_default/download.jpg';
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-black text-white">{selectedUser.name}</h2>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                                    selectedUser.isActive
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                                }`}
                                            >
                                                {selectedUser.isActive ? 'Đang hoạt động' : 'Đang bị khóa'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-neutral-300 flex items-center gap-2">
                                            <Calendar size={13} className="text-red-400" />
                                            <span>
                                                Thành viên từ:{' '}
                                                <strong className="text-white">
                                                    {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                                                </strong>
                                            </span>
                                            <span>•</span>
                                            <span className="font-mono text-neutral-400">
                                                ID: #USR-{selectedUser.userId}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsDetailOpen(false)}
                                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        {selectedUser && !detailLoading && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                {/* CỘT TRÁI: Account Info & Metrics (5 phần) */}
                                <div className="lg:col-span-5 p-6 lg:p-7 space-y-5 bg-gray-50/50">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                            Dữ liệu tài khoản
                                        </label>

                                        {/* Email Card */}
                                        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5">
                                                <Mail size={12} className="text-red-500" />
                                                Địa chỉ Email
                                            </span>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-gray-900 break-all">
                                                    {selectedUser.email}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(selectedUser.email, 'email')}
                                                    className="text-gray-400 hover:text-gray-700 p-1"
                                                    title="Sao chép email"
                                                >
                                                    <Copy size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Phone Card */}
                                        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5">
                                                <Phone size={12} className="text-red-500" />
                                                Số điện thoại
                                            </span>
                                            <p className="text-xs font-bold font-mono text-gray-900">
                                                {selectedUser.phone || 'Chưa cập nhật số điện thoại'}
                                            </p>
                                        </div>

                                        {/* Status Card */}
                                        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-gray-400 uppercase block">
                                                    Trạng thái đăng nhập
                                                </span>
                                                <p
                                                    className={`text-xs font-extrabold uppercase ${
                                                        selectedUser.isActive ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}
                                                >
                                                    {selectedUser.isActive ? 'Đang hoạt động' : 'Tài khoản đang bị khóa'}
                                                </p>
                                            </div>
                                            {selectedUser.isActive ? (
                                                <ShieldCheck size={28} className="text-emerald-500" />
                                            ) : (
                                                <ShieldAlert size={28} className="text-rose-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial & Order Stats Summary */}
                                    <div className="p-5 bg-gradient-to-br from-neutral-900 to-slate-800 rounded-3xl text-white shadow-lg space-y-3">
                                        <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                                                Hoạt động mua sắm
                                            </span>
                                            <ShoppingBag size={14} className="text-red-400" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                                    Đơn hàng đã đặt
                                                </span>
                                                <strong className="text-xl font-black text-white">
                                                    {selectedUser.orders?.length || 0}
                                                </strong>
                                            </div>

                                            <div>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                                    Tổng chi tiêu
                                                </span>
                                                <strong className="text-xl font-black text-emerald-400">
                                                    {formatCurrency(
                                                        selectedUser.orders?.reduce(
                                                            (sum, o) => sum + (Number(o.totalPrice) || 0),
                                                            0
                                                        ) || 0
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: Tabs Sổ địa chỉ & Lịch sử đơn hàng (7 phần) */}
                                <div className="lg:col-span-7 p-6 lg:p-7 space-y-4 bg-white overflow-y-auto">
                                    {/* Tabs */}
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDetailTab('addresses')}
                                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                                activeDetailTab === 'addresses'
                                                    ? 'bg-red-50 text-red-600 border border-red-200/80 shadow-2xs'
                                                    : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            Sổ địa chỉ ({selectedUser.addresses?.length || 0})
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setActiveDetailTab('orders')}
                                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                                activeDetailTab === 'orders'
                                                    ? 'bg-red-50 text-red-600 border border-red-200/80 shadow-2xs'
                                                    : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            Lịch sử đơn hàng ({selectedUser.orders?.length || 0})
                                        </button>
                                    </div>

                                    {/* TAB 1: SỔ ĐỊA CHỈ */}
                                    {activeDetailTab === 'addresses' && (
                                        <div className="space-y-3">
                                            {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                                                selectedUser.addresses.map((addr) => (
                                                    <div
                                                        key={addr.addressId}
                                                        className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative space-y-2 hover:border-gray-200 transition-colors"
                                                    >
                                                        {addr.isDefault && (
                                                            <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                                Mặc định
                                                            </span>
                                                        )}

                                                        <div className="flex items-start gap-3">
                                                            <MapPin
                                                                size={16}
                                                                className="text-red-500 flex-shrink-0 mt-0.5"
                                                            />
                                                            <div className="space-y-1 min-w-0 pr-16">
                                                                <p className="text-xs font-extrabold text-gray-900 uppercase">
                                                                    {addr.receiverName}
                                                                </p>
                                                                <p className="text-[11px] font-mono font-semibold text-gray-500">
                                                                    {addr.phone}
                                                                </p>
                                                                <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                                                    {addr.detailAddress}, {addr.ward}, {addr.district},{' '}
                                                                    {addr.province}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12 text-gray-400 space-y-2">
                                                    <MapPin size={32} className="mx-auto text-gray-300" />
                                                    <p className="text-xs font-bold text-gray-500">
                                                        Chưa có địa chỉ nào được lưu
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">
                                                        Khách hàng chưa thêm thông tin địa chỉ giao hàng vào hồ sơ.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 2: LỊCH SỬ ĐƠN HÀNG */}
                                    {activeDetailTab === 'orders' && (
                                        <div className="space-y-3">
                                            {selectedUser.orders && selectedUser.orders.length > 0 ? (
                                                selectedUser.orders.map((ord) => {
                                                    const statusBadge = getOrderStatusBadge(ord.status);
                                                    return (
                                                        <div
                                                            key={ord.orderId}
                                                            className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-black text-gray-900 text-xs">
                                                                        #ORD-{ord.orderId}
                                                                    </span>
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${statusBadge.css}`}
                                                                    >
                                                                        {statusBadge.label}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-400">
                                                                    {new Date(ord.createdAt).toLocaleDateString(
                                                                        'vi-VN'
                                                                    )}{' '}
                                                                    • {ord.paymentMethod}
                                                                </p>
                                                            </div>

                                                            <div className="text-right">
                                                                <strong className="text-sm font-black text-gray-900 block">
                                                                    {formatCurrency(ord.totalPrice)}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-12 text-gray-400 space-y-2">
                                                    <ShoppingBag size={32} className="mx-auto text-gray-300" />
                                                    <p className="text-xs font-bold text-gray-500">
                                                        Chưa có đơn hàng nào
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">
                                                        Khách hàng này chưa phát sinh đơn hàng nào trên website.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        {selectedUser && (
                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] font-mono text-gray-400 font-bold">
                                    Mã định danh: #USR-{selectedUser.userId}
                                </span>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsDetailOpen(false)}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white text-xs font-bold transition cursor-pointer"
                                    >
                                        Đóng
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            triggerToggleStatus(
                                                selectedUser.userId,
                                                selectedUser.name,
                                                selectedUser.isActive
                                            )
                                        }
                                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                                            selectedUser.isActive
                                                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                                        }`}
                                    >
                                        {selectedUser.isActive ? (
                                            <>
                                                <UserX size={15} />
                                                <span>Khóa tài khoản</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck size={15} />
                                                <span>Mở khóa tài khoản</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= 7. CONFIRM LOCK/UNLOCK MODAL ================= */}
            {confirmToggle.isOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
                                    confirmToggle.nextStatus
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}
                            >
                                <AlertCircle size={24} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-base font-black text-gray-900">
                                    {confirmToggle.nextStatus
                                        ? 'Mở khóa tài khoản khách hàng'
                                        : 'Khóa tài khoản khách hàng'}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {confirmToggle.nextStatus
                                        ? `Xác nhận kích hoạt lại tài khoản cho khách hàng "${confirmToggle.userName}"? Khách hàng sẽ có thể đăng nhập và mua sắm lại bình thường.`
                                        : `Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${confirmToggle.userName}"? Khách hàng sẽ không thể đăng nhập hoặc tiến hành đặt hàng.`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfirmToggle({
                                        isOpen: false,
                                        userId: 0,
                                        userName: '',
                                        nextStatus: false
                                    })
                                }
                                disabled={submitting}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmToggle}
                                disabled={submitting}
                                className={`px-5 py-2 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                                    confirmToggle.nextStatus
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                                }`}
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw size={13} className="animate-spin" />
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <span>
                                        {confirmToggle.nextStatus ? 'Kích hoạt lại' : 'Xác nhận khóa'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;