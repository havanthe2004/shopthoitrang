import * as z from "zod";

export const loginSchema = z.object({
    email: z.string()
        .min(1, "Vui lòng nhập email")
        .email("Email sai định dạng (ví dụ: abc@gmail.com)"),

    password: z.string()
        .min(1, "Vui lòng nhập mật khẩu")
});