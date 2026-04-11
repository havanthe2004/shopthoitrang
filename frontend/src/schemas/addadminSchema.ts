// import * as z from "zod";

// export const adminSchema = z.object({
//     username: z
//         .string()
//         .min(1, "Vui lòng nhập tên đăng nhập")
//         .min(6, "Tên đăng nhập tối thiểu 6 ký tự"),

//     phone: z
//         .string()
//         .optional()
//         .refine((val) => {
//             if (!val) return true;
//             return /^(03|05|07|08|09)[0-9]{8}$/.test(val);
//         }, {
//             message: "Số điện thoại không đúng định dạng Việt Nam",
//         }),

//     role: z.enum(["staff", "manager", "admin"], {
//         errorMap: () => ({ message: "Vai trò không hợp lệ" })
//     }),

//     password: z.string()
//         .min(1, "Vui lòng nhập mật khẩu")
//         .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
//         .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái thường")
//         .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái hoa")
//         .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
//         .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt (@, #, $,...)"),

//    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
// })
//     .refine((data) => {
//         if (!data.password) return true;
//         return data.password === data.confirmPassword;
//     }, {
//         message: "Mật khẩu xác nhận không khớp",
//         path: ["confirmPassword"],
//     });

import * as z from "zod";

// =======================
// BASE (dùng chung)
// =======================
const baseSchema = {
    username: z
        .string()
        .min(1, "Vui lòng nhập tên đăng nhập")
        .min(6, "Tên đăng nhập tối thiểu 6 ký tự"),

    phone: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return /^(03|05|07|08|09)[0-9]{8}$/.test(val);
        }, {
            message: "Số điện thoại không đúng định dạng Việt Nam",
        }),

    role: z.enum(["staff", "manager", "admin"], {
        errorMap: () => ({ message: "Vai trò không hợp lệ" })
    }),
};

// =======================
// CREATE SCHEMA
// =======================
export const createAdminSchema = z.object({
    ...baseSchema,

    password: z.string()
        .min(1, "Vui lòng nhập mật khẩu")
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái thường")
        .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái hoa")
        .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt"),

    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});


// =======================
// UPDATE SCHEMA
// =======================
export const updateAdminSchema = z.object({
    ...baseSchema,

    password: z.string()
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ cái thường")
        .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ cái hoa")
        .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
        .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt")
        .optional()
        .or(z.literal("")), // 👈 cho phép rỗng

    confirmPassword: z.string().optional(),
})
.refine((data) => {
    if (!data.password) return true; // 👈 không nhập thì bỏ qua
    return data.password === data.confirmPassword;
}, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});