import React, { useEffect, useState } from 'react';
import { adminManagementService } from '../services/adminManagementService';
import { useSelector } from 'react-redux';
import {
    Search, UserPlus, Phone, Power, RotateCcw, Edit, X, Save, User as UserIcon, Camera
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';
import { createAdminSchema, updateAdminSchema } from '../../schemas/addadminSchema';

const AdminManagement = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;
    const { currentAdmin } = useSelector((state: RootState) => state.adminAuth);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ page: 1, limit: 10, search: "", role: "", status: "active" });
    const [meta, setMeta] = useState({ totalPages: 1 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<any>(null);
    const [formData, setFormData] = useState({
        username: '', password: '', confirmPassword: '', phone: '', role: 'staff'
    });

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await adminManagementService.getAll(params);
            setAdmins(res.data.items);
            setMeta(res.data.meta);
        } catch (err) {
            toast.error("Lỗi tải danh sách");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchAdmins(), 400);
        return () => clearTimeout(timer);
    }, [params]);

    const openEditModal = (admin: any) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            password: '',
            confirmPassword: '',
            phone: admin.phone || '',
            role: admin.role
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const [errors, setErrors] = useState<any>({});


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const parsed = editingAdmin
                ? updateAdminSchema.parse(formData)
                : createAdminSchema.parse(formData);

            setErrors({});

            if (editingAdmin) {
                const updateData: any = {
                    role: parsed.role,
                    phone: parsed.phone
                };


                if (parsed.password) {
                    updateData.password = parsed.password;
                }

                await adminManagementService.update(editingAdmin.adminId, updateData);
                toast.success("Cập nhật thành công");
            } else {
                await adminManagementService.create(parsed);
                toast.success("Thêm nhân viên thành công");
            }

            setIsModalOpen(false);
            fetchAdmins();

        } catch (err: any) {
            if (err.issues) {
                const fieldErrors: any = {};
                err.issues.forEach((e: any) => {
                    fieldErrors[e.path[0]] = e.message;
                });
                setErrors(fieldErrors);
            } else {
                toast.error(err.response?.data?.message || "Lỗi hệ thống");
            }
        }
    };

    const handleToggle = async (id: number, role: string) => {
        if (id === currentAdmin?.adminId) return toast.warning("Không thể tự khóa chính mình");
        if (role === 'admin' && currentAdmin?.role !== 'admin') return toast.warning("Bạn không đủ quyền hạn");

        try {
            await adminManagementService.toggleStatus(id);
            toast.success("Đã cập nhật trạng thái");
            fetchAdmins();
        } catch (err: any) {
            toast.error("Lỗi khi thay đổi trạng thái");
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams({ ...params, page });
    };

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen text-slate-700">
            {/* Header và Bộ lọc giữ nguyên như code của bạn */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase italic">Quản lý nhân sự</h1>
                    <p className="text-slate-500 text-sm font-medium">Cấu hình quyền hạn và thông tin tài khoản nội bộ.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAdmin(null);
                        setFormData({ username: '', password: '', confirmPassword: '', phone: '', role: 'staff' });
                        setErrors({});
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <UserPlus size={18} /> Thêm nhân sự
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, sđt..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                    />
                </div>
                <select
                    className="bg-slate-50 border-none rounded-xl px-4 py-3 outline-none font-bold text-slate-600"
                    onChange={(e) => setParams({ ...params, role: e.target.value, page: 1 })}
                >
                    <option value="">Tất cả quyền</option>
                    <option value="staff">Nhân viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    className="bg-slate-50 border-none rounded-xl px-4 py-3 outline-none font-bold text-slate-600"
                    onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                >
                    <option value="active">Đang hoạt động</option>
                    <option value="hidden">Đã bị khóa</option>
                </select>
            </div>

            {/* Danh sách */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nhân viên</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vai trò</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {admins.map((admin: any) => (
                            <tr key={admin.adminId} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 shrink-0">

                                            <img src={admin.avatar ? `${BASE_URL}/${admin.avatar}` : `/avt_default/download.jpg`} className="w-full h-full rounded-2xl object-cover border-2 border-white shadow-sm" />

                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 leading-none mb-1">
                                                {admin.username} {admin.adminId === currentAdmin?.adminId && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1 rounded ml-1 font-black uppercase">Bạn</span>}
                                            </p>
                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded inline-block">ID: #{admin.adminId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${admin.role === 'admin' ? 'bg-red-50 text-red-600' :
                                        admin.role === 'manager' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-sm text-slate-600">
                                    <div className="flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {admin.phone || "---"}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-2 ${admin.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-[11px] font-bold uppercase tracking-tight">{admin.isActive ? "Hoạt động" : "Bị khóa"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(admin)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                        ><Edit size={16} /></button>
                                        <button
                                            onClick={() => handleToggle(admin.adminId, admin.role)}
                                            disabled={admin.adminId === currentAdmin?.adminId || admin.role === 'admin'}
                                            className={`p-2 rounded-lg transition-all ${admin.isActive ? 'text-rose-300 hover:bg-rose-50 hover:text-rose-600' : 'text-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'} disabled:opacity-10`}
                                        >
                                            {admin.isActive ? <Power size={16} /> : <RotateCcw size={16} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-white">

                    {/* Thông tin */}
                    <div className="text-sm text-slate-500 font-medium">
                        Trang <span className="font-bold text-slate-700">{params.page}</span> / {meta.totalPages}
                    </div>

                    {/* Nút phân trang */}
                    <div className="flex items-center gap-2">

                        {/* Prev */}
                        <button
                            onClick={() => handlePageChange(params.page - 1)}
                            disabled={params.page === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                        >
                            ←
                        </button>

                        {/* Page numbers */}
                        {[...Array(meta.totalPages)].map((_, i) => {
                            const page = i + 1;

                            // limit hiển thị (max 5 page)
                            if (
                                page !== 1 &&
                                page !== meta.totalPages &&
                                Math.abs(page - params.page) > 1
                            ) return null;

                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${params.page === page
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* Next */}
                        <button
                            onClick={() => handlePageChange(params.page + 1)}
                            disabled={params.page === meta.totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                        >
                            →
                        </button>

                    </div>
                </div>
            </div>

            {/* Modal Sửa/Thêm */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <form onSubmit={handleSubmit} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">
                                {editingAdmin ? 'Sửa thông tin tài khoản' : 'Thêm nhân sự mới'}
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-rose-500 transition-colors" /></button>
                        </div>

                        <div className="p-8 space-y-5">
                            {/* KHU VỰC HIỂN THỊ AVATAR TRONG MODAL */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300 border-4 border-white shadow-lg overflow-hidden">
                                        <img src={editingAdmin?.avatar ? `${BASE_URL}/${editingAdmin.avatar}` : `/avt_default/download.jpg`} className="w-full h-full object-cover" alt="preview" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-xl text-white shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
                                        <Camera size={14} />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-800 uppercase text-sm tracking-tight">{formData.username || "Admin"}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò: {formData.role}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên đăng nhập</label>
                                    <input
                                        disabled={!!editingAdmin}
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border-none font-bold disabled:opacity-60 focus:ring-2 focus:ring-indigo-500"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                    {errors.username && (
                                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                            {editingAdmin ? 'Mật khẩu mới' : 'Mật khẩu'}
                                        </label>
                                        <input
                                            type="password"
                                            placeholder={editingAdmin ? "Bỏ trống nếu không đổi" : "••••••••"}
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border-none font-bold focus:ring-2 focus:ring-indigo-500"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        {errors.password && (
                                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Xác nhận</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border-none font-bold focus:ring-2 focus:ring-indigo-500"
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border-none font-bold focus:ring-2 focus:ring-indigo-500"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-2 block">Phân quyền vai trò</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['staff', 'manager', 'admin'].map(r => (
                                            <button
                                                key={r}
                                                type="button"
                                                disabled={editingAdmin?.adminId === currentAdmin?.adminId && r !== editingAdmin.role} // Chặn tự đổi role của chính mình
                                                onClick={() => setFormData({ ...formData, role: r })}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${formData.role === r
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                                                    } disabled:opacity-30`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Hủy</button>
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                                <Save size={18} /> {editingAdmin ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;