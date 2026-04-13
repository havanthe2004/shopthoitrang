import * as z from "zod";

export const profileSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Họ tên không được để trống")
        .max(50, "Họ tên không được quá 50 ký tự"),

    phone: z.string()
        .trim()
        .min(1, "Số điện thoại không được để trống")
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
});