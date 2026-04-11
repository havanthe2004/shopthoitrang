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

 
        const decoded = jwt.verify(token, secret) as any;


        if (!decoded.adminId || !decoded.role) {
            return res.status(403).json({ message: "Token quản trị không hợp lệ!" });
        }

        (req as any).admin = decoded;

        next();
    } catch (err) {
        console.error("VERIFY ADMIN TOKEN ERROR:", err);
        return res.status(401).json({ message: "Phiên đăng nhập quản trị hết hạn!" });
    }
};


export const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin;
    
    if (admin && admin.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
    }
};