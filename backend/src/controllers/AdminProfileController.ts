import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
import { AdminLog } from "../models/AdminLog";
import bcrypt from "bcryptjs";

export class AdminProfileController {

    static async getMyProfile(req: Request, res: Response) {
        try {
            const adminId = (req as any).admin.adminId;
            const adminRepo = AppDataSource.getRepository(Admin);
            const admin = await adminRepo.findOneBy({ adminId });

            if (!admin) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

            const { password, ...adminInfo } = admin;
            return res.json(adminInfo);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const adminId = (req as any).admin.adminId;
            const { username, phone, oldPassword, newPassword } = req.body;

            const adminRepo = AppDataSource.getRepository(Admin);
            const admin = await adminRepo.findOneBy({ adminId });
            if (!admin) return res.status(404).json({ message: "Admin không tồn tại" });

            let logDetails = [];

            // 1. Cập nhật Avatar (nếu có file mới)
            if (req.file) {
                if (admin.avatar) {
                    const oldPath = path.join(process.cwd(), admin.avatar);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath); // Xóa file vật lý
                    }
                }
                admin.avatar = `uploads/avatars/admin/${req.file.filename}`;
                logDetails.push("Cập nhật ảnh đại diện");
            }

            // 2. Cập nhật thông tin cơ bản
            if (username && username !== admin.username) {
                logDetails.push(`Đổi tên: ${admin.username} -> ${username}`);
                admin.username = username;
            }
            if (phone && phone !== admin.phone) {
                logDetails.push(`Đổi SĐT: ${admin.phone} -> ${phone}`);
                admin.phone = phone;
            }

            // 3. Xử lý đổi mật khẩu
            if (newPassword) {
                if (!oldPassword) return res.status(400).json({ message: "Cần nhập mật khẩu cũ để đổi mật khẩu mới" });

                const isMatch = await bcrypt.compare(oldPassword, admin.password);
                if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

                admin.password = await bcrypt.hash(newPassword, 10);
                logDetails.push("Thay đổi mật khẩu");
            }

            // Lưu thay đổi
            await adminRepo.save(admin);

            // 4. Ghi log vào bảng AdminLog
            if (logDetails.length > 0) {
                const logRepo = AppDataSource.getRepository(AdminLog);
                await logRepo.save(logRepo.create({
                    admin: { adminId },
                    action: `Chỉnh sửa hồ sơ: ${logDetails.join(", ")}`
                }));
            }

            return res.json({
                message: "Cập nhật thành công",
                admin: {
                    username: admin.username,
                    phone: admin.phone,
                    avatar: admin.avatar
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ" });
        }
    }
}