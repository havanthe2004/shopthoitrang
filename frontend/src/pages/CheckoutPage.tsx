import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillAlt, FaRegStickyNote, FaCheck, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { getAddressesAPI } from '../services/userService';
import { createOrderServer } from '../redux/slices/orderSlice';
import { fetchCartServer } from '../redux/slices/cartSlice';
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

    const { totalAmount = 0, selectedIds = [] } = state || {};
    const fetchAddresses = useCallback(async () => {
        try {
            const data = await getAddressesAPI();
            setAddresses(data);
            const savedAddrId = localStorage.getItem('temp_address_id');
            const found = data.find((a: any) => a.addressId === Number(savedAddrId));
            setSelectedAddress(found || data.find((a: any) => a.isDefault) || data[0]);
        } catch (err) {
            toast.error("Lỗi tải địa chỉ");
        }
    }, []);

    const handleSelectAddress = (addr: any) => {
        setSelectedAddress(addr);
        localStorage.setItem('temp_address_id', addr.addressId.toString());
        setIsSelecting(false);
    };

    const handleConfirmOrder = async () => {
        if (!selectedAddress) return toast.warning("Vui lòng chọn địa chỉ giao hàng");
        
        setIsLoading(true);
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

                if (paymentMethod === 'VNPAY' && result.payload.url) {
                    window.location.href = result.payload.url;
                } else {
                    navigate('/order-success', { 
                        state: { orderId: result.payload.orderId },
                        replace: true 
                    });
                }
            } else {
                toast.error(result.payload?.message || "Đặt hàng thất bại hihi");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (!state) {
            navigate('/cart', { replace: true });
        }
    }, [state, navigate]);


    useEffect(() => {
        if (state) {
            fetchAddresses();
        }
    }, [state, fetchAddresses]);

  
    useEffect(() => {
        localStorage.setItem('temp_payment', paymentMethod);
        localStorage.setItem('temp_note', note);
    }, [paymentMethod, note]);
    if (!state) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12" style={{ fontFamily: 'Times New Roman' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-12">
                    <h1 className="text-4xl font-black italic uppercase underline decoration-red-600 underline-offset-8">Thanh toán</h1>

            
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b-2 pb-4">
                            <span className="font-black uppercase italic text-sm flex items-center gap-2">
                                <FaMapMarkerAlt className="text-red-600" /> 01. Địa chỉ nhận hàng
                            </span>
                            <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-bold uppercase underline hover:text-red-600 transition">+ Thêm mới</button>
                        </div>

                        {!isSelecting ? (
                            <div className="bg-gray-50 border-l-8 border-black p-8 flex justify-between items-center group transition-all duration-300">
                                <div className="space-y-2">
                                    <p className="font-black text-xl italic uppercase tracking-tighter">
                                        {selectedAddress?.receiverName} <span className="text-gray-400 font-bold text-sm ml-4">| {selectedAddress?.phone}</span>
                                    </p>
                                    <p className="text-gray-500 text-sm">{selectedAddress?.detailAddress}, {selectedAddress?.province}</p>
                                </div>
                                <button onClick={() => setIsSelecting(true)} className="bg-black text-white text-[10px] px-6 py-2 font-black uppercase hover:bg-red-600 transition shadow-lg">Thay đổi</button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.addressId}
                                        onClick={() => handleSelectAddress(addr)}
                                        className={`w-full p-6 border-2 flex justify-between items-center cursor-pointer transition-all ${selectedAddress?.addressId === addr.addressId
                                            ? 'border-black bg-gray-50 shadow-md'
                                            : 'border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${selectedAddress?.addressId === addr.addressId ? 'border-black' : 'border-gray-300'}`}>
                                                {selectedAddress?.addressId === addr.addressId && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black uppercase text-sm italic tracking-tight">{addr.receiverName} — {addr.phone}</p>
                                                <p className="text-[12px] text-gray-500 font-medium">{addr.detailAddress}, {addr.province}</p>
                                            </div>
                                        </div>
                                        {selectedAddress?.addressId === addr.addressId && <FaCheck className="text-black text-sm" />}
                                    </div>
                                ))}
                                <button onClick={() => setIsSelecting(false)} className="self-start text-[10px] font-bold uppercase underline text-gray-400 hover:text-black mt-2 ml-2">Hủy</button>
                            </div>
                        )}
                    </div>

            
                    <div className="space-y-6">
                        <span className="font-black uppercase italic text-sm flex items-center gap-2"><FaCreditCard className="text-red-600" /> 02. Phương thức thanh toán</span>
                        <div className="flex flex-col space-y-4">
                            <button onClick={() => setPaymentMethod('COD')} className={`w-full p-6 border-2 flex items-center gap-6 transition-all ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-100 bg-white/20'}`}>
                                <FaMoneyBillAlt size={24} className={paymentMethod === 'COD' ? 'text-black' : 'text-gray-300'} />
                                <span className="font-black uppercase text-xs tracking-widest">Thanh toán khi nhận hàng (COD)</span>
                            </button>
                            <button onClick={() => setPaymentMethod('VNPAY')} className={`w-full p-6 border-2 flex items-center gap-6 transition-all ${paymentMethod === 'VNPAY' ? 'border-black bg-gray-50' : 'border-gray-100 bg-white/20'}`}>
                                <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" className={`h-6 ${paymentMethod === 'VNPAY' ? 'grayscale-0' : 'grayscale'}`} alt="VNPAY" />
                                <span className="font-black uppercase text-xs tracking-widest">Thanh toán qua VNPAY</span>
                            </button>
                        </div>
                    </div>

                   
                    <div className="space-y-6">
                        <span className="font-black uppercase italic text-sm flex items-center gap-2"><FaRegStickyNote className="text-red-600" /> 03. Ghi chú</span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border-2 border-gray-100 p-6 outline-none focus:border-black italic text-sm transition-all"
                            rows={3}
                            placeholder="Ghi chú thêm về đơn hàng của bạn..."
                        />
                    </div>
                </div>

   
                <div className="lg:col-span-4 h-fit sticky top-24">
                    <div className="bg-black text-white p-10 shadow-2xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic mb-8 border-b border-gray-800 pb-4">Đơn hàng của bạn</h2>
                        <div className="flex justify-between items-baseline mb-12 border-t border-gray-800 pt-10">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-none">Tổng cộng</span>
                            <span className="text-4xl font-black italic text-red-600 leading-none tracking-tighter">
                                {new Intl.NumberFormat('vi-VN').format(totalAmount)}đ
                            </span>
                        </div>
                        <button
                            onClick={handleConfirmOrder}
                            disabled={isLoading}
                            className={`w-full py-6 font-black uppercase tracking-[0.3em] text-[12px] transition-all duration-500 shadow-2xl active:scale-95 flex items-center justify-center gap-3
                                ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : "Xác nhận thanh toán"}
                        </button>
                        <p className="text-[9px] text-gray-500 uppercase font-bold mt-6 text-center tracking-widest italic leading-relaxed">
                            Bằng cách đặt hàng, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
            <AddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAddresses} />
        </div>
    );
};

export default CheckoutPage;