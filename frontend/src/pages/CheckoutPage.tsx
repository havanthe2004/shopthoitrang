import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    CreditCard,
    Banknote,
    FileText,
    Check,
    ChevronRight,
    Plus,
    ShieldCheck,
    Truck,
    Phone,
    ShoppingBag,
    Loader2,
    ArrowLeft,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

import { getAddressesAPI } from '../services/userService';
import { createOrderServer } from '../redux/slices/orderSlice';
import { fetchCartServer } from '../redux/slices/cartSlice';
import { getWebsiteConfig } from '../services/configServise';
import { getImageUrl } from '../utils/imageUrl';
import AddressModal from '../components/profile/AddressModal';

const CheckoutPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>(
        (localStorage.getItem('temp_payment') as 'COD' | 'VNPAY') || 'COD'
    );
    const [note, setNote] = useState(localStorage.getItem('temp_note') || '');
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hotline, setHotline] = useState('0796419162');

    // Lấy thông tin từ state truyền từ CartPage
    const { totalAmount = 0, selectedIds = [], selectedItems = [] } = state || {};

    // Lấy số hotline từ Backend
    useEffect(() => {
        getWebsiteConfig()
            .then(data => {
                if (data?.phone) setHotline(data.phone);
            })
            .catch(() => {});
    }, []);

    // Điều hướng về giỏ hàng nếu không có state hoặc không có sản phẩm được chọn
    useEffect(() => {
        if (!state || !selectedIds || selectedIds.length === 0) {
            navigate('/cart', { replace: true });
        }
    }, [state, selectedIds, navigate]);

    // Tải danh sách địa chỉ giao hàng
    const fetchAddresses = useCallback(async () => {
        try {
            const data = await getAddressesAPI();
            setAddresses(data);
            const savedAddrId = localStorage.getItem('temp_address_id');
            const found = data.find((a: any) => a.addressId === Number(savedAddrId));
            setSelectedAddress(found || data.find((a: any) => a.isDefault) || data[0]);
        } catch {
            toast.error("Không thể tải danh sách địa chỉ nhận hàng");
        }
    }, []);

    useEffect(() => {
        if (state) {
            fetchAddresses();
        }
    }, [state, fetchAddresses]);

    // Lưu phương thức và ghi chú tạm vào localStorage
    useEffect(() => {
        localStorage.setItem('temp_payment', paymentMethod);
        localStorage.setItem('temp_note', note);
    }, [paymentMethod, note]);

    // Chọn địa chỉ nhận hàng
    const handleSelectAddress = (addr: any) => {
        setSelectedAddress(addr);
        localStorage.setItem('temp_address_id', addr.addressId.toString());
        setIsSelecting(false);
    };

    // Xác nhận và thực hiện đặt hàng
    const handleConfirmOrder = async () => {
        if (!selectedAddress) {
            toast.warning("Vui lòng chọn hoặc thêm địa chỉ nhận hàng");
            return;
        }

        setIsLoading(true);
        setIsConfirmModalOpen(false);

        try {
            const orderData = {
                selectedIds,
                totalPrice: totalAmount,
                receiverName: selectedAddress.receiverName,
                phone: selectedAddress.phone,
                address: `${selectedAddress.detailAddress}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
                paymentMethod,
                note
            };

            const result = await dispatch(createOrderServer(orderData) as any);

            if (result.meta.requestStatus === 'fulfilled') {
                await dispatch(fetchCartServer() as any);

                localStorage.removeItem('temp_payment');
                localStorage.removeItem('temp_note');
                localStorage.removeItem('temp_address_id');

                if (paymentMethod === 'VNPAY' && result.payload?.url) {
                    window.location.href = result.payload.url;
                } else {
                    navigate('/order-success', {
                        state: { orderId: result.payload?.orderId },
                        replace: true
                    });
                }
            } else {
                toast.error(result.payload?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
            }
        } catch {
            toast.error("Đã có lỗi xảy ra trong quá trình đặt hàng");
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    };

    if (!state) return null;

    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-28 md:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* 1. BREADCRUMBS NAVIGATION */}
                <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
                    <Link to="/" className="hover:text-slate-900 transition-colors">
                        Trang chủ
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <Link to="/cart" className="hover:text-slate-900 transition-colors">
                        Giỏ hàng
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-semibold">Thanh toán</span>
                </nav>

                {/* 2. CHECKOUT STEPPER (BƯỚC 2 ACTIVE) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-8">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        {/* Bước 1: Giỏ hàng (Đã xong) */}
                        <Link to="/cart" className="flex items-center gap-2 sm:gap-3 group">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity">
                                <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors leading-none">
                                    Giỏ hàng
                                </p>
                                <span className="text-[10px] text-emerald-600 font-semibold">Đã hoàn thành</span>
                            </div>
                        </Link>

                        <div className="flex-1 h-0.5 bg-emerald-500 mx-3 sm:mx-6" />

                        {/* Bước 2: Thanh toán (Active) */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-sm ring-4 ring-slate-900/10">
                                2
                            </div>
                            <div className="text-left">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none">
                                    Đặt hàng & Thanh toán
                                </p>
                                <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">
                                    Đang tiến hành
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 h-0.5 bg-slate-200 mx-3 sm:mx-6" />

                        {/* Bước 3: Hoàn tất */}
                        <div className="flex items-center gap-2 sm:gap-3 opacity-40">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-xs sm:text-sm flex items-center justify-center border border-slate-300">
                                3
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-none">Hoàn thành</p>
                                <span className="text-[10px] text-slate-400">Nhận đơn hàng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. TIÊU ĐỀ & NÚT QUAY LẠI */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                            <span>Thông tin thanh toán</span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                                {selectedIds.length} món đồ
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Vui lòng kiểm tra địa chỉ giao hàng và phương thức thanh toán trước khi xác nhận đặt hàng
                        </p>
                    </div>

                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors uppercase tracking-wider self-start sm:self-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Quay lại giỏ hàng</span>
                    </Link>
                </div>

                {/* 4. GRID CHÍNH: FORM THANH TOÁN (8 COLS) & TỔNG KẾT ĐƠN HÀNG (4 COLS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* CỘT TRÁI: ĐỊA CHỈ, PHƯƠNG THỨC & GHI CHÚ (8 COLS) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SECTION 01: ĐỊA CHỈ NHẬN HÀNG */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                                        01. Địa chỉ nhận hàng
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Thêm địa chỉ mới</span>
                                </button>
                            </div>

                            {!isSelecting ? (
                                selectedAddress ? (
                                    <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-base font-black text-slate-900">
                                                    {selectedAddress.receiverName}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-800">
                                                    {selectedAddress.phone}
                                                </span>
                                                {selectedAddress.isDefault && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                                                        Mặc định
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                {selectedAddress.detailAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsSelecting(true)}
                                            className="self-start sm:self-center py-2.5 px-5 rounded-xl bg-white border border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200">
                                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500 mb-3">Bạn chưa có địa chỉ nhận hàng nào</p>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            className="py-2.5 px-4 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            + Tạo địa chỉ nhận hàng
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Chọn một địa chỉ giao hàng:</p>
                                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                        {addresses.map((addr) => {
                                            const isCurrent = selectedAddress?.addressId === addr.addressId;
                                            return (
                                                <div
                                                    key={addr.addressId}
                                                    onClick={() => handleSelectAddress(addr)}
                                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                        isCurrent
                                                            ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                                isCurrent ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                                                            }`}
                                                        >
                                                            {isCurrent && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-900">
                                                                    {addr.receiverName}
                                                                </span>
                                                                <span className="text-xs text-slate-500 font-medium">
                                                                    — {addr.phone}
                                                                </span>
                                                                {addr.isDefault && (
                                                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                                                        Mặc định
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-600">
                                                                {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isCurrent && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-2 flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsSelecting(false)}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
                                        >
                                            Thu gọn / Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 02: PHƯƠNG THỨC THANH TOÁN */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                                <div className="w-7 h-7 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                                    02. Phương thức thanh toán
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* COD OPTION */}
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                                        paymentMethod === 'COD'
                                            ? 'border-slate-900 bg-slate-50/70 shadow-sm ring-1 ring-slate-900/10'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                                            <Banknote className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === 'COD' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                                            }`}
                                        >
                                            {paymentMethod === 'COD' && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide mb-1">
                                            Thanh toán khi nhận hàng (COD)
                                        </h3>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi bưu kiện được giao đến nơi.
                                        </p>
                                    </div>
                                </div>

                                {/* VNPAY OPTION */}
                                <div
                                    onClick={() => setPaymentMethod('VNPAY')}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                                        paymentMethod === 'VNPAY'
                                            ? 'border-slate-900 bg-slate-50/70 shadow-sm ring-1 ring-slate-900/10'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="h-10 px-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <img
                                                src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png"
                                                alt="VNPAY"
                                                className="h-6 object-contain"
                                            />
                                        </div>
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === 'VNPAY' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                                            }`}
                                        >
                                            {paymentMethod === 'VNPAY' && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide mb-1">
                                            Thanh toán qua VNPAY
                                        </h3>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Quét mã VNPAY-QR qua ứng dụng Ngân hàng hoặc thanh toán nhanh bằng thẻ ATM, Visa, Mastercard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 03: GHI CHÚ ĐƠN HÀNG */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                                <div className="w-7 h-7 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                                    03. Ghi chú giao hàng (Tùy chọn)
                                </h2>
                            </div>

                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200/80 p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none"
                                rows={3}
                                placeholder="Ví dụ: Giao hàng vào giờ hành chính, gọi điện trước khi giao hàng 15 phút..."
                            />
                        </div>
                    </div>

                    {/* CỘT PHẢI: ORDER SUMMARY & NÚT ĐẶT HÀNG (4 COLS) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-4">

                            {/* KHUNG TỔNG KẾT ĐƠN HÀNG */}
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                <h2 className="text-base font-black uppercase tracking-wider text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
                                    <span>Đơn hàng của bạn</span>
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                        {selectedIds.length} món
                                    </span>
                                </h2>

                                {/* DANH SÁCH SẢN PHẨM MUA (PREVIEW MINI-LIST) */}
                                {selectedItems.length > 0 && (
                                    <div className="my-5 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                                        {selectedItems.map((item: any) => (
                                            <div key={item.productVariantId} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                                                <div className="w-12 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Fashion';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                                        {item.color && <span>Màu: {item.color}</span>}
                                                        {item.size && <span>• Size: {item.size}</span>}
                                                        <span>• SL: {item.quantity}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-900 mt-1">
                                                        {formatPrice(Number(item.price) * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* BẢNG TÍNH TIỀN */}
                                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs sm:text-sm">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Tạm tính</span>
                                        <span className="font-bold text-slate-900">{formatPrice(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Phí giao hàng</span>
                                        <span className="text-emerald-600 font-bold uppercase text-xs">Miễn phí</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Hình thức</span>
                                        <span className="font-bold text-slate-900">
                                            {paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'VNPAY'}
                                        </span>
                                    </div>
                                </div>

                                {/* TỔNG TIỀN THANH TOÁN */}
                                <div className="pt-5 border-t border-dashed border-slate-200 my-6">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div>
                                            <span className="font-black text-sm uppercase tracking-wide text-slate-900">
                                                Tổng thanh toán
                                            </span>
                                            <p className="text-[10px] text-slate-400 font-normal">
                                                (Đã bao gồm VAT & Miễn phí vận chuyển)
                                            </p>
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
                                            {formatPrice(totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {/* NÚT MỞ MODAL XÁC NHẬN HOẶC ĐẶT HÀNG */}
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    disabled={isLoading || !selectedAddress}
                                    className={`w-full py-4 px-6 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md ${
                                        isLoading || !selectedAddress
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                            : 'bg-slate-900 hover:bg-red-600 text-white hover:shadow-xl hover:shadow-red-600/20 active:scale-[0.99] cursor-pointer'
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Đang xử lý đơn hàng...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Xác nhận đặt hàng</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                {!selectedAddress && (
                                    <p className="text-[11px] text-amber-600 bg-amber-50 rounded-xl p-2.5 mt-3 text-center border border-amber-200/80 flex items-center justify-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>Vui lòng chọn địa chỉ giao hàng để tiếp tục</span>
                                    </p>
                                )}

                                <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
                                    Bằng việc nhấn đặt hàng, bạn đồng ý với các điều khoản mua sắm và chính sách giao nhận của cửa hàng.
                                </p>
                            </div>

                            {/* CHÍNH SÁCH CAM KẾT & HOTLINE TỪ BACKEND */}
                            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                                <div className="flex items-center gap-3 text-xs text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-800">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">Bảo mật thanh toán 100%</p>
                                        <p className="text-[11px] text-slate-500">Mã hóa thông tin giao dịch an toàn</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-800">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">Kiểm tra hàng trước khi nhận</p>
                                        <p className="text-[11px] text-slate-500">Đồng kiểm tra cùng bưu tá giao hàng</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-800">
                                        <Phone className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">
                                            Hotline hỗ trợ: <a href={`tel:${hotline}`} className="text-red-600 hover:underline">{hotline}</a>
                                        </p>
                                        <p className="text-[11px] text-slate-500">Giải đáp thắc mắc đơn hàng 24/7</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL XÁC NHẬN ĐƠN HÀNG SANG TRỌNG (CUSTOM ORDER CONFIRMATION DIALOG) */}
            <AnimatePresence>
                {isConfirmModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 border border-slate-100"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-1">
                                Xác nhận đặt hàng
                            </h3>
                            <p className="text-xs text-slate-500 text-center mb-6">
                                Vui lòng kiểm tra lại thông tin đơn hàng lần cuối trước khi tiến hành thanh toán.
                            </p>

                            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs mb-6">
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-500">Người nhận:</span>
                                    <span className="font-bold text-slate-900 text-right">
                                        {selectedAddress?.receiverName} ({selectedAddress?.phone})
                                    </span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-500">Giao đến:</span>
                                    <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                                        {selectedAddress?.detailAddress}, {selectedAddress?.province}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Phương thức:</span>
                                    <span className="font-bold text-slate-900">
                                        {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'VNPAY'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-700">Tổng thanh toán:</span>
                                    <span className="text-base font-black text-red-600">
                                        {formatPrice(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Xem lại
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmOrder}
                                    disabled={isLoading}
                                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Đang tạo...</span>
                                        </>
                                    ) : (
                                        <span>Đồng ý đặt</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL THÊM ĐỊA CHỈ MỚI */}
            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAddresses}
            />
        </div>
    );
};

export default CheckoutPage;