import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerAPI } from '../services/authService';
import { registerSchema } from '../schemas/RegisterSchema';

type RegisterInput = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
            alert('Đăng ký thành công!');
            navigate('/login');
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Email hoặc số điện thoại đã tồn tại.');
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-between bg-cover bg-center"
            style={{ backgroundImage: "url('https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2020/07/trendy-background-ideas-cover.jpg)" }}
        >
            {/* HEADER */}
            <header className="bg-white shadow px-6 py-3 flex justify-between items-center text-sm">
                <div className="font-bold text-lg">D&T</div>

                <nav className="flex gap-5">
                    <a href="#">Trang chủ</a>
                    <a href="#">Giới thiệu</a>
                    <a href="#">Sản phẩm nam</a>
                    <a href="#">Sản phẩm nữ</a>
                    <a href="#">Tin tức</a>
                    <a href="#">Liên hệ</a>
                </nav>

                <div className="flex gap-3">
                    <Link to="/login">Đăng nhập</Link>
                    <Link to="/register">Đăng ký</Link>
                </div>
            </header>

            {/* FORM */}
            <div className="flex justify-center items-center py-10">
                <div className="w-[420px] bg-gray-300 p-6 shadow-md">
                    <h2 className="text-center font-bold text-lg mb-4">
                        Tạo tài khoản
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">

                        <div>
                            <label className="font-semibold">Họ và tên:</label>
                            <input {...register("name")} className="w-full p-2 mt-1 bg-gray-100 border outline-none" />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="font-semibold">Số điện thoại:</label>
                            <input {...register("phone")} className="w-full p-2 mt-1 bg-gray-100 border outline-none" />
                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="font-semibold">Email:</label>
                            <input {...register("email")} className="w-full p-2 mt-1 bg-gray-100 border outline-none" />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="font-semibold">Mật khẩu:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                className="w-full p-2 mt-1 bg-gray-100 border outline-none"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-9 cursor-pointer"
                            >
                                👁
                            </span>
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        {/* Confirm */}
                        <div className="relative">
                            <label className="font-semibold">Nhập lại mật khẩu:</label>
                            <input
                                type={showConfirm ? "text" : "password"}
                                {...register("confirmPassword")}
                                className="w-full p-2 mt-1 bg-gray-100 border outline-none"
                            />
                            <span
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-2 top-9 cursor-pointer"
                            >
                                👁
                            </span>
                            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                        </div>

                        {serverError && (
                            <p className="text-red-500 text-center text-xs">
                                {serverError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-2 mt-3 hover:bg-gray-800"
                        >
                            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-3">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-red-500">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="bg-white bg-opacity-80 px-6 py-6 text-sm">
                <div className="grid grid-cols-3 gap-6 text-center">
                    
                    <div>
                        <h3 className="font-semibold text-blue-500 mb-2">Giới thiệu</h3>
                        <p>• Điều khoản sử dụng</p>
                        <p>• Về chúng tôi</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-500 mb-2">Hỗ trợ khách hàng</h3>
                        <p>• Hướng dẫn mua hàng</p>
                        <p>• Chính sách đổi trả</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-orange-500 mb-2">Liên hệ</h3>
                        <p>Địa chỉ: Hà Nội</p>
                        <p>Điện thoại: 0123456789</p>
                        <p>Email: example@gmail.com</p>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default RegisterPage;