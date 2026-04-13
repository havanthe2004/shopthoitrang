import * as z from 'zod';

export const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Họ tên không được để trống"),

    phone: z.string()
        .trim()
        .min(1, "Số điện thoại không được để trống")
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ"),

    email: z.string()
        .trim()
        .min(1, "Email không được để trống")
        .email("Email không hợp lệ"),

    password: z.string()
        .min(1, "Mật khẩu không được để trống")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),

    confirmPassword: z.string()
        .min(1, "Vui lòng nhập lại mật khẩu"),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});