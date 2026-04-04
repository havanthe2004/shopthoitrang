import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
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

        (req as any).user = decoded;

        next();
    } catch (err) {
        console.error("VERIFY TOKEN ERROR:", err);
        return res.status(401).json({ message: "Phiên đăng nhập hết hạn hoặc Token sai!" });
    }
};