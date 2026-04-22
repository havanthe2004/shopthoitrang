import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { AdminLog } from "../models/AdminLog";

export class UserManagementController {
    
    // Helper để ghi log chi tiết
    private static async saveLog(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({
            admin: { adminId },
            action
        }));
    }

    // [GET] Lấy danh sách người dùng (Phân trang + Tìm kiếm + Lọc)
    static async getUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const status = req.query.status as string; // "active" hoặc "blocked"

            const userRepo = AppDataSource.getRepository(User);
            const query = userRepo.createQueryBuilder("user")
                .leftJoinAndSelect("user.addresses", "addresses")
                .select([
                    "user.userId", "user.email", "user.name", 
                    "user.phone", "user.avatar", "user.isActive", "user.createdAt"
                ]);

            // Tìm kiếm bằng Tên, Email hoặc Số điện thoại
            if (search) {
                query.andWhere(
                    "(user.name LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)",
                    { search: `%${search}%` }
                );
            }

            // Bộ lọc trạng thái
            if (status === "active") {
                query.andWhere("user.isActive = :isActive", { isActive: true });
            } else if (status === "blocked") {
                query.andWhere("user.isActive = :isActive", { isActive: false });
            }

            const [items, total] = await query
                .orderBy("user.createdAt", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            return res.json({
                items,
                meta: {
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page
                }
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy danh sách người dùng" });
        }
    }

    // [GET] Xem chi tiết một người dùng
    static async getUserDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOne({
                where: { userId: Number(id) },
                relations: ["addresses", "orders"] // Xem thêm địa chỉ và lịch sử đơn hàng
            });

            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
            
            // Không gửi password về FE
            delete (user as any).password;

            return res.json(user);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy thông tin chi tiết" });
        }
    }

    // [PATCH] Vô hiệu hóa hoặc Kích hoạt lại tài khoản (Xóa mềm)
    static async toggleUserStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { isActive } = req.body; // true hoặc false
            const adminId = (req as any).admin.adminId; // Lấy từ token admin

            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ userId: Number(id) });

            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            const oldStatus = user.isActive;
            user.isActive = isActive;
            await userRepo.save(user);

            // Ghi log hành động
            const actionDetail = isActive 
                ? `KÍCH HOẠT lại tài khoản khách hàng: ${user.email} (ID: ${user.userId})` 
                : `VÔ HIỆU HÓA tài khoản khách hàng: ${user.email} (ID: ${user.userId})`;
            
            await UserManagementController.saveLog(adminId, actionDetail);

            return res.json({ 
                message: isActive ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản",
                isActive: user.isActive 
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật trạng thái người dùng" });
        }
    }
}