import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FaCamera, FaUser, FaPhone, FaEnvelope, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import { getProfileAPI, updateProfileAPI } from '../../services/userService';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';

// 1. Schema xác thực Zod
const profileSchema = z.object({
    name: z.string().min(1, "Họ tên không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống").regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam"),
});

type ProfileInput = z.infer<typeof profileSchema>;

const AccountInfo = () => {
    const dispatch = useDispatch();
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema)
    });

    console.log(user);
    // 2. Lấy dữ liệu người dùng
    const fetchUser = async () => {
        try {
            const res = await getProfileAPI();
            const data = res.data || res;
            setUser(data);
            reset({ name: data.name, phone: data.phone }); // Đưa dữ liệu vào form

            dispatch(loginSuccess({
                user: data,
                token: localStorage.getItem('token') || '',
                refreshToken: localStorage.getItem('refreshToken') || ''
            }));
        } catch (err) {
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra đăng nhập.");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // 3. Xử lý đổi ảnh (Preview)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // 4. Lưu thông tin cập nhật
    const onSubmit = async (data: ProfileInput) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        if (selectedFile) formData.append('avatar', selectedFile);

        try {
            const res = await updateProfileAPI(formData);
            const updatedData = res.data || res;
            alert("Cập nhật thông tin thành công!");

            setIsEditing(false);
            setAvatarPreview(null);
            fetchUser(); // Tải lại dữ liệu mới nhất
            dispatch(loginSuccess({
                user: updatedData,
                token: localStorage.getItem('token') || '',
                refreshToken: localStorage.getItem('refreshToken') || ''
            }));
        } catch (err) {
            alert("Lỗi khi cập nhật hồ sơ.");
        }
    };

    if (error) return <p className="text-red-500 italic p-4">{error}</p>;
    if (!user) return <p className="italic p-4 text-[13px]">Đang tải dữ liệu...</p>;

    return (
        <div className="max-w-2xl" style={{ fontFamily: 'Times New Roman' }}>
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h3 className="text-xl font-bold uppercase tracking-widest">Hồ sơ cá nhân</h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-blue-600 font-bold hover:underline text-[13px]"
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                ) : (
                    <button
                        onClick={() => { setIsEditing(false); setAvatarPreview(null); }}
                        className="flex items-center gap-2 text-gray-500 font-bold hover:underline text-[13px]"
                    >
                        <FaTimes /> Hủy bỏ
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Phần Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                            <img
                                src={avatarPreview || (user.avatar ? `http://localhost:3000/${user.avatar}` : "/avt_default/download.jpg")}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isEditing && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <FaCamera className="text-white text-xl" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                    </div>
                    {isEditing && <p className="text-[11px] text-gray-400 mt-2 italic">Nhấn vào ảnh để thay đổi</p>}
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 font-bold text-gray-700 text-[13px]">
                            <FaEnvelope className="text-gray-400" /> Địa chỉ Email
                        </label>
                        <input
                            type="text"
                            disabled
                            value={user.email}
                            className="w-full bg-gray-50 border p-3 rounded text-gray-500 text-[13px] outline-none"
                        />
                    </div>

                    {/* Họ tên */}
                    <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 font-bold text-gray-700 text-[13px]">
                            <FaUser className="text-gray-400" /> Họ và tên *
                        </label>
                        <input
                            {...register("name")}
                            disabled={!isEditing}
                            className={`w-full border p-3 rounded text-[13px] outline-none transition-all 
                                ${!isEditing ? 'bg-transparent border-transparent' : 'border-gray-300 focus:border-black shadow-sm'}`}
                        />
                        {errors.name && <span className="text-red-600 text-[11px] italic">{errors.name.message}</span>}
                    </div>

                    {/* Số điện thoại */}
                    <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 font-bold text-gray-700 text-[13px]">
                            <FaPhone className="text-gray-400" /> Số điện thoại *
                        </label>
                        <input
                            {...register("phone")}
                            disabled={!isEditing}
                            className={`w-full border p-3 rounded text-[13px] outline-none transition-all 
                                ${!isEditing ? 'bg-transparent border-transparent' : 'border-gray-300 focus:border-black shadow-sm'}`}
                        />
                        {errors.phone && <span className="text-red-600 text-[11px] italic">{errors.phone.message}</span>}
                    </div>
                </div>

                {isEditing && (
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-red-600 transition shadow-md disabled:bg-gray-400 text-[12px]"
                        >
                            {isSubmitting ? 'Đang lưu...' : <><FaCheck /> Lưu thay đổi</>}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AccountInfo;