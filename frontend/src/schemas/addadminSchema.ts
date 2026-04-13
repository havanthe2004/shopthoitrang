import * as z from "zod";

// =======================
// BASE
// =======================
const baseSchema = {
    username: z.string()
        .trim()
        .min(1, "Tên đăng nhập không được để trống")
        .min(6, "Tên đăng nhập tối thiểu 6 ký tự"),

    phone: z.string()
        .trim()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return /^(03|05|07|08|09)[0-9]{8}$/.test(val);
        }, {
            message: "Số điện thoại không hợp lệ",
        }),

    role: z.enum(["staff", "manager", "admin"], {
        errorMap: () => ({ message: "Vai trò không hợp lệ" })
    }),
};

// =======================
// CREATE
// =======================
export const createAdminSchema = z.object({
    ...baseSchema,

    password: z.string()
        .min(1, "Mật khẩu không được để trống")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái thường")
        .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái hoa")
        .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt"),

    confirmPassword: z.string()
        .min(1, "Vui lòng nhập lại mật khẩu"),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});


// =======================
// UPDATE
// =======================
export const updateAdminSchema = z.object({
    ...baseSchema,

    password: z.string()
        .transform(val => val === "" ? undefined : val)
        .optional()
        .refine((val) => {
            if (!val) return true;
            return val.length >= 8
                && /[a-z]/.test(val)
                && /[A-Z]/.test(val)
                && /[0-9]/.test(val)
                && /[^a-zA-Z0-9]/.test(val);
        }, {
            message: "Mật khẩu không hợp lệ",
        }),

    confirmPassword: z.string().optional(),
})
.refine((data) => {
    if (!data.password) return true;
    return data.password === data.confirmPassword;
}, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});