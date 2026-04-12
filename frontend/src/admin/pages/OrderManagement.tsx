import React, { useEffect, useState } from 'react';
import { adminOrderService } from '../services/adminOrderService';
import {
    Search, Truck, RotateCcw,
    Eye, ChevronLeft, ChevronRight, PackageCheck, ShoppingBag,
    X, MapPin, User, FileText, BadgeInfo, Wallet, Check, CalendarClock
} from 'lucide-react';
import { toast } from 'react-toastify';

const OrderManagement = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ page: 1, limit: 10, status: "", search: "" });
    const [meta, setMeta] = useState({ totalPages: 1 });
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await adminOrderService.getAll(params);
            setOrders(res.data.items);
            setMeta(res.data.meta);
        } catch (err) { toast.error("Lỗi tải danh sách đơn hàng"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchOrders(), 400);
        return () => clearTimeout(timer);
    }, [params]);

    const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
        const statusMap: any = {
            approved: "XÁC THỰC",
            shipping: "GIAO HÀNG",
            completed: "HOÀN THÀNH",
            cancelled: "HỦY ĐƠN",
            returned: "TRẢ HÀNG"
        };

        let msg = `Chuyển đơn #${orderId} sang [${statusMap[nextStatus]}]?`;
        if (nextStatus === 'completed') msg += "\n(Hệ thống sẽ tự động gán trạng thái thanh toán: ĐÃ THU TIỀN)";
        if (!window.confirm(msg)) return;

        try {
            await adminOrderService.updateStatus(orderId, nextStatus);
            toast.success(`Đã cập nhật trạng thái đơn hàng`);
            setIsDetailOpen(false);
            fetchOrders();
        } catch (err: any) { toast.error(err.response?.data?.message || "Thao tác thất bại"); }
    };

    const handleUpdatePayment = async (orderId: number, nextPaymentStatus: string) => {
        const paymentMap: any = { paid: "ĐÃ THU TIỀN", refunded: "HOÀN TIỀN" };
        if (!window.confirm(`Xác nhận cập nhật thanh toán đơn #${orderId} thành [${paymentMap[nextPaymentStatus]}]?`)) return;

        try {
            await adminOrderService.updatePayment(orderId, nextPaymentStatus);
            toast.success(`Cập nhật tài chính thành công`);
            setIsDetailOpen(false);
            fetchOrders();
        } catch (err: any) { toast.error(err.response?.data?.message || "Thao tác thất bại"); }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams({ ...params, page });
    };

    const renderStatusBadge = (status: string) => {
        const styles: any = {
            pending: { label: "Chờ xác nhận", css: "bg-amber-50 text-amber-600 border-amber-200" },
            approved: { label: "Đã duyệt", css: "bg-blue-50 text-blue-600 border-blue-200" },
            shipping: { label: "Đang giao", css: "bg-indigo-50 text-indigo-600 border-indigo-200" },
            completed: { label: "Thành công", css: "bg-emerald-50 text-emerald-600 border-emerald-200" },
            cancelled: { label: "Đã hủy", css: "bg-rose-50 text-rose-600 border-rose-200" },
            returned: { label: "Trả hàng", css: "bg-slate-100 text-slate-600 border-slate-300" },
        };
        const config = styles[status] || { label: status, css: "" };
        return <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${config.css}`}>{config.label}</span>;
    };

    const renderPaymentBadge = (status: string) => {
        const styles: any = {
            pending: { label: "Chưa thu", css: "text-rose-500 bg-rose-50 border-rose-100" },
            paid: { label: "Đã thu", css: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            refunded: { label: "Đã hoàn", css: "text-blue-600 bg-blue-50 border-blue-100" },
            failed: { label: "Lỗi", css: "text-slate-400 bg-slate-50 border-slate-100" },
        };
        const config = styles[status] || { label: status, css: "" };
        return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${config.css}`}>{config.label}</span>;
    };

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen text-slate-700 font-sans">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2">
                        <ShoppingBag className="text-indigo-600" /> Vận hành đơn hàng
                    </h1>
                    <p className="text-slate-400 text-sm font-medium italic">Xử lý luồng đơn và đối soát tài chính chi tiết.</p>
                </div>
                <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-[10px] uppercase outline-none shadow-sm cursor-pointer"
                    onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Thành công</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="returned">Trả hàng</option>
                </select>
            </div>

            <div className="relative mb-8 max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Mã đơn, tên khách, SĐT..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold shadow-sm transition-all"
                    onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                />
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                        <tr>
                            <th className="pl-8 py-5 border-r border-slate-100">Mã đơn</th>
                            <th className="px-6 py-5 border-r border-slate-100 text-left">Thông tin nhận</th>
                            <th className="px-6 py-5 border-r border-slate-100">Tổng tiền</th>
                            <th className="px-6 py-5 border-r border-slate-100">Thanh toán</th>
                            <th className="px-6 py-5 border-r border-slate-100">Vận hành</th>
                            <th className="pr-8 py-5">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order: any) => (
                            <tr key={order.orderId} className="hover:bg-indigo-50/20 transition-colors text-center">
                                <td className="pl-8 py-6 border-r border-slate-100 font-black text-slate-900 text-sm">#ORD-{order.orderId}</td>
                                <td className="px-6 py-6 border-r border-slate-100 text-left">
                                    <p className="font-black text-slate-800 text-xs uppercase leading-tight">{order.receiverName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">{order.phone}</p>
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    <p className="font-black text-indigo-600 text-sm tracking-tighter italic">{Number(order.totalPrice).toLocaleString()}đ</p>
                                    <span className="text-[9px] font-black text-slate-300 uppercase">{order.paymentMethod}</span>
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    {renderPaymentBadge(order.paymentStatus)}
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    {renderStatusBadge(order.status)}
                                </td>
                                <td className="pr-8 py-6 text-right">
                                    <button onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm active:scale-90 transition-all">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-5 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang {params.page} / {meta.totalPages}</span>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-500 hover:bg-white rounded-xl disabled:opacity-20 border border-transparent shadow-sm" disabled={params.page === 1} onClick={() => handlePageChange(params.page - 1)}>
                        <ChevronLeft size={18} />
                    </button>
                    {[...Array(meta.totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page !== 1 && page !== meta.totalPages && Math.abs(page - params.page) > 1) return null;
                        return (
                            <button key={page} onClick={() => handlePageChange(page)} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${params.page === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600' : 'text-slate-500 hover:bg-white border border-slate-200'}`}>
                                {page}
                            </button>
                        );
                    })}
                    <button className="p-2 text-slate-500 hover:bg-white rounded-xl disabled:opacity-20 border border-transparent shadow-sm" disabled={params.page === meta.totalPages} onClick={() => handlePageChange(params.page + 1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* MODAL CHI TIẾT */}
            {isDetailOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in">

                        <div className="bg-slate-50 px-10 py-6 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex-1 text-left">
                                <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Hồ sơ vận đơn #ORD-{selectedOrder.orderId}</h2>
                                <div className="mt-1 flex items-center gap-2 text-indigo-600">
                                    <CalendarClock size={14} />
                                    <p className="text-[11px] font-black uppercase tracking-widest">Thời gian đặt: <span className="text-slate-500 italic ml-1">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span></p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 transition-all flex-shrink-0"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-3 flex-1 overflow-hidden">
                            <div className="col-span-1 bg-slate-50/50 p-8 border-r border-slate-200 space-y-6 overflow-y-auto">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Người nhận hàng</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm"><User size={24} /></div>
                                        <div>
                                            <p className="font-black text-slate-800 uppercase text-sm leading-tight">{selectedOrder.receiverName}</p>
                                            <p className="text-xs font-bold text-slate-400 italic mt-1">{selectedOrder.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Địa chỉ giao</label>
                                    <div className="flex gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                        <MapPin size={18} className="text-indigo-300 shrink-0" />
                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">{selectedOrder.address}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl shadow-inner">
                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 block flex items-center gap-1.5"><BadgeInfo size={12} /> Ghi chú của khách</label>
                                    <p className="text-[11px] font-bold text-slate-600 italic">{selectedOrder.note || "Không có ghi chú."}</p>
                                </div>

                                <div className="p-5 bg-slate-900 rounded-3xl text-white mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tiền thu hộ</label>
                                        {renderPaymentBadge(selectedOrder.paymentStatus)}
                                    </div>
                                    <p className="text-2xl font-black tracking-tighter italic">{Number(selectedOrder.totalPrice).toLocaleString()}đ</p>
                                    <p className="text-[9px] font-black text-slate-500 mt-2 uppercase tracking-widest opacity-60">Thanh toán: {selectedOrder.paymentMethod}</p>
                                </div>
                            </div>

                            <div className="col-span-2 p-8 overflow-y-auto bg-white">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2"><FileText size={14} /> Danh mục sản phẩm ({selectedOrder.items?.length})</label>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any) => {
                                        const displayImage = item.variant?.color?.images?.[0]?.url;

                                        return (
                                            <div key={item.orderItemId} className="flex items-center gap-5 p-4 rounded-3xl bg-[#F8FAFC] border border-slate-100">
                                                <div className="w-16 h-16 rounded-2xl border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                                                    <img
                                                        src={displayImage ? `${BASE_URL}/${displayImage}` : `/avt_default/download.jpg`}
                                                        className="w-full h-full object-cover"
                                                        alt="product"
                                                        onError={(e: any) => { e.target.src = "/avt_default/download.jpg" }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-800 text-[11px] uppercase tracking-tight">
                                                        {item.variant?.product?.name}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                                                        Màu: {item.variant?.color?.color} / SIZE: {item.variant?.size}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-[11px] font-black text-slate-900 italic tracking-tighter">
                                                        {Number(item.price).toLocaleString()}đ
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                                        x{item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER TÁCH BIỆT: TÀI CHÍNH & VẬN HÀNH */}
                        <div className="px-10 py-6 bg-[#0F172A] border-t border-slate-800 flex justify-between items-center">
                            {/* TÀI CHÍNH */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-xl text-slate-400"><Wallet size={16} /></div>
                                <div className="flex gap-2">
                                    {selectedOrder.paymentStatus === 'pending' && (
                                        <button onClick={() => handleUpdatePayment(selectedOrder.orderId, 'paid')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all flex items-center gap-1.5"><Check size={14} /> Xác nhận đã thu tiền</button>
                                    )}
                                    {/* 🔥 Ẩn nút nếu trạng thái đã là refunded (Đã hoàn) */}
                                    {(selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'returned') && selectedOrder.paymentStatus !== 'refunded' && (
                                        <button onClick={() => handleUpdatePayment(selectedOrder.orderId, 'refunded')} className="px-4 py-2 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5"><RotateCcw size={14} /> Hoàn tiền cho khách</button>
                                    )}
                                    {selectedOrder.paymentStatus === 'refunded' && (
                                        <span className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 border border-slate-700 italic">Đã hoàn tất tài chính</span>
                                    )}
                                </div>
                            </div>

                            {/* VẬN HÀNH */}
                            <div className="flex gap-2">
                                {selectedOrder.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'cancelled')} className="px-5 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all">Hủy đơn</button>
                                        <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'approved')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-all">Phê duyệt & Chờ lấy</button>
                                    </>
                                )}
                                {selectedOrder.status === 'approved' && (
                                    <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'shipping')} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-900/50 hover:bg-blue-500 transition-all flex items-center gap-2"><Truck size={14} /> Bắt đầu giao hàng</button>
                                )}
                                {selectedOrder.status === 'shipping' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'returned')} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase hover:bg-slate-700 transition-all">Khách trả hàng</button>
                                        <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'completed')} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition-all animate-pulse flex items-center gap-2"><PackageCheck size={14} /> Xác nhận thành công</button>
                                    </>
                                )}
                                {selectedOrder.status === 'completed' && (
                                    <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'returned')} className="px-5 py-2.5 bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-black text-[10px] uppercase hover:bg-rose-200 transition-all">Yêu cầu hoàn trả</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;