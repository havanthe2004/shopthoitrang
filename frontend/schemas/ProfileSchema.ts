import * as z from "zod";

export const profileSchema = z.object({
    name: z.string()
        .min(1, "Vui lòng nhập họ tên")
        .max(50, "Họ tên không được quá 50 ký tự"),

    phone: z.string()
        .min(1, "Vui lòng nhập số điện thoại")
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ"),

    email: z.string()
        .min(1, "Vui lòng nhập email")
        .email("Email sai định dạng"),

    address: z.string()
        .max(200, "Địa chỉ quá dài")
        .optional()
        .or(z.literal("")),
});