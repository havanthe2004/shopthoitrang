import { useEffect, useState, useMemo } from 'react';
import { adminOrderService } from '../services/adminOrderService';
import {
    Search,
    Truck,
    RotateCcw,
    Eye,
    PackageCheck,
    ShoppingBag,
    X,
    MapPin,
    User,
    FileText,
    Wallet,
    Check,
    CalendarClock,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Phone,
    Copy,
    DollarSign,
    AlertTriangle,
    Package
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/imageUrl';

// ================= INTERFACES =================
interface OrderItemType {
    orderItemId: number;
    quantity: number;
    price: number | string;
    variant?: {
        productVariantId: number;
        size: string;
        product?: {
            productId: number;
            name: string;
            slug?: string;
        };
        color?: {
            productColorId: number;
            color: string;
            hexCode?: string;
            images?: {
                productImageId?: number;
                url: string;
                isThumbnail?: boolean;
            }[];
        };
    };
}

interface OrderType {
    orderId: number;
    receiverName: string;
    phone: string;
    address: string;
    totalPrice: number | string;
    paymentMethod: 'COD' | 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | string;
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed' | string;
    status: 'pending' | 'approved' | 'shipping' | 'completed' | 'cancelled' | 'returned' | string;
    note?: string;
    createdAt: string;
    user?: {
        userId: number;
        email: string;
        fullName?: string;
    };
    items?: OrderItemType[];
}

interface ConfirmModalState {
    isOpen: boolean;
    type: 'status' | 'payment';
    orderId: number;
    nextValue: string;
    title: string;
    message: string;
    warning?: string;
    confirmText: string;
    buttonColor: string;
}

const OrderManagement = () => {
    // ================= STATES =================
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        status: '',
        search: ''
    });
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // In-App Confirm Modal
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        type: 'status',
        orderId: 0,
        nextValue: '',
        title: '',
        message: '',
        confirmText: '',
        buttonColor: 'bg-red-600'
    });

    // ================= DATA FETCHING =================
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Strip '#ORD-' or 'ORD-' prefixes if user types search
            const cleanSearch = params.search.replace(/^#?ORD-?/i, '').trim();

            const res = await adminOrderService.getAll({
                page: params.page,
                limit: params.limit,
                status: params.status || undefined,
                search: cleanSearch || undefined
            });

            setOrders(res.data.items || []);
            setMeta(res.data.meta || { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch (err) {
            console.error('Lỗi tải danh sách đơn hàng:', err);
            toast.error('Lỗi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchOrders(), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.page, params.limit, params.status, params.search]);

    // ================= SUMMARY KPIS =================
    const stats = useMemo(() => {
        let pending = 0;
        let approved = 0;
        let shipping = 0;
        let completed = 0;
        let cancelled = 0;
        let returned = 0;
        let totalRevenue = 0;

        orders.forEach((o) => {
            const price = Number(o.totalPrice) || 0;
            totalRevenue += price;

            switch (o.status) {
                case 'pending':
                    pending += 1;
                    break;
                case 'approved':
                    approved += 1;
                    break;
                case 'shipping':
                    shipping += 1;
                    break;
                case 'completed':
                    completed += 1;
                    break;
                case 'cancelled':
                    cancelled += 1;
                    break;
                case 'returned':
                    returned += 1;
                    break;
            }
        });

        return {
            pending,
            approved,
            shipping,
            completed,
            cancelled,
            returned,
            totalRevenue
        };
    }, [orders]);

    // Currency Formatter
    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(val) || 0);
    };

    // ================= STATUS & BADGE CONFIGS =================
    const getOrderStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Chờ xác nhận',
                    icon: Clock,
                    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
                    dotClass: 'bg-amber-500 animate-pulse'
                };
            case 'approved':
                return {
                    label: 'Đã duyệt đơn',
                    icon: CheckCircle2,
                    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
                    dotClass: 'bg-blue-500'
                };
            case 'shipping':
                return {
                    label: 'Đang giao hàng',
                    icon: Truck,
                    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
                    dotClass: 'bg-indigo-500 animate-pulse'
                };
            case 'completed':
                return {
                    label: 'Giao thành công',
                    icon: PackageCheck,
                    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                    dotClass: 'bg-emerald-500'
                };
            case 'cancelled':
                return {
                    label: 'Đã hủy đơn',
                    icon: XCircle,
                    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
                    dotClass: 'bg-rose-500'
                };
            case 'returned':
                return {
                    label: 'Đã hoàn trả',
                    icon: RotateCcw,
                    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
                    dotClass: 'bg-gray-400'
                };
            default:
                return {
                    label: status,
                    icon: Clock,
                    badgeClass: 'bg-gray-50 text-gray-600 border-gray-200',
                    dotClass: 'bg-gray-400'
                };
        }
    };

    const getPaymentStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Chưa thu tiền', badgeClass: 'bg-rose-50 text-rose-600 border-rose-200' };
            case 'paid':
                return { label: 'Đã thu tiền', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'refunded':
                return { label: 'Đã hoàn tiền', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'failed':
                return { label: 'Lỗi thanh toán', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200' };
            default:
                return { label: status, badgeClass: 'bg-gray-50 text-gray-600 border-gray-200' };
        }
    };

    const getPaymentMethodInfo = (method: string) => {
        switch (method) {
            case 'COD':
                return { label: 'Tiền mặt (COD)', color: 'bg-slate-100 text-slate-800 border-slate-200' };
            case 'VNPAY':
                return { label: 'VNPAY QR', color: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'MOMO':
                return { label: 'Ví MoMo', color: 'bg-pink-50 text-pink-700 border-pink-200' };
            case 'BANK_TRANSFER':
                return { label: 'Chuyển khoản', color: 'bg-violet-50 text-violet-700 border-violet-200' };
            default:
                return { label: method || 'Khác', color: 'bg-gray-50 text-gray-700 border-gray-200' };
        }
    };

    // ================= ACTIONS & CONFIRMATIONS =================
    const triggerStatusChange = (order: OrderType, nextStatus: string) => {
        const statusMap: Record<string, string> = {
            approved: 'Phê duyệt & Chờ lấy hàng',
            shipping: 'Bắt đầu giao hàng',
            completed: 'Giao hàng thành công',
            cancelled: 'Hủy đơn hàng',
            returned: 'Khách yêu cầu hoàn trả'
        };

        const isCancel = nextStatus === 'cancelled';
        const isComplete = nextStatus === 'completed';

        setConfirmModal({
            isOpen: true,
            type: 'status',
            orderId: order.orderId,
            nextValue: nextStatus,
            title: `Xác nhận chuyển trạng thái: ${statusMap[nextStatus] || nextStatus}`,
            message: `Bạn có chắc chắn muốn chuyển đơn hàng #ORD-${order.orderId} sang trạng thái "${statusMap[nextStatus] || nextStatus}"?`,
            warning: isCancel
                ? 'Đơn hàng sau khi hủy sẽ ngừng toàn bộ quá trình đóng gói và vận chuyển.'
                : isComplete
                ? 'Hệ thống sẽ tự động gán trạng thái tài chính thành "ĐÃ THU TIỀN".'
                : undefined,
            confirmText: isCancel ? 'Xác nhận hủy đơn' : isComplete ? 'Xác nhận hoàn thành' : 'Đồng ý chuyển',
            buttonColor: isCancel
                ? 'bg-rose-600 hover:bg-rose-700'
                : isComplete
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
        });
    };

    const triggerPaymentChange = (order: OrderType, nextPayment: string) => {
        const isPaid = nextPayment === 'paid';
        setConfirmModal({
            isOpen: true,
            type: 'payment',
            orderId: order.orderId,
            nextValue: nextPayment,
            title: isPaid ? 'Xác nhận đã thu tiền' : 'Xác nhận hoàn tiền cho khách',
            message: isPaid
                ? `Đánh dấu đơn hàng #ORD-${order.orderId} đã thu tiền thành công (${formatCurrency(order.totalPrice)})?`
                : `Xác nhận hoàn trả số tiền (${formatCurrency(order.totalPrice)}) cho khách hàng của đơn #ORD-${order.orderId}?`,
            confirmText: isPaid ? 'Xác nhận đã thu' : 'Xác nhận hoàn tiền',
            buttonColor: isPaid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
        });
    };

    const handleExecuteConfirm = async () => {
        if (!confirmModal.isOpen) return;

        setSubmitting(true);
        try {
            if (confirmModal.type === 'status') {
                await adminOrderService.updateStatus(confirmModal.orderId, confirmModal.nextValue);
                toast.success(`Đã cập nhật trạng thái đơn hàng #ORD-${confirmModal.orderId}`);
            } else {
                await adminOrderService.updatePayment(confirmModal.orderId, confirmModal.nextValue);
                toast.success(`Đã cập nhật trạng thái tài chính đơn #ORD-${confirmModal.orderId}`);
            }

            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            setIsDetailOpen(false);
            fetchOrders();
        } catch (err: any) {
            console.error('Update order error:', err);
            toast.error(err.response?.data?.message || 'Thao tác thất bại');
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

    // Calculate active step in order progression
    const getActiveStep = (status: string) => {
        switch (status) {
            case 'pending':
                return 0;
            case 'approved':
                return 1;
            case 'shipping':
                return 2;
            case 'completed':
                return 3;
            default:
                return -1;
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
                            <span>Vận hành & Hậu cần</span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Xử lý đơn hàng & Đối soát tài chính
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <ShoppingBag className="text-red-500" size={32} />
                            Quản Lý & Xử Lý Đơn Hàng
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            Theo dõi toàn bộ luồng vận đơn từ khâu phê duyệt, giao vận tới khi đối soát hoàn tất tài chính. Đảm bảo quy trình giao nhận chuẩn mực và chăm sóc khách hàng kịp thời.
                        </p>
                    </div>
                </div>

                {/* Micro Stat Chips */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Package size={14} className="text-red-400" />
                        <span className="text-neutral-300">Tổng đơn toàn hệ thống:</span>
                        <strong className="text-white font-extrabold">{meta.totalItems} đơn</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Clock size={14} className="text-amber-400" />
                        <span className="text-neutral-300">Chờ duyệt (trang này):</span>
                        <strong className="text-white font-extrabold">{stats.pending}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <DollarSign size={14} className="text-emerald-400" />
                        <span className="text-neutral-300">Giá trị đơn đang xem:</span>
                        <strong className="text-white font-extrabold">{formatCurrency(stats.totalRevenue)}</strong>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Orders */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng đơn đặt hàng</p>
                        <h3 className="text-2xl font-black text-gray-900">{meta.totalItems}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Đơn hàng trong hệ thống</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
                        <ShoppingBag size={22} />
                    </div>
                </div>

                {/* Card 2: Pending Approval */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Chờ xác nhận</p>
                            {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                        </div>
                        <h3 className="text-2xl font-black text-amber-600">{stats.pending}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Cần duyệt để đóng gói</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60 shadow-xs">
                        <Clock size={22} />
                    </div>
                </div>

                {/* Card 3: Shipping */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Đang giao vận</p>
                            {stats.shipping > 0 && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                        </div>
                        <h3 className="text-2xl font-black text-indigo-600">{stats.shipping}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Đang trên đường tới khách</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60 shadow-xs">
                        <Truck size={22} />
                    </div>
                </div>

                {/* Card 4: Completed Orders */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Giao thành công</p>
                        <h3 className="text-2xl font-black text-emerald-600">{stats.completed}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Khách đã nhận & đã thu tiền</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-xs">
                        <PackageCheck size={22} />
                    </div>
                </div>
            </div>

            {/* ================= 3. TOOLBAR: SEARCH & STATUS TABS ================= */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn #ORD, tên người nhận, SĐT..."
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
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                        {[
                            { key: '', label: 'Tất cả' },
                            { key: 'pending', label: 'Chờ duyệt' },
                            { key: 'approved', label: 'Đã duyệt' },
                            { key: 'shipping', label: 'Đang giao' },
                            { key: 'completed', label: 'Thành công' },
                            { key: 'cancelled', label: 'Đã hủy' },
                            { key: 'returned', label: 'Hoàn trả' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setParams({ ...params, status: tab.key, page: 1 })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    params.status === tab.key
                                        ? 'bg-white text-gray-900 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Page Limit Dropdown */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
                        <span className="text-[11px] font-bold text-gray-400">Hiển thị:</span>
                        <select
                            value={params.limit}
                            onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
                            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer"
                        >
                            <option value={10}>10 đơn</option>
                            <option value={20}>20 đơn</option>
                            <option value={50}>50 đơn</option>
                            <option value={100}>100 đơn</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ================= 4. ORDERS TABLE ================= */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-4 pl-6 pr-4 w-32 text-center">Mã đơn hàng</th>
                                <th className="py-4 px-4 w-60">Khách hàng nhận</th>
                                <th className="py-4 px-4 w-48">Sản phẩm</th>
                                <th className="py-4 px-4 text-right w-40">Tổng tiền & PTTT</th>
                                <th className="py-4 px-4 text-center w-36">Thanh toán</th>
                                <th className="py-4 px-4 text-center w-40">Trạng thái vận đơn</th>
                                <th className="py-4 pr-6 pl-4 text-right w-44">Thao tác xử lý</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">
                                        <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={24} />
                                        <span className="font-semibold text-xs">Đang tải danh sách đơn hàng...</span>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <ShoppingBag size={28} />
                                        </div>
                                        <p className="font-bold text-gray-700 text-sm">Không tìm thấy đơn hàng nào</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                            {params.search || params.status
                                                ? 'Không có đơn hàng nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.'
                                                : 'Hệ thống chưa ghi nhận đơn hàng nào.'}
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
                                orders.map((order) => {
                                    const statusInfo = getOrderStatusInfo(order.status);
                                    const StatusIcon = statusInfo.icon;
                                    const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
                                    const methodInfo = getPaymentMethodInfo(order.paymentMethod);

                                    // Display thumbnails of first 3 items
                                    const previewItems = order.items?.slice(0, 3) || [];
                                    const moreCount = (order.items?.length || 0) - previewItems.length;

                                    return (
                                        <tr
                                            key={order.orderId}
                                            className="group hover:bg-red-50/20 transition-colors"
                                        >
                                            {/* CỘT 1: MÃ ĐƠN HÀNG & THỜI GIAN */}
                                            <td className="py-4 pl-6 pr-4 text-center">
                                                <div className="space-y-1">
                                                    <span className="font-black text-gray-900 text-xs block group-hover:text-red-600 transition-colors">
                                                        #ORD-{order.orderId}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 block font-medium">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* CỘT 2: KHÁCH HÀNG NHẬN */}
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={12} className="text-gray-400 flex-shrink-0" />
                                                        <p className="font-extrabold text-gray-900 text-xs leading-tight line-clamp-1">
                                                            {order.receiverName}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                                        <Phone size={11} className="text-gray-400 flex-shrink-0" />
                                                        <span className="font-semibold font-mono">{order.phone}</span>
                                                    </div>

                                                    <div className="flex items-start gap-1 text-[10px] text-gray-400 leading-tight line-clamp-1">
                                                        <MapPin size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                                        <span>{order.address}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* CỘT 3: SẢN PHẨM TRONG ĐƠN */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    {previewItems.map((item, idx) => {
                                                        const imgUrl = item.variant?.color?.images?.[0]?.url;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 shadow-2xs p-0.5"
                                                                title={`${item.variant?.product?.name} (Size: ${item.variant?.size}, Màu: ${item.variant?.color?.color}) x${item.quantity}`}
                                                            >
                                                                <img
                                                                    src={getImageUrl(imgUrl || '')}
                                                                    alt="item"
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/avt_default/download.jpg';
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    })}

                                                    {moreCount > 0 && (
                                                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 font-bold text-[10px] flex items-center justify-center border border-gray-200">
                                                            +{moreCount}
                                                        </div>
                                                    )}

                                                    <span className="text-[11px] font-bold text-gray-500 ml-1">
                                                        {order.items?.length || 0} món
                                                    </span>
                                                </div>
                                            </td>

                                            {/* CỘT 4: TỔNG TIỀN & PTTT */}
                                            <td className="py-4 px-4 text-right">
                                                <div className="space-y-1">
                                                    <span className="font-black text-gray-900 text-sm block tracking-tight">
                                                        {formatCurrency(order.totalPrice)}
                                                    </span>
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${methodInfo.color}`}
                                                    >
                                                        {methodInfo.label}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* CỘT 5: THANH TOÁN */}
                                            <td className="py-4 px-4 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${paymentInfo.badgeClass}`}
                                                >
                                                    {paymentInfo.label}
                                                </span>
                                            </td>

                                            {/* CỘT 6: TRẠNG THÁI VẬN ĐƠN */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold shadow-2xs"
                                                    style={{}}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                                                    <StatusIcon size={13} className="text-gray-600" />
                                                    <span className="text-gray-800">{statusInfo.label}</span>
                                                </div>
                                            </td>

                                            {/* CỘT 7: THAO TÁC XỬ LÝ */}
                                            <td className="py-4 pr-6 pl-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Quick Action Button based on status */}
                                                    {order.status === 'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerStatusChange(order, 'approved')}
                                                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                                                            title="Duyệt đơn nhanh"
                                                        >
                                                            Duyệt
                                                        </button>
                                                    )}

                                                    {order.status === 'approved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerStatusChange(order, 'shipping')}
                                                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                                                            title="Bắt đầu giao vận"
                                                        >
                                                            <Truck size={12} />
                                                            <span>Giao</span>
                                                        </button>
                                                    )}

                                                    {order.status === 'shipping' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerStatusChange(order, 'completed')}
                                                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                                                            title="Xác nhận giao thành công"
                                                        >
                                                            <Check size={12} />
                                                            <span>Xong</span>
                                                        </button>
                                                    )}

                                                    {/* View Detail Modal Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsDetailOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                                                        title="Xem hồ sơ chi tiết đơn hàng"
                                                    >
                                                        <Eye size={13} />
                                                        <span>Chi tiết</span>
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
            </div>

            {/* ================= 5. PAGINATION ================= */}
            <Pagination
                currentPage={params.page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={params.limit}
                onPageChange={handlePageChange}
                itemName="đơn hàng"
            />

            {/* ================= 6. ORDER DETAIL MODAL ================= */}
            {isDetailOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white px-8 py-5 flex items-center justify-between border-b border-white/10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                                        <ShoppingBag className="text-red-500" size={20} />
                                        Hồ Sơ Đơn Hàng #ORD-{selectedOrder.orderId}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(`#ORD-${selectedOrder.orderId}`, 'mã đơn')}
                                        className="text-gray-400 hover:text-white transition"
                                        title="Sao chép mã đơn"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-neutral-300">
                                    <CalendarClock size={13} className="text-red-400" />
                                    <span>
                                        Thời gian đặt:{' '}
                                        <strong className="text-white">
                                            {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${
                                        getOrderStatusInfo(selectedOrder.status).badgeClass
                                    }`}
                                >
                                    {getOrderStatusInfo(selectedOrder.status).label}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setIsDetailOpen(false)}
                                    className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Order Timeline Progression (if not cancelled/returned) */}
                        {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'returned' ? (
                            <div className="bg-gray-50/80 px-8 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between max-w-3xl mx-auto">
                                    {[
                                        { title: 'Chờ duyệt', icon: Clock },
                                        { title: 'Đã duyệt', icon: CheckCircle2 },
                                        { title: 'Đang giao', icon: Truck },
                                        { title: 'Thành công', icon: PackageCheck }
                                    ].map((step, idx) => {
                                        const StepIcon = step.icon;
                                        const activeIndex = getActiveStep(selectedOrder.status);
                                        const isDone = activeIndex >= idx;
                                        const isCurrent = activeIndex === idx;

                                        return (
                                            <div key={idx} className="flex items-center flex-1 last:flex-initial">
                                                <div className="flex flex-col items-center gap-1.5 relative">
                                                    <div
                                                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                                                            isDone
                                                                ? 'bg-red-600 text-white shadow-red-600/30'
                                                                : 'bg-white border border-gray-200 text-gray-400'
                                                        } ${isCurrent ? 'ring-4 ring-red-500/20' : ''}`}
                                                    >
                                                        <StepIcon size={16} />
                                                    </div>
                                                    <span
                                                        className={`text-[11px] font-bold ${
                                                            isDone ? 'text-gray-900 font-extrabold' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {step.title}
                                                    </span>
                                                </div>

                                                {idx < 3 && (
                                                    <div
                                                        className={`flex-1 h-1 mx-3 rounded-full transition-all ${
                                                            activeIndex > idx ? 'bg-red-600' : 'bg-gray-200'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`px-8 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b ${
                                    selectedOrder.status === 'cancelled'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                            >
                                <AlertTriangle size={15} />
                                <span>
                                    {selectedOrder.status === 'cancelled'
                                        ? 'Đơn hàng này đã bị hủy. Quy trình xử lý đã dừng lại.'
                                        : 'Đơn hàng này đã được xử lý hoàn trả / thu hồi về kho.'}
                                </span>
                            </div>
                        )}

                        {/* Modal Body: 2 Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                            {/* CỘT TRÁI (1 phần): Khách hàng & Tài chính */}
                            <div className="p-6 lg:p-7 space-y-5 bg-gray-50/50">
                                {/* Receiver Information Card */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                        Người nhận hàng
                                    </label>
                                    <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                                                <User size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-gray-900 text-xs uppercase leading-tight truncate">
                                                    {selectedOrder.receiverName}
                                                </p>
                                                <a
                                                    href={`tel:${selectedOrder.phone}`}
                                                    className="text-xs font-bold text-gray-500 hover:text-red-600 font-mono transition flex items-center gap-1 mt-0.5"
                                                >
                                                    <Phone size={11} />
                                                    <span>{selectedOrder.phone}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address Card */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                        Địa chỉ nhận hàng
                                    </label>
                                    <div className="flex gap-2.5 p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs">
                                        <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-gray-700 leading-relaxed">
                                            {selectedOrder.address}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Note */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                        Ghi chú đơn hàng
                                    </label>
                                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-xs font-medium text-amber-900 leading-relaxed">
                                        {selectedOrder.note ? (
                                            <p className="italic">"{selectedOrder.note}"</p>
                                        ) : (
                                            <span className="text-amber-700/70 italic text-[11px]">
                                                Không có ghi chú từ khách hàng
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Financial Summary Dark Card */}
                                <div className="p-5 bg-gradient-to-br from-neutral-900 to-slate-800 rounded-3xl text-white shadow-lg space-y-3">
                                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                                            Tài chính đơn
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                                                getPaymentStatusInfo(selectedOrder.paymentStatus).badgeClass
                                            }`}
                                        >
                                            {getPaymentStatusInfo(selectedOrder.paymentStatus).label}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[11px] text-neutral-400 font-medium">Tổng thanh toán:</span>
                                        <h3 className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                                            {formatCurrency(selectedOrder.totalPrice)}
                                        </h3>
                                    </div>

                                    <div className="pt-2 border-t border-white/10 text-[11px] text-neutral-300 space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Phương thức:</span>
                                            <strong className="text-white">
                                                {getPaymentMethodInfo(selectedOrder.paymentMethod).label}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI (2 phần): Danh sách sản phẩm mua */}
                            <div className="p-6 lg:p-7 col-span-2 space-y-4 bg-white overflow-y-auto">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        <FileText size={15} className="text-red-500" />
                                        <span>Danh mục sản phẩm ({selectedOrder.items?.length || 0})</span>
                                    </label>
                                    <span className="text-[11px] font-bold text-gray-400">
                                        Đơn giá x Số lượng
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item) => {
                                        const imgUrl = item.variant?.color?.images?.[0]?.url;
                                        const itemTotal = Number(item.price) * item.quantity;

                                        return (
                                            <div
                                                key={item.orderItemId}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 rounded-2xl border border-gray-200/80 bg-white p-0.5 overflow-hidden flex-shrink-0 shadow-2xs">
                                                    <img
                                                        src={getImageUrl(imgUrl || '')}
                                                        alt="item"
                                                        className="w-full h-full object-cover rounded-xl"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/avt_default/download.jpg';
                                                        }}
                                                    />
                                                </div>

                                                {/* Specs */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="font-extrabold text-gray-900 text-xs line-clamp-1">
                                                        {item.variant?.product?.name}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                                        {/* Color swatch */}
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold">
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.variant?.color?.hexCode || '#64748b'
                                                                }}
                                                            />
                                                            {item.variant?.color?.color}
                                                        </span>

                                                        {/* Size */}
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-black uppercase">
                                                            Size: {item.variant?.size}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price & Quantity Calculation */}
                                                <div className="text-right flex-shrink-0 space-y-0.5">
                                                    <span className="font-black text-gray-900 text-xs block">
                                                        {formatCurrency(itemTotal)}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-gray-400 block font-mono">
                                                        {formatCurrency(item.price)} × {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer: Workflow Actions */}
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Tài chính Actions */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="p-2 bg-gray-200/80 rounded-xl text-gray-600">
                                    <Wallet size={16} />
                                </div>

                                {selectedOrder.paymentStatus === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() => triggerPaymentChange(selectedOrder, 'paid')}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Check size={14} />
                                        <span>Xác nhận đã thu tiền</span>
                                    </button>
                                )}

                                {(selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'returned') &&
                                    selectedOrder.paymentStatus !== 'refunded' && (
                                        <button
                                            type="button"
                                            onClick={() => triggerPaymentChange(selectedOrder, 'refunded')}
                                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RotateCcw size={14} />
                                            <span>Hoàn tiền cho khách</span>
                                        </button>
                                    )}

                                {selectedOrder.paymentStatus === 'refunded' && (
                                    <span className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-xl font-bold text-xs border border-gray-300">
                                        Đã hoàn tất tài chính
                                    </span>
                                )}
                            </div>

                            {/* Vận hành Workflow Actions */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {selectedOrder.status === 'pending' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange(selectedOrder, 'cancelled')}
                                            className="px-4 py-2 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 border border-gray-200 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                                        >
                                            Hủy đơn
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange(selectedOrder, 'approved')}
                                            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckCircle2 size={15} />
                                            <span>Phê duyệt & Đóng gói</span>
                                        </button>
                                    </>
                                )}

                                {selectedOrder.status === 'approved' && (
                                    <button
                                        type="button"
                                        onClick={() => triggerStatusChange(selectedOrder, 'shipping')}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                                    >
                                        <Truck size={15} />
                                        <span>Bắt đầu giao vận</span>
                                    </button>
                                )}

                                {selectedOrder.status === 'shipping' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange(selectedOrder, 'returned')}
                                            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                                        >
                                            Khách trả hàng
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange(selectedOrder, 'completed')}
                                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                                        >
                                            <PackageCheck size={15} />
                                            <span>Xác nhận giao thành công</span>
                                        </button>
                                    </>
                                )}

                                {selectedOrder.status === 'completed' && (
                                    <button
                                        type="button"
                                        onClick={() => triggerStatusChange(selectedOrder, 'returned')}
                                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <RotateCcw size={14} />
                                        <span>Yêu cầu hoàn trả</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= 7. CONFIRMATION DIALOG MODAL ================= */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 flex-shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-black text-gray-900">{confirmModal.title}</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">{confirmModal.message}</p>
                            </div>
                        </div>

                        {confirmModal.warning && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-medium text-amber-800 flex items-start gap-2">
                                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <span>{confirmModal.warning}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                                disabled={submitting}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                onClick={handleExecuteConfirm}
                                disabled={submitting}
                                className={`px-5 py-2 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${confirmModal.buttonColor} disabled:opacity-50`}
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw size={13} className="animate-spin" />
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <span>{confirmModal.confirmText}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;