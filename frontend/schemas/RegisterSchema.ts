import * as z from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, "Vui lòng nhập họ tên"),
    phone: z.string()
        .min(1, "Vui lòng nhập số điện thoại")
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678)"),
    email: z.string()
        .min(1, "Vui lòng nhập email")
        .email("Email sai định dạng (ví dụ: abc@gmail.com)"),
    password: z.string()
        .min(1, "Vui lòng nhập mật khẩu")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái thường")
        .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái hoa")
        .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt (@, #, $,...)"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
}); 