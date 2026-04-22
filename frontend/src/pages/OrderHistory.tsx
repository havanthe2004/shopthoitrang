import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/slices/orderSlice';
import { orderService } from '../services/orderService';
import type { RootState, AppDispatch } from '../redux/store';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageUrl';
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle, FaUndoAlt, FaClock } from 'react-icons/fa';

const statusTabs = [
    { key: 'all', label: 'Tất cả', icon: <FaBoxOpen /> },
    { key: 'pending', label: 'Chờ xác nhận', icon: <FaClock /> },
    { key: 'approved', label: 'Đã duyệt', icon: <FaCheckCircle /> },
    { key: 'shipping', label: 'Đang giao', icon: <FaShippingFast /> },
    { key: 'completed', label: 'Hoàn tất', icon: <FaCheckCircle /> },
    { key: 'cancelled', label: 'Đã hủy', icon: <FaTimesCircle /> },
    { key: 'returned', label: 'Trả hàng', icon: <FaUndoAlt /> },
];

const translateStatus = (status: string) => {
    switch (status) {
        case 'pending': return 'Chờ xác nhận';
        case 'approved': return 'Đã xác nhận';
        case 'shipping': return 'Đang giao hàng';
        case 'completed': return 'Hoàn tất';
        case 'cancelled': return 'Đã hủy';
        case 'returned': return 'Hoàn hàng';
        default: return status;
    }
};

// Helper để hiển thị nhãn trạng thái đẹp hơn
const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        pending: 'bg-orange-100 text-orange-600',
        approved: 'bg-blue-100 text-blue-600',
        shipping: 'bg-indigo-100 text-indigo-600',
        completed: 'bg-green-100 text-green-600',
        cancelled: 'bg-red-100 text-red-600',
        returned: 'bg-gray-100 text-gray-600',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
};

const OrderHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, totalPages } = useSelector((state: RootState) => state.orders);
    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchOrders({ status: activeTab, page }));
    }, [activeTab, page, dispatch]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setPage(1);
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        try {
            await orderService.cancelOrder(id);
            toast.success("Hủy đơn hàng thành công");
            dispatch(fetchOrders({ status: activeTab, page }));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Hủy đơn thất bại");
        }
    };

    const handleReturn = async (id: number) => {
        if (!window.confirm("Bạn muốn gửi yêu cầu trả hàng?")) return;
        try {
            await orderService.returnOrder(id);
            toast.success("Yêu cầu trả hàng đã được gửi");
            dispatch(fetchOrders({ status: activeTab, page }));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Gửi yêu cầu thất bại");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50" style={{ fontFamily: 'Times New Roman, serif' }}>
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
                <FaBoxOpen className="text-red-600" /> Đơn hàng của tôi
            </h1>

    
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar bg-white rounded-t-xl sticky top-20 z-10 shadow-sm">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.key
                            ? 'border-red-600 text-red-600 bg-red-50/50'
                            : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
                            }`}
                    >
                        <span className={activeTab === tab.key ? 'text-red-600' : 'text-gray-400'}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                    <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu...</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {orders?.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <FaBoxOpen className="mx-auto text-6xl text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">Không có dữ liệu đơn hàng</p>
                            </div>
                        ) : (
                            orders.map((order: any) => (
                                <div key={order.orderId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-gray-800 tracking-tighter uppercase">Mã đơn hàng : SP - {order.orderId}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">Thời gian đặt: {new Date(order.createdAt).toLocaleString()}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadge(order.status)}`}>
                                            {translateStatus(order.status)}
                                        </span>
                                    </div>

                            
                                    <div className="p-6 space-y-4">
                                        {order.items?.map((item: any) => (
                                            <div key={item.orderItemId} className="flex gap-6 items-center group">
                                                <div className="relative overflow-hidden rounded-lg">
                                                    <img
                                                        src={getImageUrl(item.variant?.color?.images?.[0]?.url)}
                                                        className="w-20 h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                                                        alt={item.variant?.product?.name}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black uppercase text-sm group-hover:text-red-600 transition-colors">{item.variant?.product?.name}</h4>
                                                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                                                        Phân loại: {item.variant?.color?.name} / {item.variant?.size?.name}
                                                    </p>
                                                    <p className="text-xs font-bold mt-2">Số lượng: x{item.quantity}</p>
                                                </div>
                                                <div className="font-black text-gray-800 italic">{Number(item.price).toLocaleString()}đ</div>
                                            </div>
                                        ))}
                                    </div>

                                 
                                    <div className="px-6 py-4 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
                                        <div className="text-sm">
                                            <span className="text-gray-400 uppercase font-bold text-[10px] tracking-widest mr-2">Tổng số tiền:</span>
                                            <span className="text-xl font-black text-red-600 italic leading-none">{Number(order.totalPrice).toLocaleString()}đ</span>
                                        </div>

                                        <div className="flex gap-3">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancel(order.orderId)}
                                                    className="px-8 py-2.5 bg-white border-2 border-black text-black text-xs font-black uppercase hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            )}
                                            {order.status === 'completed' && (
                                                <button
                                                    onClick={() => handleReturn(order.orderId)}
                                                    className="px-8 py-2.5 bg-orange-600 text-white text-xs font-black uppercase hover:bg-orange-700 transition-all transform hover:-translate-y-1 active:scale-95 shadow-[4px_4px_0px_0px_rgba(154,52,18,1)] hover:shadow-none"
                                                >
                                                    Yêu cầu trả hàng
                                                </button>
                                            )}
                                            {/* <button className="px-8 py-2.5 bg-gray-100 text-gray-600 text-xs font-black uppercase hover:bg-gray-200 transition-all rounded-sm">
                                                Xem chi tiết
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-12 pb-12">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all shadow-sm"
                            >
                                <FaChevronLeft size={10} className="rotate-0" />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-full font-black text-xs transition-all ${page === i + 1
                                        ? 'bg-black text-white scale-110 shadow-lg'
                                        : 'bg-white text-gray-500 hover:border-black border border-transparent'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:border-black hover:text-black disabled:opacity-30 transition-all shadow-sm"
                            >
                                <FaChevronLeft size={10} className="rotate-180" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const FaChevronLeft = ({ size, className }: { size: number, className: string }) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height={size} width={size} className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
    </svg>
);

export default OrderHistory;