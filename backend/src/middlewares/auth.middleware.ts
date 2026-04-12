import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập (Thiếu Token)!" });
    }

    try {
        const secret = process.env.JWT_ACCESS_SECRET as string;

        if (!secret) {
            console.error("JWT_ACCESS_SECRET chưa được cấu hình!");
            return res.status(500).json({ message: "Server config lỗi JWT" });
        }

        const decoded = jwt.verify(token, secret) as any;
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { userId: decoded.id },
            select: ["userId", "isActive"] // Chỉ lấy các trường cần thiết để tối ưu tốc độ
        });

        if (!user) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }

        if (!user.isActive) {
            // Nếu bị khóa, trả về 403 Forbidden
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
                isBlocked: true
            });
        }


        (req as any).user = decoded;

        next();
    } catch (err) {
        console.error("VERIFY TOKEN ERROR:", err);
        return res.status(401).json({ message: "Phiên đăng nhập hết hạn hoặc Token sai!" });
    }
};