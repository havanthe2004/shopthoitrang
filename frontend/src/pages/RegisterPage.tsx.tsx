import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerAPI } from '../services/authService';
import { registerSchema } from '../schemas/RegisterSchema'

type RegisterInput = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        setServerError('');
        try {
            await registerAPI(data);
            alert('Đăng ký thành công! Hãy đăng nhập để bắt đầu mua sắm.');
            navigate('/login');
        } catch (err: unknown) {
            setServerError(err.response?.data?.message || 'Email hoặc số điện thoại đã tồn tại.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10" style={{ fontFamily: 'Times New Roman' }}>
            <div className="w-full max-w-[450px] bg-white shadow-xl rounded-lg border border-gray-100 p-6 md:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-black">Tạo tài khoản</h2>
                    <p className="text-gray-500 text-[13px] mt-2 italic">Fashion Store - Nâng tầm phong cách của bạn</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-[13px]">
                    {/* Họ tên */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Họ và tên *</label>
                        <input
                            {...register("name")}
                            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md outline-none focus:border-black transition-all`}
                        />
                        {errors.name && <span className="text-red-600 text-[11px] italic">{errors.name.message}</span>}
                    </div>

                    {/* Số điện thoại */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Số điện thoại *</label>
                        <input
                            type="tel"
                            {...register("phone")}
                            placeholder="0912345678"
                            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md outline-none focus:border-black transition-all`}
                        />
                        {errors.phone && <span className="text-red-600 text-[11px] italic">{errors.phone.message}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Địa chỉ Email *</label>
                        <input
                            {...register("email")}
                            placeholder="example@mail.com"
                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md outline-none focus:border-black transition-all`}
                        />
                        {errors.email && <span className="text-red-600 text-[11px] italic">{errors.email.message}</span>}
                    </div>

                    {/* Mật khẩu */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Mật khẩu *</label>
                        <input
                            type="password"
                            {...register("password")}
                            placeholder="••••••••"
                            className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md outline-none focus:border-black transition-all`}
                        />
                        {errors.password && <span className="text-red-600 text-[11px] italic leading-tight">{errors.password.message}</span>}
                    </div>

                    {/* Nhập lại mật khẩu */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-700">Nhập lại mật khẩu *</label>
                        <input
                            type="password"
                            {...register("confirmPassword")}
                            placeholder="••••••••"
                            className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md outline-none focus:border-black transition-all`}
                        />
                        {errors.confirmPassword && <span className="text-red-600 text-[11px] italic">{errors.confirmPassword.message}</span>}
                    </div>

                    {serverError && <p className="text-red-600 bg-red-50 p-2 text-center text-[11px] border border-red-200">{serverError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-md font-bold uppercase tracking-wider transition-all mt-4
                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-red-600 shadow-md'}`}
                    >
                        {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-red-600 font-bold hover:underline">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;