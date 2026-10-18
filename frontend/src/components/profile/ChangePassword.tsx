import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    Check,
    X,
    ShieldAlert,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { changePasswordAPI } from '../../services/userService';
import { toast } from 'react-toastify';

const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string()
        .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
        .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái in hoa")
        .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái in thường")
        .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt (@, #, $, ...)"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Xác nhận mật khẩu mới không khớp",
    path: ["confirmPassword"]
});

type PasswordInput = z.infer<typeof passwordSchema>;

const ChangePassword = () => {
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<PasswordInput>({
        resolver: zodResolver(passwordSchema),
        mode: "onChange"
    });

    const newPasswordValue = watch("newPassword") || "";
    const confirmPasswordValue = watch("confirmPassword") || "";

    // Live validation rules
    const rules = [
        { label: "Tối thiểu 8 ký tự", met: newPasswordValue.length >= 8 },
        { label: "Chứa ít nhất 1 chữ hoa (A-Z)", met: /[A-Z]/.test(newPasswordValue) },
        { label: "Chứa ít nhất 1 chữ thường (a-z)", met: /[a-z]/.test(newPasswordValue) },
        { label: "Chứa ít nhất 1 chữ số (0-9)", met: /[0-9]/.test(newPasswordValue) },
        { label: "Chứa ít nhất 1 ký tự đặc biệt (!@#$...)", met: /[^a-zA-Z0-9]/.test(newPasswordValue) },
        {
            label: "Mật khẩu xác nhận trùng khớp",
            met: confirmPasswordValue.length > 0 && newPasswordValue === confirmPasswordValue
        }
    ];

    const onSubmit = async (data: PasswordInput) => {
        try {
            await changePasswordAPI(data);
            toast.success("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.");
            reset();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.";
            toast.error(msg);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
                            Đổi mật khẩu
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Để bảo vệ tài khoản của bạn, vui lòng không chia sẻ mật khẩu cho người khác
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column */}
                <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-6">
                    {/* Old Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <Lock className="w-4 h-4 text-gray-400" />
                            <span>Mật khẩu hiện tại <span className="text-red-500">*</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type={showOld ? "text" : "password"}
                                {...register("oldPassword")}
                                placeholder="Nhập mật khẩu hiện tại"
                                className={`w-full py-3.5 pl-4 pr-11 rounded-xl text-sm font-semibold transition-all outline-none border ${
                                    errors.oldPassword
                                        ? 'border-red-500 ring-2 ring-red-100'
                                        : 'border-gray-300 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                            >
                                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.oldPassword && (
                            <p className="text-red-600 text-xs font-medium pl-1">
                                {errors.oldPassword.message}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <KeyRound className="w-4 h-4 text-red-600" />
                            <span>Mật khẩu mới <span className="text-red-500">*</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                {...register("newPassword")}
                                placeholder="Nhập mật khẩu mới (Tối thiểu 8 ký tự)"
                                className={`w-full py-3.5 pl-4 pr-11 rounded-xl text-sm font-semibold transition-all outline-none border ${
                                    errors.newPassword
                                        ? 'border-red-500 ring-2 ring-red-100'
                                        : 'border-gray-300 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-600 text-xs font-medium pl-1">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-gray-400" />
                            <span>Xác nhận mật khẩu mới <span className="text-red-500">*</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                {...register("confirmPassword")}
                                placeholder="Nhập lại mật khẩu mới"
                                className={`w-full py-3.5 pl-4 pr-11 rounded-xl text-sm font-semibold transition-all outline-none border ${
                                    errors.confirmPassword
                                        ? 'border-red-500 ring-2 ring-red-100'
                                        : 'border-gray-300 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-xs font-medium pl-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-6 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-98 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang cập nhật mật khẩu...</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound className="w-4 h-4" />
                                    <span>Cập nhật mật khẩu mới</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Password Requirements Guide Card */}
                <div className="lg:col-span-5 bg-gray-50/80 rounded-2xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-700">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span>Quy định mật khẩu an toàn</span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                        Mật khẩu cần đáp ứng đầy đủ các tiêu chuẩn bảo mật sau để đảm bảo an toàn cho tài khoản và đơn hàng của bạn:
                    </p>

                    <div className="space-y-2.5 pt-2">
                        {rules.map((rule, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                    rule.met
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {rule.met ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className={`font-medium transition-colors ${
                                    rule.met ? 'text-gray-900 font-semibold' : 'text-gray-400'
                                }`}>
                                    {rule.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200/60 text-[11px] text-gray-400 leading-relaxed">
                        Mẹo: Bạn nên sử dụng một mật khẩu duy nhất không trùng lặp với các dịch vụ khác.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;