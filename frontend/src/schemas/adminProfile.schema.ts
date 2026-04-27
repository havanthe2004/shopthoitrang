import * as z from 'zod';

export const adminProfileSchema = z.object({
    username: z.string()
        .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
        .max(50, "Tên đăng nhập quá dài"),
    phone: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
        if (!val) return true; 
        return /^(0[3|5|7|8|9])([0-9]{8})$/.test(val);
    }, {
        message: "Số điện thoại không đúng định dạng VN"
    }),
    oldPassword: z.string().optional().or(z.literal('')),
    newPassword: z.string()
        .min(8, "Mật khẩu mới phải từ 8 ký tự")
        .optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.newPassword) {
        return data.oldPassword !== '' && data.newPassword === data.confirmPassword;
    }
    return true;
}, {
    message: "Xác nhận mật khẩu không khớp hoặc thiếu mật khẩu cũ",
    path: ["confirmPassword"],
});