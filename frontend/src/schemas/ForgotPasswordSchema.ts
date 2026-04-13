import * as z from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string()
        .trim()
        .min(1, "Email không được để trống")
        .email("Email không hợp lệ"),
});