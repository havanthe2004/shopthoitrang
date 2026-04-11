import * as z from "zod";

export const forgotPasswordSchema = z.object({
email: z.string()
.trim()
.min(1, "Vui lòng nhập email")
.email("Email sai định dạng (ví dụ: [abc@gmail.com](mailto:abc@gmail.com))"),
});
