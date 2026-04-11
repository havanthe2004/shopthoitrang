import * as z from 'zod';

export const addressSchema = z.object({
    receiverName: z.string().min(1, "Vui lòng nhập tên người nhận"),
    phone: z.string().regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
    province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
    district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
    ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
    detailAddress: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)"),
    isDefault: z.boolean().optional(),
});