import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux'; // Thêm để cập nhật Header
import { adminProfileService } from '../services/adminProfileService';
import { adminProfileSchema } from '../../schemas/adminProfile.schema';
import  { updateAdminInfo } from '../../redux/slices/adminAuthSlice'; 
import {
    Camera, User, Phone, Lock, Save, ShieldCheck,
    RefreshCcw, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;
    const dispatch = useDispatch(); // Khởi tạo dispatch

    // State quản lý thông tin hồ sơ
    const [profile, setProfile] = useState({
        username: '',
        phone: '',
        avatar: '',
        role: ''
    });

    // State quản lý mật khẩu
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State quản lý file và giao diện
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState<any>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Tải thông tin Admin khi vào trang
    const loadProfile = async () => {
        try {
            setFetching(true);
            const data = await adminProfileService.getAdminProfile();
            setProfile({
                username: data.username,
                phone: data.phone || '',
                avatar: data.avatar || '',
                role: data.role
            });
        } catch (error: any) {
            toast.error("Không thể tải thông tin hồ sơ");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // 2. Xử lý khi chọn file ảnh mới
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.warning("Kích thước ảnh không được vượt quá 2MB");
            }
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // 3. Xử lý Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // 1. Validate bằng Zod
        const validate = adminProfileSchema.safeParse({
            username: profile.username,
            phone: profile.phone,
            ...passwords
        });

        if (!validate.success) {
            const formattedErrors: any = {};
            
            // Sửa lỗi forEach: Truy cập an toàn vào issues
            if (validate.error && validate.error.issues) {
                validate.error.issues.forEach((issue) => {
                    const path = issue.path[0];
                    if (!formattedErrors[path]) {
                        formattedErrors[path] = issue.message;
                    }
                });
            }

            setErrors(formattedErrors);
            return toast.error("Vui lòng kiểm tra lại dữ liệu nhập vào");
        }

        setLoading(true);
        try {
            const response = await adminProfileService.updateAdminProfile({
                ...profile,
                ...passwords,
                avatarFile: selectedFile
            });


            if (response.admin) {
                dispatch(updateAdminInfo(response.admin));
            }
            
            toast.success("Cập nhật thành công!");
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setSelectedFile(null);
            setAvatarPreview(null);
            loadProfile(); // Load lại state local
            
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 gap-3">
                <RefreshCcw className="animate-spin" size={32} />
                <p className="font-bold uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
            </div>
        );
    }

    const roletext = profile.role === "admin" ? "QUẢN TRỊ VIÊN" : profile.role === "manager" ? "QUẢN LÝ" : "NHÂN VIÊN";

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans text-slate-700">
            <div className="max-w-5xl mx-auto">

                {/* Header UI */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Hồ sơ Quản trị</h1>
                            <p className="text-slate-400 text-sm font-medium italic">Thay đổi thông tin cá nhân và thiết lập bảo mật hệ thống.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Cột Trái: Avatar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-indigo-50 text-indigo-600 border-indigo-100">
                                    {profile.role}
                                </span>
                            </div>

                            <div className="relative w-36 h-36 mx-auto mb-6 group">
                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                                    <img
                                        src={avatarPreview || (profile.avatar ? `${BASE_URL}/${profile.avatar}` : "/avt_default/download.jpg")}
                                        className="w-full h-full object-cover"
                                        alt="Admin"
                                        onError={(e: any) => e.target.src = "/avt_default/download.jpg"}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-90"
                                >
                                    <Camera size={20} />
                                </button>
                                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">{profile.username}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Hệ thống quản trị viên</p>

                            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1">
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Chức vụ</p>
                                    <p className="text-xs font-bold text-slate-700 italic">{roletext}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Form */}
                    <div className="col-span-12 lg:col-span-8">
                        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200 space-y-10">
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="text-indigo-600" size={18} />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Thông tin định danh</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên quản trị</label>
                                        <input
                                            type="text"
                                            className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none font-bold transition-all ${errors.username ? 'border-red-500' : 'border-slate-100'}`}
                                            value={profile.username}
                                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                        />
                                        {errors.username && <p className="text-red-500 text-[10px] font-bold italic ml-2">{errors.username}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                className={`w-full pl-12 pr-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none font-bold transition-all ${errors.phone ? 'border-red-500' : 'border-slate-100'}`}
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-[10px] font-bold italic ml-2">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Mật khẩu */}
                            <div className="space-y-6 pt-10 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className="text-indigo-600" size={18} />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Thay đổi mật khẩu</h4>
                                </div>

                                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-3 items-start">
                                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                                        Xác nhận mật khẩu hiện tại trước khi thiết lập mật khẩu mới.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="password"
                                        placeholder="Mật khẩu hiện tại của bạn"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:bg-white transition-all shadow-inner"
                                        value={passwords.oldPassword}
                                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <input
                                                type="password"
                                                placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
                                                className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:bg-white transition-all shadow-inner ${errors.newPassword ? 'border-red-500' : 'border-slate-100'}`}
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            />
                                            {errors.newPassword && <p className="text-red-500 text-[10px] font-bold italic ml-2">{errors.newPassword}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="password"
                                                placeholder="Xác nhận mật khẩu mới"
                                                className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:bg-white transition-all shadow-inner ${errors.confirmPassword ? 'border-red-500' : 'border-slate-100'}`}
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            />
                                            {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold italic ml-2">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-slate-300 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:bg-slate-400 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCcw className="animate-spin" size={20} />
                                            Đang xử lý dữ liệu...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} /> Lưu tất cả thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;