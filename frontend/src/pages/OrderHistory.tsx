// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchOrders } from '../redux/slices/orderSlice';
// import { orderService } from '../services/orderService';
// import type { RootState, AppDispatch } from '../redux/store'; // Import AppDispatch từ store
// import { toast } from 'react-toastify';
// import { getImageUrl } from '../utils/imageUrl';

// const statusTabs = [
//     { key: 'all', label: 'Tất cả' },
//     { key: 'pending', label: 'Chờ xác nhận' },
//     { key: 'approved', label: 'Đã duyệt' },
//     { key: 'shipping', label: 'Đang giao' },
//     { key: 'completed', label: 'Hoàn tất' },
//     { key: 'cancelled', label: 'Đã hủy' },
//     { key: 'returned', label: 'Trả hàng' },
// ];

// const OrderHistory = () => {
//     // 🔥 Khai báo dispatch với kiểu AppDispatch để tránh lỗi TypeScript
//     const dispatch = useDispatch<AppDispatch>();
    
//     // Lấy state 'orders' từ RootState (khớp với tên đặt trong store.ts)
//     const { orders, loading } = useSelector((state: RootState) => state.orders);
//     const [activeTab, setActiveTab] = useState('all');

//     useEffect(() => {
//         dispatch(fetchOrders(activeTab));
//     }, [activeTab, dispatch]);

//     const handleCancel = async (id: number) => {
//         if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
//         try {
//             await orderService.cancelOrder(id);
//             toast.success("Hủy đơn hàng thành công");
//             dispatch(fetchOrders(activeTab)); 
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || "Hủy đơn thất bại");
//         }
//     };

//     const handleReturn = async (id: number) => {
//         if (!window.confirm("Bạn muốn gửi yêu cầu trả hàng?")) return;
//         try {
//             await orderService.returnOrder(id);
//             toast.success("Yêu cầu trả hàng đã được gửi");
//             dispatch(fetchOrders(activeTab));
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || "Gửi yêu cầu thất bại");
//         }
//     };

//     return (
//         <div className="max-w-5xl mx-auto p-4 min-h-screen" style={{ fontFamily: 'Times New Roman, serif' }}>
//             <h1 className="text-2xl font-black mb-6 uppercase tracking-tight">Đơn hàng của tôi</h1>

//             {/* Tab điều hướng */}
//             <div className="flex border-b mb-6 overflow-x-auto no-scrollbar shadow-sm rounded-t-lg bg-white sticky top-0 z-10">
//                 {statusTabs.map((tab) => (
//                     <button
//                         key={tab.key}
//                         onClick={() => setActiveTab(tab.key)}
//                         className={`px-6 py-4 whitespace-nowrap text-sm font-bold transition-all border-b-2 ${
//                             activeTab === tab.key 
//                             ? 'border-red-600 text-red-600 bg-red-50' 
//                             : 'border-transparent text-gray-500 hover:text-black'
//                         }`}
//                     >
//                         {tab.label}
//                     </button>
//                 ))}
//             </div>

//             {loading ? (
//                 <div className="text-center py-20 italic text-gray-400">Đang tải dữ liệu...</div>
//             ) : (
//                 <div className="space-y-6">
//                     {orders && orders.length === 0 ? (
//                         <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400 italic">
//                             Bạn chưa có đơn hàng nào ở mục này.
//                         </div>
//                     ) : (
//                         orders?.map((order: any) => (
//                             <div key={order.orderId} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
//                                 <div className="flex justify-between items-center border-b pb-3 mb-4">
//                                     <span className="text-xs font-bold text-gray-400">MÃ ĐƠN: #{order.orderId}</span>
//                                     <span className="text-red-600 uppercase font-black text-xs italic bg-red-50 px-2 py-1 rounded">
//                                         {statusTabs.find(t => t.key === order.status)?.label}
//                                     </span>
//                                 </div>

//                                 {/* Items */}
//                                 <div className="space-y-4">
//                                     {order.items?.map((item: any) => (
//                                         <div key={item.orderItemId} className="flex gap-4 pb-4 border-b border-gray-50 last:border-none">
//                                             <img 
//                                                 src={getImageUrl(item.variant?.color?.images?.[0]?.url)} 
//                                                 className="w-20 h-20 object-cover rounded-lg border shadow-sm" 
//                                                 alt=""
//                                                 onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
//                                             />
//                                             <div className="flex-1">
//                                                 <h4 className="font-bold text-gray-800">{item.variant?.product?.name}</h4>
//                                                 <p className="text-[11px] text-gray-400 italic mt-1">
//                                                     Màu: {item.variant?.color?.color}, Size: {item.variant?.size}
//                                                 </p>
//                                                 <p className="text-sm font-bold mt-2">x{item.quantity}</p>
//                                             </div>
//                                             <div className="text-right font-bold text-red-600">
//                                                 {Number(item.price).toLocaleString()}đ
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Footer */}
//                                 <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
//                                     <div className="text-xs text-gray-400 italic">
//                                         Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
//                                     </div>
//                                     <div className="flex flex-col items-end w-full sm:w-auto">
//                                         <div className="text-sm">
//                                             Tổng thanh toán: 
//                                             <span className="text-xl font-black text-red-600 ml-2">
//                                                 {Number(order.totalPrice).toLocaleString()}đ
//                                             </span>
//                                         </div>
//                                         <div className="mt-4 flex gap-3">
//                                             {order.status === 'pending' && (
//                                                 <button onClick={() => handleCancel(order.orderId)} className="bg-gray-800 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-black">Hủy đơn</button>
//                                             )}
//                                             {order.status === 'completed' && (
//                                                 <button onClick={() => handleReturn(order.orderId)} className="border-2 border-red-600 text-red-600 px-5 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-50">Trả hàng</button>
//                                             )}
//                                             <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-700">Chi tiết</button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default OrderHistory;

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

    // 🔥 RESET PAGE KHI ĐỔI TAB
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

                    {/* 🔥 PAGINATION */}
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