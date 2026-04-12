import React, { useEffect, useState } from 'react';
import { adminUserService } from '../services/adminUserService';
import { 
    Search, User, UserX, UserCheck, Eye, ChevronLeft, 
    ChevronRight, X, MapPin, Mail, Phone, Calendar, Hash, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY ;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ page: 1, limit: 10, status: "", search: "" });
    const [meta, setMeta] = useState({ totalPages: 1 });
    
    // Modal chi tiết
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminUserService.getAll(params);
            setUsers(res.data.items);
            setMeta(res.data.meta);
        } catch (err) {
            toast.error("Lỗi tải danh sách người dùng");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 400);
        return () => clearTimeout(timer);
    }, [params]);

    // 🔥 Xử lý Xóa mềm / Kích hoạt lại
    const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        const msg = nextStatus 
            ? "Bạn có chắc chắn muốn KÍCH HOẠT lại tài khoản này?" 
            : "Bạn có chắc chắn muốn VÔ HIỆU HÓA (Khóa) tài khoản này?";
        
        if (!window.confirm(msg)) return;

        try {
            await adminUserService.toggleStatus(userId, nextStatus);
            toast.success(nextStatus ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản");
            setIsDetailOpen(false);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Thao tác thất bại");
        }
    };

    const handleOpenDetail = async (userId: number) => {
        try {
            const res = await adminUserService.getDetail(userId);
            setSelectedUser(res.data);
            setIsDetailOpen(true);
        } catch (err) {
            toast.error("Không thể lấy thông tin chi tiết");
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams({ ...params, page });
    };

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen text-slate-700 font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2">
                        <User className="text-indigo-600" /> Quản lý người dùng
                    </h1>
                    <p className="text-slate-400 text-sm font-medium italic">Danh sách khách hàng và quản lý quyền truy cập hệ thống.</p>
                </div>
                <select 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-[10px] uppercase outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
                    onChange={(e) => setParams({...params, status: e.target.value, page: 1})}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="blocked">Đã bị khóa</option>
                </select>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Tìm theo tên, email hoặc số điện thoại..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold shadow-sm transition-all"
                    onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                />
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                        <tr>
                            <th className="pl-8 py-5 border-r border-slate-100">ID</th>
                            <th className="px-6 py-5 border-r border-slate-100 text-left">Người dùng</th>
                            <th className="px-6 py-5 border-r border-slate-100">Liên hệ</th>
                            <th className="px-6 py-5 border-r border-slate-100">Ngày tham gia</th>
                            <th className="px-6 py-5 border-r border-slate-100">Trạng thái</th>
                            <th className="pr-8 py-5 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user: any) => (
                            <tr key={user.userId} className="hover:bg-indigo-50/20 transition-colors text-center font-medium">
                                <td className="pl-8 py-6 border-r border-slate-100 font-black text-slate-400 text-xs">#{user.userId}</td>
                                <td className="px-6 py-6 border-r border-slate-100 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 overflow-hidden">
                                            <img src={user.avatar ? `${BASE_URL}/${user.avatar}` : "/avt_default/download.jpg"} className="w-full h-full object-cover" alt="avatar" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-xs uppercase leading-tight">{user.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    <p className="text-xs font-bold text-slate-600">{user.phone || "Chưa cập nhật"}</p>
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 italic">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-500 border-rose-200'}`}>
                                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                                    </span>
                                </td>
                                <td className="pr-8 py-6 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <button 
                                            onClick={() => handleToggleStatus(user.userId, user.isActive)} 
                                            className={`p-2 rounded-xl transition-all active:scale-90 shadow-sm border ${user.isActive ? 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white'}`}
                                            title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                        >
                                            {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        </button>
                                        <button onClick={() => handleOpenDetail(user.userId)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination lồng số trang (Giống Stock/Order) */}
            <div className="p-5 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang {params.page} / {meta.totalPages}</span>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-500 hover:bg-white rounded-xl disabled:opacity-20 transition-all shadow-sm border border-transparent" disabled={params.page === 1} onClick={() => handlePageChange(params.page - 1)}>
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
                    <button className="p-2 text-slate-500 hover:bg-white rounded-xl disabled:opacity-20 transition-all shadow-sm border border-transparent" disabled={params.page === meta.totalPages} onClick={() => handlePageChange(params.page + 1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* MODAL CHI TIẾT NGƯỜI DÙNG */}
            {isDetailOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in">
                        
                        <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl overflow-hidden">
                                    <img src={selectedUser.avatar ? `${BASE_URL}/${selectedUser.avatar}` : "/avt_default/download.jpg"} className="w-full h-full object-cover" alt="avatar" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{selectedUser.name}</h2>
                                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-1.5"><Calendar size={12}/> Thành viên từ: {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-2 flex-1 overflow-hidden">
                            {/* Thông tin cơ bản */}
                            <div className="p-10 border-r border-slate-100 space-y-6 overflow-y-auto bg-slate-50/30">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dữ liệu tài khoản</label>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <Mail className="text-indigo-300" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Email</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <Phone className="text-indigo-300" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Số điện thoại</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedUser.phone || "Chưa cung cấp"}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Trạng thái</p>
                                                <p className={`text-sm font-black uppercase ${selectedUser.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {selectedUser.isActive ? "Đang hoạt động" : "Đang bị khóa"}
                                                </p>
                                            </div>
                                            <ShieldAlert size={24} className={selectedUser.isActive ? 'text-emerald-100' : 'text-rose-100'} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sổ địa chỉ */}
                            <div className="p-10 overflow-y-auto bg-white">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Sổ địa chỉ ({selectedUser.addresses?.length})</label>
                                <div className="space-y-4">
                                    {selectedUser.addresses?.length > 0 ? selectedUser.addresses.map((addr: any) => (
                                        <div key={addr.addressId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                                            {addr.isDefault && (
                                                <span className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Mặc định</span>
                                            )}
                                            <div className="flex gap-3">
                                                <MapPin size={16} className="text-indigo-300 mt-1" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase">{addr.receiverName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mb-2">{addr.phone}</p>
                                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                                        {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10">
                                            <MapPin size={32} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-xs font-bold text-slate-400 italic">Chưa có địa chỉ nào được lưu.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="px-10 py-6 bg-[#0F172A] border-t border-slate-800 flex justify-end gap-3 items-center">
                            <p className="mr-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">Mã khách hàng: #USR-{selectedUser.userId}</p>
                            <button 
                                onClick={() => handleToggleStatus(selectedUser.userId, selectedUser.isActive)}
                                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg ${selectedUser.isActive ? 'bg-rose-600 text-white shadow-rose-900/40 hover:bg-rose-500' : 'bg-emerald-600 text-white shadow-emerald-900/40 hover:bg-emerald-500'}`}
                            >
                                {selectedUser.isActive ? "Khóa tài khoản khách" : "Kích hoạt lại tài khoản"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;