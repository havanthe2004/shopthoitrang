import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginSuccess } from '../redux/slices/authSlice';
import { loginAPI } from '../services/authService';

// Schema
const loginSchema = z.object({
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginInput = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [serverError, setServerError] = useState('');
    const [show, setShow] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setServerError('');
        try {
            const res = await loginAPI(data);

            dispatch(loginSuccess({
                user: res.user,
                token: res.accessToken,
                refreshToken: res.refreshToken
            }));

            navigate('/');
        } catch (err: any) {
            setServerError("Email hoặc mật khẩu không chính xác!");
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-between bg-cover bg-center"
            style={{ backgroundImage: "url('https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2020/07/trendy-background-ideas-cover.jpg')" }}
        >
            {/* ================= HEADER ================= */}
            <header className="bg-white shadow px-6 py-3 flex justify-between items-center text-sm">
                <Link to="/" className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        className="h-10 object-contain"
                    />
                </Link>

                <nav className="flex gap-5">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/about">Giới thiệu</Link>
                    <Link to="/men">Sản phẩm nam</Link>
                    <Link to="/women">Sản phẩm nữ</Link>
                    <Link to="/news">Tin tức</Link>
                    <Link to="/contact">Liên hệ</Link>
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
                        Đăng nhập
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">

                        {/* Email */}
                        <div>
                            <label className="font-semibold">Email:</label>
                            <input
                                {...register("email")}
                                placeholder="Email"
                                className="w-full p-2 mt-1 bg-gray-100 border outline-none"
                            />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="font-semibold">Mật khẩu:</label>
                            <input
                                type={show ? "text" : "password"}
                                {...register("password")}
                                placeholder="Mật khẩu"
                                className="w-full p-2 mt-1 bg-gray-100 border outline-none"
                            />
                            <span
                                onClick={() => setShow(!show)}
                                className="absolute right-2 top-9 cursor-pointer"
                            >
                                👁
                            </span>
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        {/* Quên mật khẩu */}
                        <div className="text-right text-xs text-gray-600">
                            <Link to="/forgot-password" className="hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Server error */}
                        {serverError && (
                            <p className="text-red-500 text-center text-xs">
                                {serverError}
                            </p>
                        )}

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-2 mt-3 hover:bg-gray-800"
                        >
                            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-3">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-red-500">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white bg-opacity-80 px-6 py-6 text-sm">
                <div className="grid grid-cols-3 gap-6 text-center">
                    
                    <div>
                        <h3 className="font-semibold text-blue-500 mb-2">Giới thiệu</h3>
                        <Link to="/terms" className="block hover:underline">• Điều khoản sử dụng</Link>
                        <Link to="/about" className="block hover:underline">• Về chúng tôi</Link>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-500 mb-2">Hỗ trợ khách hàng</h3>
                        <Link to="/guide" className="block hover:underline">• Hướng dẫn mua hàng</Link>
                        <Link to="/policy" className="block hover:underline">• Chính sách đổi trả</Link>
                    </div>

                    <div>
                        <h3 className="font-semibold text-orange-500 mb-2">Liên hệ</h3>
                        <Link to="/contact" className="block hover:underline">Địa chỉ: Hà Nội</Link>
                        <Link to="/contact" className="block hover:underline">Điện thoại: 0123456789</Link>
                        <Link to="/contact" className="block hover:underline">Email: example@gmail.com</Link>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default LoginPage;