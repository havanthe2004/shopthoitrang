import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginSuccess } from '../redux/slices/authSlice';
import { loginAPI } from '../services/authService';


const loginSchema = z.object({
    email: z.string()
        .min(1, "Vui lòng nhập email")
        .email("Email sai định dạng (ví dụ: abc@gmail.com)"),
    password: z.string()
        .min(1, "Vui lòng nhập mật khẩu")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
});

type LoginInput = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [serverError, setServerError] = React.useState('');
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

    const showpass = () => {
        setShow((prev) => prev = !prev)
    }
    const onSubmit = async (data: LoginInput) => {
        setServerError('');
        try {
            const response = await loginAPI(data);

            dispatch(loginSuccess({
                user: response.user,
                token: response.accessToken,
                refreshToken: response.refreshToken
            }));
            navigate('/');
        } catch (err: any) {
            console.log("Login error:", err);

            if (err.response && err.response.data && err.response.data.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError("Không thể kết nối tới server!");
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[85vh] bg-gray-50 px-4" style={{ fontFamily: 'Times New Roman' }}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-[400px] p-8 bg-white shadow-xl rounded-lg border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest text-black">Đăng nhập</h2>

        
                <div className="mb-4">
                    <label className="block mb-1 font-bold text-gray-700 text-[13px]">Email *</label>
                    <input
                        type="text"
                        {...register("email")}
                        placeholder="example@gmail.com"
                        className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md outline-none focus:border-black transition-all text-[13px]`}
                    />
                    {errors.email && (
                        <p className="text-red-600 text-[11px] mt-1 italic">{errors.email.message}</p>
                    )}
                </div>

             
                <div className="mb-2">
                    <label className="block mb-1 font-bold text-gray-700 text-[13px]">
                        Mật khẩu *
                    </label>

                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            {...register("password")}
                            placeholder="••••••••"
                            className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"
                                } p-3 pr-10 rounded-md outline-none focus:border-black transition-all text-[13px]`}
                        />

                        <span
                            onClick={showpass}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                        >
                            {show ? "🙈" : "🙉 "}
                        </span>
                    </div>

                    {errors.password && (
                        <p className="text-red-600 text-[11px] mt-1 italic">
                            {errors.password.message}
                        </p>
                    )}
                </div>

           
                <div className="flex justify-end mb-6">
                    <Link to="/forgot-password" size={13} className="text-[12px] text-gray-500 hover:text-red-600 hover:underline transition">
                        Quên mật khẩu?
                    </Link>
                </div>

               
                {serverError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-center text-[13px] rounded">
                        ❌ {serverError}
                    </div>
                )}

               
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-md font-bold uppercase tracking-widest transition-all duration-300 shadow-md text-[13px]
                        ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-red-600'}`}
                >
                    {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}
                </button>

               
                <div className="text-center mt-6 text-[13px]">
                    <p className="text-gray-500">
                        Chưa có tài khoản?{' '}
                        <Link to="/register">
                            <span className="text-red-600 font-bold hover:underline">Đăng ký ngay</span>
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;