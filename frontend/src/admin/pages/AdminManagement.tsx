import React, { useEffect, useState, useMemo } from 'react';
import { adminManagementService } from '../services/adminManagementService';
import { useSelector } from 'react-redux';
import {
    Search,
    UserPlus,
    Phone,
    Power,
    RotateCcw,
    Edit,
    X,
    Save,
    User as UserIcon,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Users,
    Briefcase,
    Eye,
    EyeOff,
    CheckCircle2,
    Lock,
    Copy,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';
import { createAdminSchema, updateAdminSchema } from '../../schemas/addadminSchema';
import Pagination from '../components/Pagination';

// ================= TYPES & INTERFACES =================
interface AdminItem {
    adminId: number;
    username: string;
    role: 'staff' | 'manager' | 'admin';
    phone?: string;
    avatar?: string;
    isActive: boolean;
}

interface ConfirmToggleState {
    isOpen: boolean;
    adminId: number;
    username: string;
    role: string;
    isActive: boolean;
}

const AdminManagement: React.FC = () => {
    const { currentAdmin } = useSelector((state: RootState) => state.adminAuth);

    // ================= STATES =================
    const [admins, setAdmins] = useState<AdminItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter & Pagination
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: '',
        role: '',
        status: ''
    });
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

    // Modal Edit / Add
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'staff'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Confirm Toggle (Lock/Unlock) Dialog
    const [confirmToggle, setConfirmToggle] = useState<ConfirmToggleState>({
        isOpen: false,
        adminId: 0,
        username: '',
        role: '',
        isActive: false
    });

    // ================= DATA FETCHING =================
    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const queryParams: any = {
                page: params.page,
                limit: params.limit
            };
            if (params.search.trim()) queryParams.search = params.search.trim();
            if (params.role) queryParams.role = params.role;
            if (params.status) queryParams.status = params.status;

            const res = await adminManagementService.getAll(queryParams);
            setAdmins(res.data.items || []);
            setMeta(res.data.meta || { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi khi tải danh sách nhân sự');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAdmins();
        }, 350);
        return () => clearTimeout(timer);
    }, [params]);

    // ================= STATS COMPUTATION =================
    const stats = useMemo(() => {
        const total = meta.totalItems || admins.length;
        const active = admins.filter((a) => a.isActive).length;
        const blocked = admins.filter((a) => !a.isActive).length;
        return { total, active, blocked };
    }, [admins, meta.totalItems]);

    // ================= MODAL HANDLERS =================
    const openAddModal = () => {
        setEditingAdmin(null);
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            phone: '',
            role: 'staff'
        });
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsModalOpen(true);
    };

    const openEditModal = (admin: AdminItem) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            password: '',
            confirmPassword: '',
            phone: admin.phone || '',
            role: admin.role
        });
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
        setErrors({});
    };

    // ================= FORM SUBMISSION =================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const parsed = editingAdmin
                ? updateAdminSchema.parse(formData)
                : createAdminSchema.parse(formData);

            setErrors({});

            if (editingAdmin) {
                const updateData: any = {
                    role: parsed.role,
                    phone: parsed.phone
                };
                if (parsed.password) {
                    updateData.password = parsed.password;
                }
                await adminManagementService.update(editingAdmin.adminId, updateData);
                toast.success(`Cập nhật thông tin nhân viên "${editingAdmin.username}" thành công!`);
            } else {
                await adminManagementService.create(parsed);
                toast.success(`Tạo tài khoản nhân sự mới "${parsed.username}" thành công!`);
            }

            closeModal();
            fetchAdmins();
        } catch (err: any) {
            if (err.issues) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach((e: any) => {
                    if (e.path && e.path[0]) {
                        fieldErrors[e.path[0]] = e.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ================= TOGGLE STATUS (LOCK / UNLOCK) =================
    const triggerToggle = (admin: AdminItem) => {
        if (admin.adminId === currentAdmin?.adminId) {
            toast.warning('Bạn không thể tự khóa tài khoản của chính mình!');
            return;
        }
        if (admin.role === 'admin' && currentAdmin?.role !== 'admin') {
            toast.warning('Bạn không đủ thẩm quyền thay đổi trạng thái tài khoản Admin!');
            return;
        }

        setConfirmToggle({
            isOpen: true,
            adminId: admin.adminId,
            username: admin.username,
            role: admin.role,
            isActive: admin.isActive
        });
    };

    const handleConfirmToggle = async () => {
        if (!confirmToggle.isOpen) return;
        setSubmitting(true);
        try {
            await adminManagementService.toggleStatus(confirmToggle.adminId);
            toast.success(
                confirmToggle.isActive
                    ? `Đã tạm khóa tài khoản "${confirmToggle.username}"`
                    : `Đã kích hoạt lại tài khoản "${confirmToggle.username}" thành công!`
            );
            setConfirmToggle({ isOpen: false, adminId: 0, username: '', role: '', isActive: false });
            fetchAdmins();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
        } finally {
            setSubmitting(false);
        }
    };

    // ================= HELPERS =================
    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams((prev) => ({ ...prev, page }));
    };

    const handleCopyPhone = (phone?: string) => {
        if (!phone) return;
        navigator.clipboard.writeText(phone);
        toast.info(`Đã sao chép SĐT: ${phone}`);
    };

    const getAvatarSrc = (avatar?: string) => {
        if (!avatar) return '/avt_default/download.jpg';
        if (avatar.startsWith('http')) return avatar;
        const BASE_URL = import.meta.env.VITE_API_KEY || '';
        return `${BASE_URL}/${avatar}`;
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return {
                    label: 'Quản trị viên (Admin)',
                    shortLabel: 'Admin',
                    bg: 'bg-red-50 text-red-700 border-red-200/80',
                    dot: 'bg-red-500',
                    icon: ShieldCheck
                };
            case 'manager':
                return {
                    label: 'Quản lý (Manager)',
                    shortLabel: 'Quản lý',
                    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
                    dot: 'bg-amber-500',
                    icon: Briefcase
                };
            case 'staff':
            default:
                return {
                    label: 'Nhân viên (Staff)',
                    shortLabel: 'Nhân viên',
                    bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
                    dot: 'bg-blue-500',
                    icon: UserIcon
                };
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
                            <span>Quản trị hệ thống</span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Phân quyền &amp; Nhân sự nội bộ
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <Shield className="text-red-500" size={32} />
                            Quản Lý Nhân Viên &amp; Phân Quyền
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            Cấu hình tài khoản nội bộ, chỉ định vai trò quyền hạn (Admin, Quản lý, Nhân viên) và kiểm soát trạng thái đăng nhập hệ thống an toàn, chính xác.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                        >
                            <UserPlus size={18} />
                            <span>Thêm nhân sự mới</span>
                        </button>
                    </div>
                </div>

                {/* Micro Stat Chips */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Users className="text-red-400" size={14} />
                        <span className="text-neutral-300">Tổng nhân sự:</span>
                        <strong className="text-white font-extrabold">{meta.totalItems} thành viên</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-neutral-300">Đang hoạt động:</span>
                        <strong className="text-white font-extrabold">{stats.active}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-neutral-300">Đã khóa:</span>
                        <strong className="text-white font-extrabold">{stats.blocked}</strong>
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
                {/* Card 1: Total Staff */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng nhân sự nội bộ</p>
                        <h3 className="text-2xl font-black text-gray-900">{meta.totalItems}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Toàn bộ tài khoản trong ban điều hành</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
                        <Users size={22} />
                    </div>
                </div>

                {/* Card 2: Active Staff */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Đang hoạt động</p>
                        <h3 className="text-2xl font-black text-emerald-600">{stats.active}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Được phép đăng nhập bảng quản trị</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-xs">
                        <ShieldCheck size={22} />
                    </div>
                </div>

                {/* Card 3: Blocked Staff */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Tài khoản bị khóa</p>
                        <h3 className="text-2xl font-black text-rose-600">{stats.blocked}</h3>
                        <p className="text-[11px] text-rose-500 font-medium">Đã tạm đình chỉ quyền truy cập</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/60 shadow-xs">
                        <ShieldAlert size={22} />
                    </div>
                </div>
            </div>

            {/* ================= 3. TOOLBAR: SEARCH & FILTERS ================= */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên đăng nhập hoặc số điện thoại..."
                        value={params.search}
                        onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs font-medium text-gray-800 rounded-2xl border border-gray-200 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 transition-all placeholder:text-gray-400"
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

                {/* Filter Tabs & Limit */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => setParams({ ...params, role: '', page: 1 })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.role === ''
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Tất cả quyền
                        </button>

                        <button
                            type="button"
                            onClick={() => setParams({ ...params, role: 'admin', page: 1 })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.role === 'admin'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-red-700'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>Admin</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setParams({ ...params, role: 'manager', page: 1 })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.role === 'manager'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-amber-700'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Quản lý</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setParams({ ...params, role: 'staff', page: 1 })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.role === 'staff'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-blue-700'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span>Nhân viên</span>
                        </button>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => setParams({ ...params, status: '', page: 1 })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.status === ''
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Trạng thái
                        </button>

                        <button
                            type="button"
                            onClick={() => setParams({ ...params, status: 'active', page: 1 })}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                            onClick={() => setParams({ ...params, status: 'hidden', page: 1 })}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                params.status === 'hidden'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-rose-700'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Đã khóa</span>
                        </button>
                    </div>

                    {/* Page Limit Selector */}
                    <select
                        value={params.limit}
                        onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-2xl border border-gray-200 outline-none cursor-pointer transition-all"
                    >
                        <option value={10}>10 dòng / trang</option>
                        <option value={20}>20 dòng / trang</option>
                        <option value={50}>50 dòng / trang</option>
                    </select>
                </div>
            </div>

            {/* ================= 4. STAFF DATA TABLE ================= */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-500">
                                <th className="py-4 px-6">Nhân sự &amp; Tài khoản</th>
                                <th className="py-4 px-6">Vai trò / Quyền hạn</th>
                                <th className="py-4 px-6">Số điện thoại</th>
                                <th className="py-4 px-6">Trạng thái</th>
                                <th className="py-4 px-6 text-right">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-xs">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-gray-200 rounded-2xl" />
                                                <div className="space-y-1.5">
                                                    <div className="w-28 h-3.5 bg-gray-200 rounded-md" />
                                                    <div className="w-16 h-2.5 bg-gray-100 rounded-md" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="w-24 h-6 bg-gray-200 rounded-lg" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="w-24 h-3.5 bg-gray-200 rounded-md" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="w-20 h-6 bg-gray-200 rounded-full" />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="w-16 h-7 bg-gray-200 rounded-xl ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="w-14 h-14 mx-auto rounded-3xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center shadow-xs">
                                                <Users size={26} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-800">Không tìm thấy nhân sự phù hợp</p>
                                                <p className="text-xs text-gray-400">
                                                    Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái / vai trò.
                                                </p>
                                            </div>
                                            {(params.search || params.role || params.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setParams({ ...params, search: '', role: '', status: '', page: 1 })}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 underline pt-1 cursor-pointer"
                                                >
                                                    Xóa tất cả bộ lọc
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => {
                                    const roleInfo = getRoleBadge(admin.role);
                                    const RoleIcon = roleInfo.icon;
                                    const isSelf = admin.adminId === currentAdmin?.adminId;
                                    const isTargetAdmin = admin.role === 'admin';
                                    const canToggle = !isSelf && !(isTargetAdmin && currentAdmin?.role !== 'admin');

                                    return (
                                        <tr
                                            key={admin.adminId}
                                            className="hover:bg-gray-50/60 transition-colors group"
                                        >
                                            {/* Col 1: Personnel Info */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative w-11 h-11 shrink-0">
                                                        <img
                                                            src={getAvatarSrc(admin.avatar)}
                                                            alt={admin.username}
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                target.onerror = null;
                                                                target.src = '/avt_default/download.jpg';
                                                            }}
                                                            className="w-full h-full rounded-2xl object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
                                                        />
                                                        <span
                                                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                                                admin.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                                                            }`}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-sm">
                                                                {admin.username}
                                                            </span>
                                                            {isSelf && (
                                                                <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                                                                    Bạn
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                ID: #{admin.adminId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Col 2: Role */}
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${roleInfo.bg}`}
                                                >
                                                    <RoleIcon size={13} />
                                                    <span>{roleInfo.label}</span>
                                                </span>
                                            </td>

                                            {/* Col 3: Phone */}
                                            <td className="py-4 px-6">
                                                {admin.phone ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyPhone(admin.phone)}
                                                        className="inline-flex items-center gap-1.5 text-gray-700 hover:text-red-600 font-semibold group/phone transition-colors cursor-pointer"
                                                        title="Bấm để sao chép số điện thoại"
                                                    >
                                                        <Phone size={13} className="text-gray-400 group-hover/phone:text-red-500" />
                                                        <span>{admin.phone}</span>
                                                        <Copy size={11} className="text-gray-300 opacity-0 group-hover/phone:opacity-100 transition-opacity" />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 italic text-[11px]">Chưa cập nhật</span>
                                                )}
                                            </td>

                                            {/* Col 4: Status */}
                                            <td className="py-4 px-6">
                                                {admin.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Đang hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        Đã bị khóa
                                                    </span>
                                                )}
                                            </td>

                                            {/* Col 5: Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Edit Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(admin)}
                                                        className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                        title="Chỉnh sửa thông tin nhân sự"
                                                    >
                                                        <Edit size={16} />
                                                    </button>

                                                    {/* Lock / Unlock Toggle Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => triggerToggle(admin)}
                                                        disabled={!canToggle}
                                                        title={
                                                            isSelf
                                                                ? 'Không thể tự khóa tài khoản của chính mình'
                                                                : isTargetAdmin && currentAdmin?.role !== 'admin'
                                                                ? 'Bạn không đủ quyền thay đổi tài khoản Admin'
                                                                : admin.isActive
                                                                ? 'Khóa tài khoản này'
                                                                : 'Kích hoạt lại tài khoản'
                                                        }
                                                        className={`p-2 rounded-xl transition-all ${
                                                            !canToggle
                                                                ? 'text-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
                                                                : admin.isActive
                                                                ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer'
                                                                : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer'
                                                        }`}
                                                    >
                                                        {admin.isActive ? <Power size={16} /> : <RotateCcw size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={params.page}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                    itemName="nhân sự"
                />
            </div>

            {/* ================= 5. ADD / EDIT MODAL ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="relative bg-gradient-to-r from-neutral-900 to-slate-800 text-white p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                                    {editingAdmin ? <Edit size={20} /> : <UserPlus size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                                        {editingAdmin ? 'Cập Nhật Tài Khoản Nhân Sự' : 'Thêm Nhân Sự Mới'}
                                    </h3>
                                    <p className="text-xs text-neutral-300 font-medium">
                                        {editingAdmin
                                            ? `ID: #${editingAdmin.adminId} • Tài khoản: ${editingAdmin.username}`
                                            : 'Khởi tạo tài khoản phân quyền quản trị nội bộ'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                                {/* Avatar & Role preview header */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="relative w-16 h-16 shrink-0">
                                        <img
                                            src={getAvatarSrc(editingAdmin?.avatar)}
                                            alt="Avatar preview"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.src = '/avt_default/download.jpg';
                                            }}
                                            className="w-full h-full rounded-2xl object-cover border-2 border-white shadow-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-extrabold text-gray-900 text-sm">
                                                {formData.username || 'Tên đăng nhập mới'}
                                            </p>
                                            {editingAdmin?.adminId === currentAdmin?.adminId && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 text-[9px] font-black uppercase">
                                                    Bạn
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                            <span>Vai trò:</span>
                                            <span className="font-bold text-gray-800 capitalize">
                                                {formData.role === 'admin'
                                                    ? 'Quản trị viên (Admin)'
                                                    : formData.role === 'manager'
                                                    ? 'Quản lý (Manager)'
                                                    : 'Nhân viên (Staff)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    {/* Username Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <UserIcon size={14} className="text-gray-400" />
                                                <span>Tên đăng nhập</span>
                                                <span className="text-red-500">*</span>
                                            </label>
                                            {editingAdmin && (
                                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                                    <Lock size={12} /> Không thể đổi tên đăng nhập
                                                </span>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            disabled={!!editingAdmin}
                                            placeholder="Nhập tên đăng nhập (tối thiểu 6 ký tự)..."
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 disabled:bg-gray-100/80 disabled:text-gray-500 rounded-2xl border border-gray-200 font-medium text-xs text-gray-800 outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 transition-all placeholder:text-gray-400"
                                        />
                                        {errors.username && (
                                            <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                                                <AlertCircle size={13} /> {errors.username}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password & Confirm Password Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Password */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                <Lock size={14} className="text-gray-400" />
                                                <span>{editingAdmin ? 'Mật khẩu mới' : 'Mật khẩu'}</span>
                                                {!editingAdmin && <span className="text-red-500">*</span>}
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder={editingAdmin ? 'Bỏ trống nếu giữ nguyên' : 'Tối thiểu 8 ký tự...'}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 font-medium text-xs text-gray-800 outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 transition-all placeholder:text-gray-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                                >
                                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={13} /> {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                <Lock size={14} className="text-gray-400" />
                                                <span>Xác nhận mật khẩu</span>
                                                {!editingAdmin && <span className="text-red-500">*</span>}
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="Nhập lại mật khẩu..."
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 font-medium text-xs text-gray-800 outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 transition-all placeholder:text-gray-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                                                    <AlertCircle size={13} /> {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>Số điện thoại liên hệ</span>
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="VD: 0912345678 (tùy chọn)..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 font-medium text-xs text-gray-800 outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 transition-all placeholder:text-gray-400"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                                                <AlertCircle size={13} /> {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Role Selection Segmented Cards */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <Shield size={14} className="text-gray-400" />
                                                <span>Phân quyền vai trò</span>
                                                <span className="text-red-500">*</span>
                                            </label>

                                            {editingAdmin?.adminId === currentAdmin?.adminId && (
                                                <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                                                    <Lock size={12} /> Không thể tự đổi quyền của bạn
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                            {[
                                                {
                                                    key: 'staff',
                                                    title: 'Nhân viên',
                                                    desc: 'Xử lý đơn, kho & tin tức',
                                                    icon: UserIcon
                                                },
                                                {
                                                    key: 'manager',
                                                    title: 'Quản lý',
                                                    desc: 'Giám sát điều hành',
                                                    icon: Briefcase
                                                },
                                                {
                                                    key: 'admin',
                                                    title: 'Admin',
                                                    desc: 'Toàn quyền hệ thống',
                                                    icon: ShieldCheck
                                                }
                                            ].map((r) => {
                                                const isSelected = formData.role === r.key;
                                                const isSelfEditBlocked =
                                                    editingAdmin?.adminId === currentAdmin?.adminId && r.key !== editingAdmin?.role;
                                                const IconComp = r.icon;

                                                return (
                                                    <button
                                                        key={r.key}
                                                        type="button"
                                                        disabled={isSelfEditBlocked}
                                                        onClick={() => setFormData({ ...formData, role: r.key })}
                                                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                                                            isSelfEditBlocked
                                                                ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                                                                : isSelected
                                                                ? 'border-red-600 bg-red-50/50 shadow-sm cursor-pointer'
                                                                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50 cursor-pointer'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div
                                                                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                                                                    isSelected
                                                                        ? 'bg-red-600 text-white'
                                                                        : 'bg-gray-100 text-gray-500'
                                                                }`}
                                                            >
                                                                <IconComp size={14} />
                                                            </div>
                                                            {isSelected && (
                                                                <CheckCircle2 size={16} className="text-red-600" />
                                                            )}
                                                        </div>
                                                        <p
                                                            className={`font-black text-xs uppercase tracking-tight ${
                                                                isSelected ? 'text-red-700' : 'text-gray-800'
                                                            }`}
                                                        >
                                                            {r.title}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
                                                            {r.desc}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.role && (
                                            <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                                                <AlertCircle size={13} /> {errors.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                                >
                                    <Save size={16} />
                                    <span>{submitting ? 'Đang lưu...' : editingAdmin ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= 6. IN-APP CONFIRM TOGGLE STATUS MODAL ================= */}
            {confirmToggle.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() =>
                            !submitting &&
                            setConfirmToggle({ isOpen: false, adminId: 0, username: '', role: '', isActive: false })
                        }
                    />

                    {/* Dialog Container */}
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 z-10 animate-in fade-in zoom-in-95 duration-200">
                        {/* Icon Header */}
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                    confirmToggle.isActive
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}
                            >
                                {confirmToggle.isActive ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />}
                            </div>

                            <div>
                                <h3 className="text-base font-black text-gray-900 tracking-tight">
                                    {confirmToggle.isActive
                                        ? 'Tạm Khóa Tài Khoản Nhân Sự?'
                                        : 'Kích Hoạt Lại Tài Khoản?'}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Tài khoản: <strong className="text-gray-800">@{confirmToggle.username}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Description Message */}
                        <div
                            className={`p-4 rounded-2xl text-xs leading-relaxed ${
                                confirmToggle.isActive
                                    ? 'bg-rose-50/60 border border-rose-200/60 text-rose-900'
                                    : 'bg-emerald-50/60 border border-emerald-200/60 text-emerald-900'
                            }`}
                        >
                            {confirmToggle.isActive ? (
                                <p>
                                    Khi bị khóa, nhân viên <strong>{confirmToggle.username}</strong> sẽ ngay lập tức bị
                                    đăng xuất và không thể đăng nhập vào bảng quản trị cho đến khi được quản trị viên mở khóa
                                    lại.
                                </p>
                            ) : (
                                <p>
                                    Tài khoản của <strong>{confirmToggle.username}</strong> sẽ được mở khóa lại ngay lập
                                    tức và có thể truy cập hệ thống quản trị theo đúng vai trò đã phân quyền.
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() =>
                                    setConfirmToggle({
                                        isOpen: false,
                                        adminId: 0,
                                        username: '',
                                        role: '',
                                        isActive: false
                                    })
                                }
                                className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleConfirmToggle}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-all cursor-pointer ${
                                    confirmToggle.isActive
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                                }`}
                            >
                                {confirmToggle.isActive ? <Power size={15} /> : <RotateCcw size={15} />}
                                <span>
                                    {submitting
                                        ? 'Đang xử lý...'
                                        : confirmToggle.isActive
                                        ? 'Xác nhận khóa'
                                        : 'Kích hoạt lại'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;