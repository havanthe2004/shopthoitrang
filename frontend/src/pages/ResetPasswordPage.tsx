import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { resetPasswordAPI } from '../services/authService';

const resetSchema = z.object({
    email: z.string().min(1),
    otpCode: z.string().length(6, "Mã OTP phải gồm 6 chữ số"),
    newPassword: z.string()
        .min(1, "Vui lòng nhập mật khẩu mới")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái thường")
        .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái hoa")
        .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type ResetInput = z.infer<typeof resetSchema>;

const ResetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [serverError, setServerError] = React.useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetInput>({
        resolver: zodResolver(resetSchema),
        defaultValues: { email: location.state?.email || '' }
    });

    const onSubmit = async (data: ResetInput) => {
        setServerError('');
        try {
            await resetPasswordAPI(data);
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            navigate('/login');
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" style={{ fontFamily: 'Times New Roman' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100 space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6 uppercase tracking-wider">Đặt lại mật khẩu</h2>

                <input type="text" {...register("email")} disabled className="w-full border p-3 rounded bg-gray-50 text-gray-500 text-[13px]" />

                {/* Mã OTP */}
                <div>
                    <input
                        {...register("otpCode")}
                        placeholder="Nhập mã OTP 6 số"
                        className={`w-full border ${errors.otpCode ? 'border-red-500' : 'border-gray-300'} p-3 rounded outline-none focus:border-red-500 text-[13px]`}
                    />
                    {errors.otpCode && <p className="text-red-600 text-[11px] mt-1 italic">{errors.otpCode.message}</p>}
                </div>

                {/* Mật khẩu mới */}
                <div>
                    <input
                        type="password"
                        {...register("newPassword")}
                        placeholder="Mật khẩu mới"
                        className={`w-full border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} p-3 rounded outline-none focus:border-red-500 text-[13px]`}
                    />
                    {errors.newPassword && <p className="text-red-600 text-[11px] mt-1 italic leading-tight">{errors.newPassword.message}</p>}
                </div>

                {/* Nhập lại mật khẩu */}
                <div>
                    <input
                        type="password"
                        {...register("confirmPassword")}
                        placeholder="Nhập lại mật khẩu mới"
                        className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} p-3 rounded outline-none focus:border-red-500 text-[13px]`}
                    />
                    {errors.confirmPassword && <p className="text-red-600 text-[11px] mt-1 italic">{errors.confirmPassword.message}</p>}
                </div>

                {serverError && <p className="text-red-600 text-[11px] italic text-center">{serverError}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded font-bold uppercase transition ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 text-white hover:bg-black'}`}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;