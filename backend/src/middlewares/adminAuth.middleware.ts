import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyAdminToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập quản trị (Thiếu Token)!" });
    }

    try {
        const secret = process.env.JWT_ADMIN_ACCESS_SECRET as string || 'admin_access_key';

        // Giải mã token của Admin
        const decoded = jwt.verify(token, secret) as any;

        // Bắt buộc phải có adminId và role
        if (!decoded.adminId || !decoded.role) {
            return res.status(403).json({ message: "Token quản trị không hợp lệ!" });
        }

        // Gắn thông tin admin vào request để các Controller sau có thể sử dụng
        (req as any).admin = decoded;

        next();
    } catch (err) {
        console.error("VERIFY ADMIN TOKEN ERROR:", err);
        return res.status(401).json({ message: "Phiên đăng nhập quản trị hết hạn!" });
    }
};

// Middleware kiểm tra quyền Tối cao (Chỉ Admin mới được dùng)
export const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin;
    
    if (admin && admin.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
    }
};