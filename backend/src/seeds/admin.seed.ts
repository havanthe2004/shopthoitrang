import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
    try {
        const adminRepo = AppDataSource.getRepository(Admin);

        const adminCount = await adminRepo.count();

        if (adminCount === 0) {
            console.log(" Chưa có tài khoản Admin. Đang khởi tạo tài khoản mặc định...");


            const hashedPassword = await bcrypt.hash("123456", 10);

            const defaultAdmin = adminRepo.create({
                username: "admin",
                password: hashedPassword,
                role: "admin", 
                phone: "0123456789",
                isActive: true,
                avatar: "" 
            });

            await adminRepo.save(defaultAdmin);
            console.log(" Tạo tài khoản Admin mặc định thành công!");
        } else {
            console.log("ℹ Hệ thống đã có tài khoản Admin, bỏ qua bước khởi tạo.");
        }
    } catch (error) {
        console.error(" Lỗi khi khởi tạo Admin mặc định:", error);
    }
};