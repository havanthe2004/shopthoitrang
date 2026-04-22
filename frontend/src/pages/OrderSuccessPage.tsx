import { useEffect } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';

const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    useEffect(() => {

        if (status === 'success') {
            dispatch(clearCart());
        }
    }, [status, dispatch]);

    return (
        <div className="max-w-2xl mx-auto py-32 text-center" style={{ fontFamily: 'Times New Roman' }}>
            {status === 'success' || !status ? (
                <>
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 animate-bounce" />
                    <h2 className="text-4xl font-black uppercase italic">Đặt hàng thành công!</h2>
                    <p className="mt-4 text-gray-600">Mã đơn hàng của bạn là: <strong>#{orderId || "N/A"}</strong></p>
                    <p className="italic text-sm text-gray-400 mt-2">Chúng tôi sẽ sớm liên hệ xác nhận đơn hàng.</p>
                </>
            ) : (
                <>
                    <FaTimesCircle className="text-red-500 text-7xl mx-auto mb-6" />
                    <h2 className="text-4xl font-black uppercase italic">Thanh toán thất bại</h2>
                    <p className="mt-4 text-gray-600">Giao dịch đã bị hủy hoặc gặp lỗi.</p>
                </>
            )}

            <div className="mt-12 flex justify-center gap-6">
                <Link to="/" className="border-2 border-black px-8 py-3 font-bold uppercase text-[10px] hover:bg-black hover:text-white transition">Về trang chủ</Link>
                <Link to="/my-order" className="bg-black text-white px-8 py-3 font-bold uppercase text-[10px] hover:bg-red-600 transition">Đơn hàng của tôi</Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;