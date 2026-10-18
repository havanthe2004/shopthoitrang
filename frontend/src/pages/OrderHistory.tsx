import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders } from '../redux/slices/orderSlice';
import { orderService } from '../services/orderService';
import type { RootState, AppDispatch } from '../redux/store';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageUrl';
import {
    Package,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Home,
    Search,
    MapPin,
    User,
    Phone,
    CreditCard,
    AlertCircle,
    ExternalLink,
    X,
    FileText,
    Copy,
    Check,
    ShoppingBag,
    Loader2,
    Calendar,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';

const statusTabs = [
    { key: 'all', label: 'Tất cả', icon: <Package className="w-4 h-4" /> },
    { key: 'pending', label: 'Chờ xác nhận', icon: <Clock className="w-4 h-4" /> },
    { key: 'approved', label: 'Đã duyệt', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'shipping', label: 'Đang giao', icon: <Truck className="w-4 h-4" /> },
    { key: 'completed', label: 'Hoàn tất', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'cancelled', label: 'Đã hủy', icon: <XCircle className="w-4 h-4" /> },
    { key: 'returned', label: 'Trả hàng', icon: <RotateCcw className="w-4 h-4" /> },
];

const translateStatus = (status: string) => {
    switch (status) {
        case 'pending': return 'Chờ xác nhận';
        case 'approved': return 'Đã xác nhận';
        case 'shipping': return 'Đang giao hàng';
        case 'completed': return 'Giao thành công';
        case 'cancelled': return 'Đã hủy';
        case 'returned': return 'Hoàn trả';
        default: return status;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-amber-50 text-amber-700 border-amber-200/80';
        case 'approved':
            return 'bg-blue-50 text-blue-700 border-blue-200/80';
        case 'shipping':
            return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
        case 'completed':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        case 'cancelled':
            return 'bg-red-50 text-red-700 border-red-200/80';
        case 'returned':
            return 'bg-gray-100 text-gray-700 border-gray-200/80';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

const getPaymentMethodLabel = (method: string) => {
    if (!method) return 'Thanh toán khi nhận hàng (COD)';
    const upper = method.toUpperCase();
    if (upper.includes('VNPAY')) return 'VNPAY (Online)';
    if (upper.includes('COD')) return 'Thanh toán khi nhận hàng (COD)';
    return method;
};

const OrderHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { orders, loading, totalPages } = useSelector((state: RootState) => state.orders);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [copiedOrderId, setCopiedOrderId] = useState<number | null>(null);

    // Modals
    const [detailOrder, setDetailOrder] = useState<any | null>(null);
    const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [returnOrderId, setReturnOrderId] = useState<number | null>(null);
    const [isReturning, setIsReturning] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [page, activeTab]);

    useEffect(() => {
        dispatch(fetchOrders({ status: activeTab, page }));
    }, [activeTab, page, dispatch]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setPage(1);
        setSearchKeyword('');
    };

    const handleCopyOrderId = (id: number) => {
        navigator.clipboard.writeText(`SP-${id}`);
        setCopiedOrderId(id);
        toast.info(`Đã sao chép mã đơn hàng: #SP-${id}`);
        setTimeout(() => setCopiedOrderId(null), 2000);
    };

    const handleConfirmCancel = async () => {
        if (!cancelOrderId) return;
        try {
            setIsCancelling(true);
            await orderService.cancelOrder(cancelOrderId);
            toast.success("Hủy đơn hàng thành công!");
            setCancelOrderId(null);
            dispatch(fetchOrders({ status: activeTab, page }));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Hủy đơn hàng thất bại!");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirmReturn = async () => {
        if (!returnOrderId) return;
        try {
            setIsReturning(true);
            await orderService.returnOrder(returnOrderId);
            toast.success("Yêu cầu trả hàng đã được gửi thành công. CSKH sẽ liên hệ với bạn sớm nhất!");
            setReturnOrderId(null);
            dispatch(fetchOrders({ status: activeTab, page }));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Gửi yêu cầu trả hàng thất bại!");
        } finally {
            setIsReturning(false);
        }
    };

    // Filter orders by search keyword (Order ID or Product name)
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        if (!searchKeyword.trim()) return orders;
        const kw = searchKeyword.trim().toLowerCase();
        return orders.filter((o: any) => {
            const matchId = `sp-${o.orderId}`.includes(kw) || String(o.orderId).includes(kw);
            const matchProduct = o.items?.some((it: any) =>
                it.variant?.product?.name?.toLowerCase().includes(kw)
            );
            return matchId || matchProduct;
        });
    }, [orders, searchKeyword]);

    return (
        <div className="min-h-screen bg-slate-50/70 pb-20">
            {/* 1. Breadcrumbs */}
            <div className="bg-white border-b border-gray-200/80 sticky top-16 md:top-24 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Link to="/" className="flex items-center gap-1.5 hover:text-black transition-colors">
                            <Home className="w-3.5 h-3.5" />
                            <span>Trang chủ</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        <Link to="/profile" className="hover:text-black transition-colors">
                            Tài khoản
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-red-600 font-bold">Đơn hàng của tôi</span>
                    </div>

                    <Link
                        to="/profile"
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-red-600 transition"
                    >
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>Hồ sơ cá nhân</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 space-y-6">
                {/* 2. Top Banner Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
                                    Đơn hàng của tôi
                                </h1>
                                <p className="text-xs md:text-sm text-gray-500">
                                    Theo dõi tiến độ giao hàng, kiểm tra chi tiết và quản lý các đơn mua sắm
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search order input */}
                    <div className="w-full md:w-80 relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn hoặc tên sản phẩm..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-9 bg-gray-50 text-xs font-semibold rounded-xl border border-gray-200 focus:border-neutral-900 focus:bg-white outline-none transition"
                        />
                        {searchKeyword && (
                            <button
                                type="button"
                                onClick={() => setSearchKeyword('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. Horizontal Status Tabs */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 min-w-max">
                        {statusTabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${isActive
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-black hover:bg-gray-100/70'
                                        }`}
                                >
                                    <span className={isActive ? 'text-red-400' : 'text-gray-400'}>
                                        {tab.icon}
                                    </span>
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Orders List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-gray-100">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
                        <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">
                            Đang đồng bộ danh sách đơn hàng...
                        </p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-gray-800">
                                {searchKeyword ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng nào trong mục này"}
                            </h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                {searchKeyword
                                    ? "Vui lòng kiểm tra lại mã đơn hàng hoặc tên sản phẩm tìm kiếm."
                                    : "Bạn có thể tham khảo hàng ngàn sản phẩm thời trang mới nhất của chúng tôi."}
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link
                                to="/product-list"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-600 transition shadow-sm active:scale-95"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Khám phá sản phẩm ngay</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredOrders.map((order: any) => {
                            const isPending = order.status === 'pending';
                            const isCompleted = order.status === 'completed';
                            const orderDate = order.createdAt
                                ? new Date(order.createdAt).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'Đang cập nhật';

                            return (
                                <div
                                    key={order.orderId}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                                >
                                    {/* Order Card Top Bar */}
                                    <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2 font-black text-gray-900 tracking-tight text-sm">
                                                <span>#SP-{order.orderId}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyOrderId(order.orderId)}
                                                    className="p-1 rounded-md text-gray-400 hover:text-black hover:bg-gray-200/60 transition"
                                                    title="Sao chép mã đơn hàng"
                                                >
                                                    {copiedOrderId === order.orderId ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>

                                            <span className="text-gray-300">•</span>

                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{orderDate}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            {/* Payment Method Badge */}
                                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                <CreditCard className="w-3 h-3 text-gray-400" />
                                                <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                                            </span>

                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase ${getStatusBadge(order.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                <span>{translateStatus(order.status)}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items List */}
                                    <div className="p-6 divide-y divide-gray-100">
                                        {order.items?.map((item: any) => {
                                            const itemImage = item.variant?.color?.images?.[0]?.url
                                                ? getImageUrl(item.variant.color.images[0].url)
                                                : '/placeholder.jpg';
                                            const productSlug = item.variant?.product?.slug;

                                            return (
                                                <div
                                                    key={item.orderItemId || Math.random()}
                                                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <Link
                                                            to={productSlug ? `/product/${productSlug}` : '#'}
                                                            className="w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0 group-hover:scale-105 transition-transform"
                                                        >
                                                            <img
                                                                src={itemImage}
                                                                alt={item.variant?.product?.name || "Product"}
                                                                className="w-full h-full object-cover"
                                                                onError={(e: any) => {
                                                                    e.currentTarget.src = "/placeholder.jpg";
                                                                }}
                                                            />
                                                        </Link>

                                                        <div className="space-y-1 min-w-0 flex-1">
                                                            <Link
                                                                to={productSlug ? `/product/${productSlug}` : '#'}
                                                                className="text-xs md:text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2"
                                                            >
                                                                {item.variant?.product?.name || "Sản phẩm thời trang"}
                                                            </Link>

                                                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600">
                                                                    Phân loại: {item.variant?.color?.name || 'Mặc định'} / {item.variant?.size?.name || 'Freesize'}
                                                                </span>
                                                                <span className="text-xs font-bold text-gray-400">
                                                                    x{item.quantity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right sm:pl-4 self-end sm:self-center">
                                                        <span className="text-sm md:text-base font-black text-gray-900">
                                                            {Number(item.price).toLocaleString('vi-VN')}₫
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Order Card Footer */}
                                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Tổng thanh toán:
                                            </span>
                                            <span className="text-lg md:text-xl font-black text-red-600">
                                                {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                                            {/* Order Detail Button */}
                                            <button
                                                type="button"
                                                onClick={() => setDetailOrder(order)}
                                                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 transition shadow-2xs"
                                            >
                                                Xem chi tiết
                                            </button>

                                            {/* Cancel Order Button */}
                                            {isPending && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCancelOrderId(order.orderId)}
                                                    className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition shadow-2xs"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            )}

                                            {/* Return Order Button */}
                                            {isCompleted && (
                                                <button
                                                    type="button"
                                                    onClick={() => setReturnOrderId(order.orderId)}
                                                    className="px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-xs font-bold text-orange-700 hover:bg-orange-600 hover:text-white transition shadow-2xs"
                                                >
                                                    Yêu cầu trả hàng
                                                </button>
                                            )}

                                            {/* Reorder / Shop Button */}
                                            {/* <Link
                                                to="/product-list"
                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-red-600 transition shadow-xs"
                                            >
                                                <span>Mua lại</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link> */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 5. Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-center items-center gap-2 pt-8 pb-4">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            const isActive = page === p;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${isActive
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-neutral-900 hover:text-black'
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* 6. Order Detail Modal */}
            {detailOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                        onClick={() => setDetailOrder(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                            <div>
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                                    Chi tiết đơn hàng #SP-{detailOrder.orderId}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Thời gian đặt: {new Date(detailOrder.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailOrder(null)}
                                className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-200/60 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {/* Status Banner */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 uppercase">Trạng thái đơn hàng</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBadge(detailOrder.status)}`}>
                                    {translateStatus(detailOrder.status)}
                                </span>
                            </div>

                            {/* Recipient & Shipping Information */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                    <span>Thông tin nhận hàng</span>
                                </h4>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                                        <User className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{detailOrder.receiverName || currentUser?.name || 'Khách hàng'}</span>
                                        <span className="text-gray-300">•</span>
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{detailOrder.phone || 'Chưa có SĐT'}</span>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed pt-1">
                                        Địa chỉ: <strong>{detailOrder.address || 'Địa chỉ mặc định'}</strong>
                                    </div>
                                    {detailOrder.note && (
                                        <div className="text-gray-500 italic pt-1 border-t border-gray-200/60">
                                            Ghi chú: "{detailOrder.note}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Package className="w-4 h-4 text-red-600" />
                                    <span>Sản phẩm trong đơn ({detailOrder.items?.length || 0})</span>
                                </h4>
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                                    {detailOrder.items?.map((item: any) => (
                                        <div key={item.orderItemId || Math.random()} className="p-3.5 flex items-center gap-3.5">
                                            <img
                                                src={item.variant?.color?.images?.[0]?.url ? getImageUrl(item.variant.color.images[0].url) : '/placeholder.jpg'}
                                                className="w-12 h-14 object-cover rounded-xl border border-gray-100 shrink-0"
                                                alt="Thumb"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-bold text-gray-900 truncate">
                                                    {item.variant?.product?.name}
                                                </h5>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {item.variant?.color?.name} / {item.variant?.size?.name} • x{item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-xs font-black text-gray-900">
                                                {Number(item.price).toLocaleString('vi-VN')}₫
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                                <div className="flex justify-between text-gray-500">
                                    <span>Hình thức thanh toán</span>
                                    <strong className="text-gray-800">{getPaymentMethodLabel(detailOrder.paymentMethod)}</strong>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Trạng thái thanh toán</span>
                                    <strong className={detailOrder.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                                        {detailOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </strong>
                                </div>
                                <div className="border-t border-gray-200/80 pt-2 flex justify-between text-sm font-black text-gray-900">
                                    <span>Tổng số tiền</span>
                                    <span className="text-red-600 text-base">
                                        {Number(detailOrder.totalPrice).toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDetailOrder(null)}
                                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Cancel Order Modal */}
            {cancelOrderId && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                        onClick={() => !isCancelling && setCancelOrderId(null)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 z-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-black text-gray-900 uppercase">
                                Xác nhận hủy đơn hàng #SP-{cancelOrderId}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này sẽ hoàn trả số lượng sản phẩm vào kho và không thể hoàn tác.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3">
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => setCancelOrderId(null)}
                                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase hover:bg-gray-100 transition"
                            >
                                Giữ lại đơn
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={handleConfirmCancel}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase hover:bg-red-700 transition shadow-sm disabled:opacity-50"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Đang hủy...</span>
                                    </>
                                ) : (
                                    <span>Hủy đơn</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. Return Order Modal */}
            {returnOrderId && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                        onClick={() => !isReturning && setReturnOrderId(null)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 z-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 mx-auto rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <RotateCcw className="w-7 h-7" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-black text-gray-900 uppercase">
                                Yêu cầu trả hàng đơn #SP-{returnOrderId}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Chúng tôi hỗ trợ đổi trả miễn phí trong vòng 30 ngày đối với các sản phẩm còn nguyên tem mác. Đội ngũ CSKH sẽ liên hệ với bạn để tiếp nhận.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3">
                            <button
                                type="button"
                                disabled={isReturning}
                                onClick={() => setReturnOrderId(null)}
                                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase hover:bg-gray-100 transition"
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                disabled={isReturning}
                                onClick={handleConfirmReturn}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase hover:bg-orange-700 transition shadow-sm disabled:opacity-50"
                            >
                                {isReturning ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <span>Gửi yêu cầu</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;