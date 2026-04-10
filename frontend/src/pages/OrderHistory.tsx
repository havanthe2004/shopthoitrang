import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/slices/orderSlice';
import { orderService } from '../services/orderService';
import type { RootState, AppDispatch } from '../redux/store';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageUrl';

const statusTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn tất' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'returned', label: 'Trả hàng' },
];

const OrderHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, totalPages } = useSelector((state: RootState) => state.orders);

    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);

    // 🔥 FETCH API
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
        <div className="max-w-5xl mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-black mb-6 uppercase">Đơn hàng của tôi</h1>

            {/* Tabs */}
            <div className="flex border-b mb-6 overflow-x-auto">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`px-6 py-4 text-sm font-bold border-b-2 ${
                            activeTab === tab.key 
                            ? 'border-red-600 text-red-600' 
                            : 'text-gray-500'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải...</div>
            ) : (
                <>
                    <div className="space-y-6">
                        {orders?.length === 0 ? (
                            <div className="text-center py-20">Không có đơn hàng</div>
                        ) : (
                            orders.map((order: any) => (
                                <div key={order.orderId} className="bg-white p-5 rounded-xl shadow">
                                    <div className="flex justify-between mb-4">
                                        <span>#{order.orderId}</span>
                                        <span className="text-red-600">{order.status}</span>
                                    </div>

                                    {order.items?.map((item: any) => (
                                        <div key={item.orderItemId} className="flex gap-4 mb-3">
                                            <img
                                                src={getImageUrl(item.variant?.color?.images?.[0]?.url)}
                                                className="w-20 h-20 object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4>{item.variant?.product?.name}</h4>
                                                <p>x{item.quantity}</p>
                                            </div>
                                            <div>{Number(item.price).toLocaleString()}đ</div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between mt-4">
                                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        <div>{Number(order.totalPrice).toLocaleString()}đ</div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        {order.status === 'pending' && (
                                            <button onClick={() => handleCancel(order.orderId)}>Hủy</button>
                                        )}
                                        {order.status === 'completed' && (
                                            <button onClick={() => handleReturn(order.orderId)}>Trả</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

           
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-gray-200 rounded"
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-1 rounded ${
                                    page === i + 1 ? 'bg-red-600 text-white' : 'bg-gray-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-gray-200 rounded"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrderHistory;