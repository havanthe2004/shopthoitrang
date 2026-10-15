import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Trash2,
    Minus,
    Plus,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Truck,
    RotateCcw,
    Phone,
    Sparkles,
    AlertCircle,
    PackageX,
    ChevronRight,
    Check,
    LogIn
} from 'lucide-react';
import { toast } from 'react-toastify';

import type { RootState } from '../redux/store';
import {
    updateQuantityServer,
    removeFromCartServer,
    fetchCartServer,
    type ICartItem
} from '../redux/slices/cartSlice';
import { getImageUrl } from '../utils/imageUrl';
import { getWebsiteConfig } from '../services/configServise';


const CartPage = () => {
    const { cartItems, loading } = useSelector((state: RootState) => state.cart);
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [updatingVariantId, setUpdatingVariantId] = useState<number | null>(null);
    const [hotline, setHotline] = useState<string>("0796419162");

    useEffect(() => {
        getWebsiteConfig()
            .then(data => {
                if (data?.phone) setHotline(data.phone);
            })
            .catch(() => {});
    }, []);

    // State cho Modal xác nhận xóa
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'single' | 'selected';
        item?: ICartItem;
    }>({
        isOpen: false,
        type: 'single'
    });

    // Lấy giỏ hàng từ server khi mount hoặc thay đổi phân trang (nếu đã đăng nhập)
    useEffect(() => {
        if (!currentUser) return;

        dispatch(fetchCartServer({ page, limit }) as any)
            .unwrap()
            .then((res: any) => {
                if (res?.pagination?.totalPages) {
                    setTotalPages(res.pagination.totalPages);
                }
            })
            .catch(() => {
                // Xử lý im lặng nếu lỗi mạng hoặc token
            });

        setSelectedIds([]);
    }, [currentUser, dispatch, page, limit]);

    // Tính toán các thông số từ sản phẩm được chọn
    const { selectedTotal, selectedCount, selectedItemsData } = useMemo(() => {
        const selectedItems = cartItems.filter((item: ICartItem) =>
            selectedIds.includes(item.productVariantId)
        );

        const total = selectedItems.reduce(
            (sum, item) => sum + (Number(item.price) * item.quantity),
            0
        );

        return {
            selectedTotal: total,
            selectedCount: selectedItems.length,
            selectedItemsData: selectedItems
        };
    }, [cartItems, selectedIds]);

    const isAllSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

    // Chọn / Bỏ chọn từng sản phẩm
    const handleToggleSelect = (variantId: number) => {
        setSelectedIds(prev =>
            prev.includes(variantId)
                ? prev.filter(id => id !== variantId)
                : [...prev, variantId]
        );
    };

    // Chọn / Bỏ chọn tất cả
    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartItems.map(item => item.productVariantId));
        }
    };

    // Cập nhật số lượng
    const handleUpdateQuantity = async (
        productVariantId: number,
        currentQty: number,
        adjustment: number,
        stock: number
    ) => {
        const newQty = currentQty + adjustment;

        if (newQty < 1) return;

        if (newQty > stock) {
            toast.warning(`Chỉ còn ${stock} sản phẩm trong kho`);
            return;
        }

        try {
            setUpdatingVariantId(productVariantId);
            await dispatch(updateQuantityServer({
                productVariantId,
                quantity: newQty
            }) as any).unwrap();
        } catch (error: any) {
            toast.error(error?.message || "Không thể cập nhật số lượng");
        } finally {
            setUpdatingVariantId(null);
        }
    };

    // Mở modal xác nhận xóa 1 sản phẩm
    const promptRemoveItem = (item: ICartItem) => {
        setDeleteModal({
            isOpen: true,
            type: 'single',
            item
        });
    };

    // Mở modal xác nhận xóa tất cả sản phẩm đã chọn
    const promptRemoveSelected = () => {
        if (selectedIds.length === 0) return;
        setDeleteModal({
            isOpen: true,
            type: 'selected'
        });
    };

    // Thực hiện xóa khi xác nhận trong Modal
    const handleConfirmDelete = async () => {
        if (deleteModal.type === 'single' && deleteModal.item) {
            const variantId = deleteModal.item.productVariantId;
            try {
                await dispatch(removeFromCartServer(variantId) as any).unwrap();
                toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
                setSelectedIds(prev => prev.filter(id => id !== variantId));
            } catch {
                toast.error("Không thể xóa sản phẩm lúc này");
            }
        } else if (deleteModal.type === 'selected') {
            try {
                await Promise.all(
                    selectedIds.map(id => dispatch(removeFromCartServer(id) as any).unwrap())
                );
                toast.success(`Đã xóa ${selectedIds.length} sản phẩm đã chọn`);
                setSelectedIds([]);
            } catch {
                toast.error("Có lỗi xảy ra khi xóa một số sản phẩm");
            }
        }
        setDeleteModal({ isOpen: false, type: 'single' });
    };

    // Điều hướng tới Checkout
    const handleGoToCheckout = () => {
        if (selectedIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
            return;
        }

        navigate('/checkout', {
            state: {
                selectedItems: selectedItemsData,
                totalAmount: selectedTotal,
                selectedIds: selectedItemsData.map(item => item.productVariantId)
            }
        });
    };

    // Format tiền tệ chuẩn VND
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    };


    // ==========================================
    // 1. TRƯỜNG HỢP CHƯA ĐĂNG NHẬP (GUEST VIEW)
    // ==========================================
    if (!currentUser) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.06)]"
                >
                    <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                            <LogIn className="w-9 h-9 text-slate-800" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
                        Đăng nhập để xem giỏ hàng
                    </h2>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        Vui lòng đăng nhập vào tài khoản của bạn để xem danh sách các món đồ đã lưu và tiếp tục đặt hàng nhanh chóng.
                    </p>

                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-slate-900 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group"
                        >
                            <span>Đăng nhập ngay</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            to="/"
                            className="inline-flex items-center justify-center w-full py-3.5 px-6 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                        >
                            Khám phá trang chủ
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // 2. TRẠNG THÁI GIỎ HÀNG TRỐNG (EMPTY STATE)
    // ==========================================
    if (cartItems.length === 0 && !loading) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.06)]"
                >
                    <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-red-50 rounded-full animate-ping opacity-60" />
                        <div className="relative w-20 h-20 bg-gradient-to-tr from-red-100 to-rose-50 rounded-full flex items-center justify-center shadow-inner">
                            <ShoppingBag className="w-10 h-10 text-red-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">
                        Giỏ hàng của bạn đang trống
                    </h2>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        Bạn chưa có sản phẩm nào trong túi đồ. Hãy khám phá bộ sưu tập thời trang xu hướng mới nhất ngay hôm nay!
                    </p>

                    <Link
                        to="/product-list"
                        className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-slate-900 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Khám phá bộ sưu tập ngay</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // 3. GIAO DIỆN CHÍNH CỦA GIỎ HÀNG
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-28 md:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* BREADCRUMBS NAVIGATION */}
                <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
                    <Link to="/" className="hover:text-slate-900 transition-colors">
                        Trang chủ
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-semibold">Giỏ hàng ({cartItems.length})</span>
                </nav>

                {/* TIÊU ĐỀ CHÍNH & NÚT TIẾP TỤC MUA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                            <span>Túi mua sắm</span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                                {cartItems.length} sản phẩm
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Kiểm tra lại danh sách món đồ bạn muốn sở hữu trước khi thanh toán
                        </p>
                    </div>

                    <Link
                        to="/product-list"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors uppercase tracking-wider self-start sm:self-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Tiếp tục chọn đồ</span>
                    </Link>
                </div>

                {/* LAYOUT CHÍNH: CỘT SẢN PHẨM (8 COLS) & CỘT TỔNG ĐƠN HÀNG (4 COLS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM (LG: 8 COLS) */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* TOOLBAR: CHỌN TẤT CẢ & XÓA CÁC MỤC ĐÃ CHỌN */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleToggleSelectAll}
                                        className="w-5 h-5 rounded-md border-2 border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-slate-900 transition-all"
                                    />
                                </div>
                                <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-red-600 transition-colors uppercase tracking-wide">
                                    Chọn tất cả ({cartItems.length})
                                </span>
                            </label>

                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                                        Đã chọn <strong className="text-slate-900">{selectedCount}</strong> sản phẩm
                                    </span>
                                    <button
                                        type="button"
                                        onClick={promptRemoveSelected}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Xóa đã chọn</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DANH SÁCH CÁC MẶT HÀNG TRONG GIỎ */}
                        <div className="space-y-3.5">
                            <AnimatePresence>
                                {cartItems.map((item) => {
                                    const isSelected = selectedIds.includes(item.productVariantId);
                                    const isUpdating = updatingVariantId === item.productVariantId;
                                    const itemSubtotal = Number(item.price) * item.quantity;

                                    return (
                                        <motion.div
                                            key={item.productVariantId}
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${isSelected
                                                ? 'border-slate-900/30 shadow-md ring-1 ring-slate-900/5'
                                                : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                                                }`}
                                        >
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-5">

                                                {/* Checkbox chọn sản phẩm */}
                                                <div className="pt-2 sm:pt-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSelect(item.productVariantId)}
                                                        className="w-5 h-5 rounded-md border-2 border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-slate-900 transition-all"
                                                    />
                                                </div>

                                                {/* Hình ảnh sản phẩm với tỷ lệ chuẩn thời trang */}
                                                <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 relative group">
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Fashion';
                                                        }}
                                                    />
                                                    {item.stock <= 5 && item.stock > 0 && (
                                                        <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[9px] font-bold text-center py-0.5">
                                                            Còn {item.stock} cái
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Chi tiết sản phẩm & Thao tác */}
                                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                                    {/* Thông tin tên, phân loại, giá */}
                                                    <div className="space-y-1.5 flex-1 pr-2">
                                                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                                                            {item.name}
                                                        </h3>

                                                        {/* Tags phân loại màu sắc & kích cỡ */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {item.color && (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                                                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                                                                    Màu: {item.color}
                                                                </span>
                                                            )}
                                                            {item.size && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-50 text-slate-800 border border-slate-200">
                                                                    Size: {item.size}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Đơn giá */}
                                                        <div className="pt-0.5">
                                                            <span className="text-xs text-slate-400 font-medium">Đơn giá: </span>
                                                            <span className="text-xs sm:text-sm font-bold text-slate-700">
                                                                {formatPrice(Number(item.price))}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bộ đếm số lượng, Thành tiền & Nút xóa */}
                                                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">

                                                        {/* Bộ điều khiển số lượng (Quantity Controller) */}
                                                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-1 shadow-inner">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateQuantity(item.productVariantId, item.quantity, -1, item.stock)}
                                                                disabled={item.quantity <= 1 || isUpdating}
                                                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:text-black hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                                                                aria-label="Giảm số lượng"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>

                                                            <span className="w-9 text-center font-bold text-xs sm:text-sm text-slate-900">
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateQuantity(item.productVariantId, item.quantity, 1, item.stock)}
                                                                disabled={item.quantity >= item.stock || isUpdating}
                                                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:text-black hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                                                                aria-label="Tăng số lượng"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Thành tiền từng món */}
                                                        <div className="text-right min-w-[90px] sm:min-w-[110px]">
                                                            <p className="text-[10px] text-slate-400 uppercase font-semibold hidden sm:block">Thành tiền</p>
                                                            <span className="text-sm sm:text-base font-extrabold text-red-600">
                                                                {formatPrice(itemSubtotal)}
                                                            </span>
                                                        </div>

                                                        {/* Nút xóa sản phẩm */}
                                                        <button
                                                            type="button"
                                                            onClick={() => promptRemoveItem(item)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                                                            title="Xóa sản phẩm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* PHÂN TRANG HIỆN ĐẠI (PAGINATION) */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-6 pb-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Trang trước
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => {
                                    const pageNum = i + 1;
                                    const isActive = page === pageNum;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${isActive
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: ORDER SUMMARY & CAM KẾT (LG: 4 COLS) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-4">

                            {/* KHUNG TỔNG KẾT ĐƠN HÀNG (SUMMARY CARD) */}
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">

                                <h2 className="text-base font-black uppercase tracking-wider text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
                                    <span>Tóm tắt đơn hàng</span>
                                    <span className="text-xs font-bold text-slate-500 capitalize">
                                        ({selectedCount} món đã chọn)
                                    </span>
                                </h2>

                                {/* ƯU ĐÃI MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC */}
                                <div className="mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                            <span>Miễn phí giao hàng</span>
                                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                        </p>
                                        <p className="text-[11px] text-emerald-700/90 mt-0.5">
                                            Áp dụng miễn phí vận chuyển cho mọi đơn hàng toàn quốc
                                        </p>
                                    </div>
                                </div>

                                {/* BẢNG TÍNH GIÁ TIỀN */}
                                <div className="space-y-3.5 my-6 text-xs sm:text-sm">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Tạm tính ({selectedCount} sản phẩm)</span>
                                        <span className="font-bold text-slate-900">
                                            {formatPrice(selectedTotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-emerald-600 font-bold uppercase text-xs">Miễn phí</span>
                                    </div>

                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Ưu đãi / Voucher</span>
                                        <span className="text-slate-400 text-xs">Áp dụng ở bước sau</span>
                                    </div>
                                </div>

                                {/* TỔNG CỘNG THANH TOÁN */}
                                <div className="pt-5 border-t border-dashed border-slate-200 mb-6">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div>
                                            <span className="font-black text-sm uppercase tracking-wide text-slate-900">
                                                Tổng thanh toán
                                            </span>
                                            <p className="text-[11px] text-slate-400 font-normal">
                                                (Đã bao gồm thuế VAT nếu có)
                                            </p>
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
                                            {formatPrice(selectedTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* NÚT TIẾN HÀNH ĐẶT HÀNG / THANH TOÁN */}
                                <button
                                    type="button"
                                    onClick={handleGoToCheckout}
                                    disabled={selectedIds.length === 0}
                                    className={`w-full py-4 px-6 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${selectedIds.length > 0
                                        ? 'bg-slate-900 hover:bg-red-600 text-white hover:shadow-xl hover:shadow-red-600/20 active:scale-[0.99] cursor-pointer'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    <span>Tiến hành đặt hàng ({selectedCount})</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {selectedIds.length === 0 && (
                                    <p className="text-[11px] text-amber-600 bg-amber-50 rounded-xl p-2.5 mt-3 text-center border border-amber-200/80 flex items-center justify-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>Vui lòng tích chọn sản phẩm bạn muốn mua</span>
                                    </p>
                                )}
                            </div>

                            {/* CHÍNH SÁCH CAM KẾT & AN TÂM MUA SẮM (TRUST BADGES) */}
                            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                                <div className="flex items-center gap-3 text-xs text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-800">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">100% Chính hãng</p>
                                        <p className="text-[11px] text-slate-500">Cam kết chất lượng cao cấp</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-800">
                                        <RotateCcw className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">Đổi trả trong 30 ngày</p>
                                        <p className="text-[11px] text-slate-500">Thủ tục nhanh chóng, tiện lợi</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-800">
                                        <Phone className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">
                                            Hỗ trợ hotline: <a href={`tel:${hotline}`} className="text-red-600 hover:underline">{hotline}</a>
                                        </p>
                                        <p className="text-[11px] text-slate-500">Tư vấn tận tình từ 8h00 - 22h00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* THANH DÍNH DƯỚI ĐÁY CHO THIẾT BỊ DI ĐỘNG (MOBILE STICKY BOTTOM BAR) */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
                <div className="max-w-md mx-auto flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 accent-slate-900"
                        />
                        <span className="text-xs font-bold text-slate-700">Tất cả</span>
                    </label>

                    <div className="text-right">
                        <span className="text-[10px] text-slate-500">Tổng ({selectedCount} món):</span>
                        <p className="text-base sm:text-lg font-black text-red-600 leading-none">
                            {formatPrice(selectedTotal)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoToCheckout}
                        disabled={selectedIds.length === 0}
                        className={`py-3 px-5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${selectedIds.length > 0
                            ? 'bg-slate-900 text-white hover:bg-red-600 shadow-md active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Mua hàng
                    </button>
                </div>
            </div>

            {/* MODAL XÁC NHẬN XÓA HIỆN ĐẠI (CUSTOM CONFIRMATION MODAL) */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 border border-slate-100"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <PackageX className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
                                {deleteModal.type === 'single'
                                    ? "Xóa sản phẩm khỏi giỏ?"
                                    : "Xóa các sản phẩm đã chọn?"}
                            </h3>

                            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                                {deleteModal.type === 'single' && deleteModal.item ? (
                                    <>
                                        Bạn có chắc chắn muốn bỏ <strong className="text-slate-800">"{deleteModal.item.name}"</strong> ra khỏi túi đồ của mình?
                                    </>
                                ) : (
                                    <>
                                        Bạn có chắc muốn xóa <strong className="text-slate-800">{selectedIds.length}</strong> sản phẩm đang được chọn? Thao tác này không thể hoàn tác.
                                    </>
                                )}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Giữ lại
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                                >
                                    Đồng ý xóa
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CartPage;