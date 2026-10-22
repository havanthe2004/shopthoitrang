import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { adminOrderService } from '../services/adminOrderService';
import { playNotificationSound } from '../utils/soundUtils';
import {
    setPendingOrdersCount,
    incrementPendingOrders,
    decrementPendingOrders,
    incrementUnreadChat,
    resetUnreadChat
} from '../../redux/slices/adminNotificationSlice';

const SOCKET_URL = import.meta.env.VITE_API_KEY || import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentPathRef = useRef(location.pathname);
    useEffect(() => {
        currentPathRef.current = location.pathname;
    }, [location.pathname]);

    // Tự động xoá số tin nhắn chưa đọc khi quản trị viên vào trang /admin/chat
    useEffect(() => {
        if (location.pathname === '/admin/chat') {
            dispatch(resetUnreadChat());
        }
    }, [location.pathname, dispatch]);

    // Khởi tạo socket và lắng nghe sự kiện thời gian thực (đơn hàng mới, tin nhắn mới)
    useEffect(() => {
        // 1. Tải số lượng đơn hàng đang chờ duyệt ban đầu
        adminOrderService.getPendingCount()
            .then((res: any) => {
                if (res?.data?.count !== undefined) {
                    dispatch(setPendingOrdersCount(res.data.count));
                }
            })
            .catch((err: any) => console.error("Lỗi lấy số lượng đơn hàng chờ duyệt:", err));

        // 2. Kết nối Socket.IO
        const socket = io(SOCKET_URL);

        // Khi có đơn hàng mới (COD hoặc VNPAY thành công)
        socket.on('newOrder', (order: any) => {
            dispatch(incrementPendingOrders());
            playNotificationSound();

            // Phát sự kiện để cập nhật danh sách đơn hàng nếu đang ở trang OrderManagement
            window.dispatchEvent(new CustomEvent('admin_reload_orders', { detail: order }));

            const formattedPrice = Number(order.totalPrice || 0).toLocaleString('vi-VN');
            toast.info(
                <div 
                    className="cursor-pointer" 
                    onClick={() => navigate('/admin/orders')}
                >
                    <div className="font-bold text-red-600 flex items-center gap-1.5">
                        <span>🛍️ Có đơn hàng mới #{order.orderId}!</span>
                    </div>
                    <div className="text-xs text-gray-700 mt-1">
                        Khách hàng: <span className="font-semibold">{order.receiverName || 'Khách vãng lai'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Tổng tiền: <span className="font-bold text-gray-800">{formattedPrice} đ</span> ({order.paymentMethod || 'COD'})
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold mt-1">
                        👉 Bấm để vào mục Xử lý đơn hàng
                    </div>
                </div>,
                {
                    autoClose: 8000,
                    position: "top-right"
                }
            );
        });

        // Khi trạng thái đơn hàng thay đổi (duyệt, huỷ, ...)
        socket.on('orderStatusChanged', (data: any) => {
            const { status, oldStatus } = data || {};
            if (oldStatus === 'pending' && status !== 'pending') {
                dispatch(decrementPendingOrders());
            } else if (oldStatus !== 'pending' && status === 'pending') {
                dispatch(incrementPendingOrders());
            }

            // Đồng bộ lại danh sách đơn hàng
            window.dispatchEvent(new CustomEvent('admin_reload_orders', { detail: data }));
        });

        // Khi có tin nhắn mới từ khách hàng
        socket.on('newChatMessage', (chat: any) => {
            // Nếu người dùng đang không ở trong trang chat thì đếm unread và phát chuông/toast
            if (currentPathRef.current !== '/admin/chat') {
                dispatch(incrementUnreadChat());
                playNotificationSound();

                const isStaffRequest = chat.chatMode === 'staff';
                toast.info(
                    <div 
                        className="cursor-pointer"
                        onClick={() => navigate('/admin/chat')}
                    >
                        <div className={`font-bold flex items-center gap-1.5 ${isStaffRequest ? 'text-amber-600' : 'text-emerald-600'}`}>
                            <span>{isStaffRequest ? '🔥 [CẦN HỖ TRỢ] ' : '💬 '}Tin nhắn mới từ {chat.senderName || 'Khách hàng'}</span>
                        </div>
                        <div className="text-xs text-gray-700 mt-1 line-clamp-2">
                            "{chat.content}"
                        </div>
                        <div className="text-[11px] text-blue-600 font-semibold mt-1">
                            👉 Bấm để phản hồi khách ngay
                        </div>
                    </div>,
                    {
                        autoClose: 6000,
                        position: "top-right"
                    }
                );
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [dispatch, navigate]);

    return (
        <div className="flex min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-slate-100"
            style={{ backgroundImage: "url('/background/background.jpg')" }}
        >
            {/* Sidebar Cố định bên trái */}
            <Sidebar />

            {/* Phần nội dung chính bên phải */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header trên cùng */}
                <Header />

                {/* Nội dung thay đổi theo từng trang (Dashboard, Order, Product...) */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Bọc Outlet bằng thẻ div để tạo background trắng nếu cần */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;