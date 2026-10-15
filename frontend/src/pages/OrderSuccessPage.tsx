import { useEffect } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, Home, PackageCheck, Check } from 'lucide-react';
import { clearCart } from '../redux/slices/cartSlice';

const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const dispatch = useDispatch();

    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId') || (location.state as any)?.orderId;
    const isSuccess = status === 'success' || !status;

    useEffect(() => {
        if (isSuccess) {
            dispatch(clearCart());
        }
    }, [isSuccess, dispatch]);

    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">

                {/* CHECKOUT STEPPER (HOÀN THÀNH CẢ 3 BƯỚC) */}
                {isSuccess && (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-10">
                        <div className="max-w-2xl mx-auto flex items-center justify-between">
                            {/* Bước 1 */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 hidden sm:inline">Giỏ hàng</span>
                            </div>

                            <div className="flex-1 h-0.5 bg-emerald-500 mx-3 sm:mx-6" />

                            {/* Bước 2 */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 hidden sm:inline">Thanh toán</span>
                            </div>

                            <div className="flex-1 h-0.5 bg-emerald-500 mx-3 sm:mx-6" />

                            {/* Bước 3 */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-4 ring-slate-900/10">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-bold text-slate-900 leading-none block">Hoàn tất</span>
                                    <span className="text-[10px] text-emerald-600 font-semibold">Thành công</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* THẺ THÔNG BÁO CHÍNH */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.06)] text-center"
                >
                    {isSuccess ? (
                        <>
                            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <CheckCircle2 className="w-10 h-10 animate-bounce" />
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
                                Đặt hàng thành công!
                            </h1>

                            {orderId && (
                                <div className="inline-block my-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                                    Mã đơn hàng: <span className="text-red-600 font-extrabold">#{orderId}</span>
                                </div>
                            )}

                            <p className="text-sm text-slate-500 max-w-md mx-auto mt-3 mb-8 leading-relaxed">
                                Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi. Chúng tôi đã nhận được đơn hàng và sẽ liên hệ giao hàng trong thời gian sớm nhất.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                                <Link
                                    to="/my-order"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg group"
                                >
                                    <PackageCheck className="w-4 h-4" />
                                    <span>Xem đơn hàng của tôi</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <Link
                                    to="/"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Tiếp tục mua sắm</span>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <XCircle className="w-10 h-10" />
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
                                Thanh toán không thành công
                            </h1>

                            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-8 leading-relaxed">
                                Giao dịch thanh toán trực tuyến qua VNPAY đã bị hủy hoặc gặp sự cố. Sản phẩm của bạn vẫn được lưu trong giỏ hàng.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                                <Link
                                    to="/cart"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Quay lại giỏ hàng</span>
                                </Link>

                                <Link
                                    to="/"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                                >
                                    <span>Về trang chủ</span>
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;