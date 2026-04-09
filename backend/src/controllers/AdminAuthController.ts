import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { Admin } from '../models/Admin';
import { AdminRefreshToken } from '../models/AdminRefreshToken';

export class AdminAuthController {

    // ================= LOGIN =================
    static async adminLogin(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Missing fields' });
            }

            const adminRepo = AppDataSource.getRepository(Admin);
            const refreshRepo = AppDataSource.getRepository(AdminRefreshToken);

            const admin = await adminRepo.findOne({ where: { username } });
            if (!admin || !admin.isActive) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // ===========================================
            // TẠO ACCESS TOKEN (Dùng SECRET riêng của Admin)
            // ===========================================
            const accessToken = jwt.sign(
                { adminId: admin.adminId, role: admin.role }, // Lưu adminId và role
                process.env.JWT_ADMIN_ACCESS_SECRET as string,
                { expiresIn: process.env.JWT_ACCESS_EXPIRE as any } // Thời gian sống tùy bạn cấu hình (VD: 15 phút)
            );

            // ===========================================
            // TẠO REFRESH TOKEN (Dùng SECRET riêng của Admin)
            // ===========================================
            const refreshToken = jwt.sign(
                { adminId: admin.adminId },
                process.env.JWT_ADMIN_REFRESH_SECRET as string,
                { expiresIn: process.env.JWT_REFRESH_EXPIRE as any }
            );

            // Lưu Refresh Token vào Database (Bảng admin_refresh_tokens)
            const refreshEntity = refreshRepo.create({
                token: refreshToken,
                expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Sống 7 ngày
                admin, // Khác với Client là user, ở đây map vào quan hệ admin
            });

            await refreshRepo.save(refreshEntity);

            return res.json({
                message: 'Login successfully',
                accessToken,
                refreshToken,
                adminInfo: {
                    adminId: admin.adminId,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    avatar: admin.avatar,
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Login failed' });
        }
    }

    // ================= REFRESH TOKEN =================
    static async refreshAdminToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(401).json({ message: "Refresh Token missing" });

            const refreshRepo = AppDataSource.getRepository(AdminRefreshToken);

            // 1. Tìm token trong DB
            const savedToken = await refreshRepo.findOne({
                where: { token: refreshToken },
                relations: ['admin'] // Lấy kèm thông tin admin để lấy role
            });

            if (!savedToken || savedToken.expiredAt < new Date()) {
                return res.status(403).json({ message: "Refresh Token invalid or expired" });
            }

            // 2. Xác thực JWT Refresh Token
            const decoded = jwt.verify(refreshToken, process.env.JWT_ADMIN_REFRESH_SECRET as string) as any;

            // 3. Tạo Access Token mới
            const newAccessToken = jwt.sign(
                { adminId: decoded.adminId, role: savedToken.admin.role }, // Cấp lại kèm role
                process.env.JWT_ADMIN_ACCESS_SECRET as string,
                { expiresIn: '15m' }
            );

            return res.json({ accessToken: newAccessToken });
        } catch (err) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }
    }

    // ================= LOGOUT =================
    static async adminLogout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token missing' });
            }

            const refreshRepo = AppDataSource.getRepository(AdminRefreshToken);

            // Xóa Refresh Token của Admin khỏi DB
            await refreshRepo.delete({ token: refreshToken });

            return res.json({ message: 'Logout successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Logout failed' });
        }
    }
}