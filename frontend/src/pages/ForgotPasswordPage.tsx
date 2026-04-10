import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { forgotPasswordAPI } from '../services/authService';

const forgotSchema = z.object({
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

type ForgotInput = z.infer<typeof forgotSchema>;

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = React.useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotInput>({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: ForgotInput) => {
        setServerError('');
        try {
         
            await forgotPasswordAPI(data.email);
            alert('Mã OTP đã được gửi về email của bạn.');
            navigate('/reset-password', { state: { email: data.email } });
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Email không tồn tại hoặc lỗi hệ thống.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" style={{ fontFamily: 'Times New Roman' }}>
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-center mb-6 uppercase tracking-wider">Quên mật khẩu</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register("email")}
                            placeholder="Nhập email của bạn"
                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded outline-none focus:border-red-500 text-[13px]`}
                        />
                        {errors.email && <p className="text-red-600 text-[11px] mt-1 italic">{errors.email.message}</p>}
                    </div>

                    {serverError && <p className="text-red-600 text-[11px] italic text-center">{serverError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded font-bold uppercase transition ${isSubmitting ? 'bg-gray-400' : 'bg-black text-white hover:bg-red-600'}`}
                    >
                        {isSubmitting ? 'Đang gửi mã OTP...' : 'Gửi mã OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;