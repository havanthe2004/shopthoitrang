import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Phone,
    Mail,
    Camera,
    CheckCircle2,
    Calendar,
    Save,
    Edit3,
    X,
    Loader2,
    Shield,
    ImagePlus
} from 'lucide-react';
import { getProfileAPI, updateProfileAPI } from '../../services/userService';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/imageUrl';

const profileSchema = z.object({
    name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    phone: z.string()
        .min(1, "Số điện thoại không được để trống")
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"),
});

type ProfileInput = z.infer<typeof profileSchema>;

interface AccountInfoProps {
    onUserUpdated?: (user: any) => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ onUserUpdated }) => {
    const dispatch = useDispatch();
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema)
    });

    const fetchUser = async () => {
        try {
            setIsLoading(true);
            const res = await getProfileAPI();
            const data = res.data || res;
            setUser(data);
            reset({
                name: data.name || '',
                phone: data.phone || ''
            });

            if (onUserUpdated) {
                onUserUpdated(data);
            }

            const token = localStorage.getItem('token') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            if (token) {
                dispatch(loginSuccess({
                    user: data,
                    token,
                    refreshToken
                }));
            }
        } catch (err: any) {
            toast.error("Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning("Kích thước ảnh không được vượt quá 2MB");
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.warning("Vui lòng chọn định dạng hình ảnh hợp lệ");
                return;
            }
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            toast.info("Đã chọn ảnh mới. Nhấn 'Lưu thay đổi' để cập nhật.");
        }
    };

    const handleCancelAvatar = () => {
        setSelectedFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        handleCancelAvatar();
        if (user) {
            reset({
                name: user.name || '',
                phone: user.phone || ''
            });
        }
    };

    const onSubmit = async (data: ProfileInput) => {
        const formData = new FormData();
        formData.append('name', data.name.trim());
        formData.append('phone', data.phone.trim());
        if (selectedFile) {
            formData.append('avatar', selectedFile);
        }

        try {
            const res = await updateProfileAPI(formData);
            const responseData = res.data || res;
            const updatedUser = responseData.user || responseData;

            toast.success("Cập nhật thông tin cá nhân thành công!");
            setIsEditing(false);
            setSelectedFile(null);
            setAvatarPreview(null);

            setUser(updatedUser);
            if (onUserUpdated) {
                onUserUpdated(updatedUser);
            }

            const token = localStorage.getItem('token') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            if (token) {
                dispatch(loginSuccess({
                    user: updatedUser,
                    token,
                    refreshToken
                }));
            }

            fetchUser();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi cập nhật hồ sơ cá nhân";
            toast.error(msg);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
                <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Đang tải thông tin cá nhân...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-4">Không tìm thấy thông tin tài khoản.</p>
                <button
                    onClick={fetchUser}
                    className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition"
                >
                    Tải lại dữ liệu
                </button>
            </div>
        );
    }

    const avatarSrc = avatarPreview || (user.avatar ? getImageUrl(user.avatar) : "/avt_default/download.jpg");
    const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : 'Thành viên mới';

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Thông tin cá nhân
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Quản lý hồ sơ định danh, ảnh đại diện và thông tin liên hệ của bạn
                    </p>
                </div>

                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Chỉnh sửa hồ sơ</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all active:scale-95 shrink-0"
                    >
                        <X className="w-4 h-4" />
                        <span>Hủy bỏ</span>
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Avatar Banner Card */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-gray-50 via-red-50/20 to-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group shrink-0">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 ring-2 ring-gray-200/80">
                            <img
                                src={avatarSrc}
                                alt={user.name || "Avatar"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e: any) => {
                                    e.currentTarget.src = "/avt_default/download.jpg";
                                }}
                            />
                        </div>

                        {/* Camera Overlay Trigger */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-2.5 bg-neutral-900 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 active:scale-95 transition-all border-2 border-white cursor-pointer"
                            title="Thay đổi ảnh đại diện"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <h3 className="text-lg md:text-xl font-black text-gray-900">{user.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Đang hoạt động
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 font-medium">
                            {user.email}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Tham gia: <strong className="text-gray-700 font-semibold">{joinedDate}</strong>
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-amber-500" />
                                Thành viên mua sắm
                            </span>
                        </div>

                        {selectedFile && (
                            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                    <ImagePlus className="w-3.5 h-3.5" />
                                    Ảnh mới: {selectedFile.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCancelAvatar}
                                    className="text-xs text-gray-500 hover:text-black underline font-semibold"
                                >
                                    Khôi phục ảnh cũ
                                </button>
                            </div>
                        )}
                        <p className="text-[11px] text-gray-400 pt-1">
                            Hỗ trợ định dạng JPG, PNG, WEBP. Dung lượng tối đa 2MB.
                        </p>
                    </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Họ và tên */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <User className="w-4 h-4 text-red-600" />
                            <span>Họ và tên <span className="text-red-500">*</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register("name")}
                                disabled={!isEditing}
                                placeholder="Nhập họ và tên của bạn"
                                className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all outline-none border ${isEditing
                                        ? errors.name
                                            ? 'border-red-500 bg-white ring-2 ring-red-100'
                                            : 'border-gray-300 bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                        : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                                    }`}
                            />
                        </div>
                        {errors.name && (
                            <p className="text-red-600 text-xs font-medium pl-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <Phone className="w-4 h-4 text-red-600" />
                            <span>Số điện thoại <span className="text-red-500">*</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register("phone")}
                                disabled={!isEditing}
                                placeholder="0912345678"
                                className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all outline-none border ${isEditing
                                        ? errors.phone
                                            ? 'border-red-500 bg-white ring-2 ring-red-100'
                                            : 'border-gray-300 bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                        : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
                                    }`}
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-red-600 text-xs font-medium pl-1">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>Địa chỉ Email</span>
                            </label>
                            <span className="text-[11px] font-semibold text-gray-400 italic">
                                Email được dùng để đăng nhập và nhận thông báo đơn hàng
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                disabled
                                value={user.email || ''}
                                className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                {(isEditing || selectedFile) && (
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            Hủy thao tác
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition shadow-lg shadow-red-600/20 active:scale-95 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang lưu thay đổi...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Lưu thay đổi</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AccountInfo;