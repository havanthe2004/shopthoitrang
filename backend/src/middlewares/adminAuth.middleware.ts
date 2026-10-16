import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập quản trị (Thiếu Token)!" });
    }

    try {
        const secret = process.env.JWT_ADMIN_ACCESS_SECRET as string;
        if (!secret) {
            console.error("JWT_ADMIN_ACCESS_SECRET chưa được cấu hình!");
            return res.status(500).json({ message: "Server config lỗi JWT" });
        }

        const decoded = jwt.verify(token, secret) as any;


        if (!decoded || !decoded.adminId || !decoded.role) {
            return res.status(403).json({ message: "Token quản trị không hợp lệ!" });
        }

        const adminRepo = AppDataSource.getRepository(Admin);
        
        const admin = await adminRepo.findOne({
            where: { adminId: decoded.adminId },
            select: {
                adminId: true,
                isActive: true,
                role: true
            }
        });

        if (!admin) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }

       
        if (!admin.isActive) {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
                isBlocked: true
            });
        }


        (req as any).admin = admin;

        next();
    } catch (err) {
        console.error("VERIFY ADMIN TOKEN ERROR:", err);
        return res.status(401).json({ message: "Phiên đăng nhập quản trị hết hạn!" });
    }
};