import * as z from 'zod';

export const addressSchema = z.object({
    receiverName: z.string()
        .trim()
        .min(1, "Tên người nhận không được để trống"),

    phone: z.string()
        .trim()
        .min(1, "Số điện thoại không được để trống")
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ"),

    province: z.string()
        .trim()
        .min(1, "Tỉnh/Thành phố không được để trống"),

    district: z.string()
        .trim()
        .min(1, "Quận/Huyện không được để trống"),

    ward: z.string()
        .trim()
        .min(1, "Phường/Xã không được để trống"),

    detailAddress: z.string()
        .trim()
        .min(1, "Địa chỉ chi tiết không được để trống"),

    isDefault: z.boolean().optional(),
});