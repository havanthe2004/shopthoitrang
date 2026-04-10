import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
    try {
        const adminRepo = AppDataSource.getRepository(Admin);

        // 1. Kiểm tra xem đã có tài khoản admin nào chưa
        const adminCount = await adminRepo.count();

        if (adminCount === 0) {
            console.log("🚀 Chưa có tài khoản Admin. Đang khởi tạo tài khoản mặc định...");

            // 2. Mã hóa mật khẩu mặc định (Ví dụ: admin123)
            const hashedPassword = await bcrypt.hash("123456", 10);

            // 3. Tạo tài khoản siêu cấp
            const defaultAdmin = adminRepo.create({
                username: "admin",
                password: hashedPassword,
                role: "admin", // Quyền cao nhất
                phone: "0123456789",
                isActive: true,
                avatar: "" // Để trống, FE sẽ tự hiện chữ cái đầu
            });

            await adminRepo.save(defaultAdmin);
            console.log("✅ Tạo tài khoản Admin mặc định thành công!");
        } else {
            console.log("ℹ️ Hệ thống đã có tài khoản Admin, bỏ qua bước khởi tạo.");
        }
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo Admin mặc định:", error);
    }
};