import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
import { AdminLog } from "../models/AdminLog";
import bcrypt from "bcryptjs";

export class AdminManagementController {
    // Ghi log helper
    private static async saveLog(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({ admin: { adminId }, action }));
    }

    // 1. Lấy danh sách nhân viên (Phân trang + Lọc + Tìm kiếm)
    static async getAdmins(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const roleFilter = req.query.role as string;
            const statusFilter = req.query.status as string; // 'active' hoặc 'hidden'

            const adminRepo = AppDataSource.getRepository(Admin);
            const query = adminRepo.createQueryBuilder("admin")
                .select(["admin.adminId", "admin.username", "admin.role", "admin.phone", "admin.isActive", "admin.avatar"]);

            // Tìm kiếm theo username hoặc phone
            if (search) {
                query.andWhere("(admin.username LIKE :search OR admin.phone LIKE :search)", { search: `%${search}%` });
            }

            // Lọc theo role
            if (roleFilter) {
                query.andWhere("admin.role = :role", { role: roleFilter });
            }

            // Lọc theo trạng thái
            if (statusFilter) {
                const isActive = statusFilter === 'active';
                query.andWhere("admin.isActive = :isActive", { isActive });
            }

            const [items, total] = await query
                .orderBy("admin.adminId", "DESC")
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
            return res.status(500).json({ message: "Lỗi lấy danh sách nhân viên" });
        }
    }

    // 2. Thêm mới nhân viên
    static async createAdmin(req: Request, res: Response) {
        try {
            const { username, password, role, phone } = req.body;
            const performerId = (req as any).admin.adminId;
            const adminRepo = AppDataSource.getRepository(Admin);

            const existing = await adminRepo.findOneBy({ username });
            if (existing) return res.status(400).json({ message: "Username đã tồn tại" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = adminRepo.create({
                username,
                password: hashedPassword,
                role,
                phone,
                isActive: true
            });

            await adminRepo.save(newAdmin);
            await AdminManagementController.saveLog(performerId, `Thêm nhân viên mới: ${username} (Role: ${role})`);

            return res.status(201).json({ message: "Thêm nhân viên thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi thêm nhân viên" });
        }
    }

    // 3. Cập nhật thông tin / Phân quyền
    static async updateAdmin(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { role, phone, isActive } = req.body;
            const performerId = (req as any).admin.adminId;
            const adminRepo = AppDataSource.getRepository(Admin);

            const admin = await adminRepo.findOneBy({ adminId: Number(id) });
            if (!admin) return res.status(404).json({ message: "Không tìm thấy nhân viên" });

            // Ghi nhận thay đổi để log
            let changes = [];
            if (role && role !== admin.role) {
                changes.push(`Role: ${admin.role} -> ${role}`);
                admin.role = role;
            }
            if (phone !== undefined) admin.phone = phone;
            if (isActive !== undefined) admin.isActive = isActive;

            await adminRepo.save(admin);
            if (changes.length > 0) {
                await AdminManagementController.saveLog(performerId, `Cập nhật nhân viên ${admin.username}: ${changes.join(", ")}`);
            }

            return res.json({ message: "Cập nhật thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật nhân viên" });
        }
    }

    // 4. Toggle trạng thái (Xoá mềm / Kích hoạt lại)
    static async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const performer = (req as any).admin; // Admin đang thực hiện
            const adminRepo = AppDataSource.getRepository(Admin);

            const targetAdmin = await adminRepo.findOneBy({ adminId: Number(id) });
            if (!targetAdmin) return res.status(404).json({ message: "Không tìm thấy" });

            // Ràng buộc bảo mật
            if (targetAdmin.adminId === performer.adminId) {
                return res.status(403).json({ message: "Bạn không thể tự vô hiệu hoá chính mình" });
            }
            if (targetAdmin.role === 'admin') {
                return res.status(403).json({ message: "Không thể vô hiệu hoá tài khoản Quản trị cấp cao (Admin)" });
            }

            targetAdmin.isActive = !targetAdmin.isActive;
            await adminRepo.save(targetAdmin);

            const action = targetAdmin.isActive ? "Kích hoạt lại" : "Vô hiệu hoá (Xoá mềm)";
            await AdminManagementController.saveLog(performer.adminId, `${action} tài khoản: ${targetAdmin.username}`);

            return res.json({ success: true, isActive: targetAdmin.isActive });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi thao tác trạng thái" });
        }
    }
}