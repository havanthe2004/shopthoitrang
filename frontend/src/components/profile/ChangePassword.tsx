import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { changePasswordAPI } from '../../services/userService';

const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z.string()
        .min(8, "Mật khẩu mới ít nhất 8 ký tự")
        .regex(/[A-Z]/, "Cần 1 chữ hoa")
        .regex(/[a-z]/, "Cần 1 chữ thường")
        .regex(/[0-9]/, "Cần 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Cần 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"]
});

const ChangePassword = () => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(passwordSchema)
    });

    const onSubmit = async (data: any) => {
        try {
            await changePasswordAPI(data);
            alert("Đổi mật khẩu thành công!");
            reset(); // Xóa sạch form
        } catch (err: any) {
            alert(err.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
            <h3 className="text-xl font-bold uppercase mb-6">Đổi mật khẩu</h3>

            <div>
                <label className="block font-bold mb-1">Mật khẩu cũ *</label>
                <input type="password" {...register("oldPassword")} className="w-full border p-3 rounded text-[13px] outline-none focus:border-red-600" />
                {errors.oldPassword && <p className="text-red-600 text-[11px] italic">{errors.oldPassword.message as string}</p>}
            </div>

            <div>
                <label className="block font-bold mb-1">Mật khẩu mới *</label>
                <input type="password" {...register("newPassword")} className="w-full border p-3 rounded text-[13px] outline-none focus:border-red-600" />
                {errors.newPassword && <p className="text-red-600 text-[11px] italic leading-tight">{errors.newPassword.message as string}</p>}
            </div>

            <div>
                <label className="block font-bold mb-1">Nhập lại mật khẩu mới *</label>
                <input type="password" {...register("confirmPassword")} className="w-full border p-3 rounded text-[13px] outline-none focus:border-red-600" />
                {errors.confirmPassword && <p className="text-red-600 text-[11px] italic">{errors.confirmPassword.message as string}</p>}
            </div>

            <button disabled={isSubmitting} className="w-full bg-black text-white py-3 font-bold uppercase hover:bg-red-600 transition disabled:bg-gray-400 mt-4">
                {isSubmitting ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </button>
        </form>
    );
};
export default ChangePassword;