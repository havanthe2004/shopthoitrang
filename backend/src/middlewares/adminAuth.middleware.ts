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

        // CẢI TIẾN 1: Kiểm tra decoded ngay lập tức trước khi truy vấn DB
        // Đảm bảo tên field khớp với lúc bạn sign token (ở đây tôi dùng adminId)
        if (!decoded || !decoded.adminId || !decoded.role) {
            return res.status(403).json({ message: "Token quản trị không hợp lệ!" });
        }

        const adminRepo = AppDataSource.getRepository(Admin);
        
        // CẢI TIẾN 2: Sử dụng đúng field adminId từ decoded
        const admin = await adminRepo.findOne({
            where: { adminId: decoded.adminId },
            select: {
                adminId: true,
                isActive: true,
                role: true // Nên lấy role từ DB để đảm bảo tính thời gian thực
            }
        });

        if (!admin) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }

        // CẢI TIẾN 3: Kiểm tra trạng thái hoạt động
        if (!admin.isActive) {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
                isBlocked: true
            });
        }

        // CẢI TIẾN 4: Gán admin lấy từ DB vào req thay vì chỉ lấy từ decoded (Token cũ có thể sai Role)
        (req as any).admin = admin;

        next();
    } catch (err) {
        console.error("VERIFY ADMIN TOKEN ERROR:", err);
        return res.status(401).json({ message: "Phiên đăng nhập quản trị hết hạn!" });
    }
};