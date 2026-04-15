import * as z from 'zod';

export const websiteConfigSchema = z.object({
    siteName: z.string().min(3, "Tên website phải có ít nhất 3 ký tự").max(100),
    email: z.string().email("Email không đúng định dạng"),
    phone: z.string().regex(/^(0[3|5|7|8|9])([0-9]{8})$/, "Số điện thoại không hợp lệ"),
    address: z.string().min(5, "Địa chỉ quá ngắn"),
});