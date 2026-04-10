import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

import { Otp } from '../models/Otp';
import { sendOtpEmail } from '../utils/mailer';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { email, password, phone, name } = req.body;

            if (!email || !phone || !password || !name) {
                return res.status(400).json({ message: 'Missing fields' });
            }

            const userRepo = AppDataSource.getRepository(User);

            const existingUser = await userRepo.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = userRepo.create({
                email,
                password: hashedPassword,
                phone,
                name,
            });

            await userRepo.save(user);

            return res.status(201).json({
                message: 'Register successfully',
                user: {
                    id: user.userId,
                    email: user.email,
                    name: user.name,
                    phone: user.phone
                },
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Register failed' });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Missing fields' });
            }

            const userRepo = AppDataSource.getRepository(User);
            const refreshRepo = AppDataSource.getRepository(RefreshToken);

            const user = await userRepo.findOne({ where: { email } });
            if (!user || !user.isActive) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // access token
            const accessToken = jwt.sign(
                { id: user.userId, email: user.email },
                process.env.JWT_ACCESS_SECRET as string,
                { expiresIn: process.env.JWT_ACCESS_EXPIRE as any }
            );

            // refresh token
            const refreshToken = jwt.sign(
                { id: user.userId },
                process.env.JWT_REFRESH_SECRET as string,
                { expiresIn: process.env.JWT_REFRESH_EXPIRE as any }
            );

            const refreshEntity = refreshRepo.create({
                token: refreshToken,
                expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                user,
            });

            await refreshRepo.save(refreshEntity);

            return res.json({
                message: 'Login successfully',
                accessToken,
                refreshToken,
                user: {
                    id: user.userId,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Login failed' });
        }
    }


    static async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(401).json({ message: "Refresh Token missing" });

            const refreshRepo = AppDataSource.getRepository(RefreshToken);
            const userRepo = AppDataSource.getRepository(User);

            // 1. Tìm token trong DB
            const savedToken = await refreshRepo.findOne({
                where: { token: refreshToken },
                relations: ['user']
            });

            if (!savedToken || savedToken.expiredAt < new Date()) {
                return res.status(403).json({ message: "Refresh Token invalid or expired" });
            }

            // 2. Xác thực JWT Refresh Token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;

            // 3. Tạo Access Token mới
            const newAccessToken = jwt.sign(
                { id: decoded.id, email: savedToken.user.email },
                process.env.JWT_ACCESS_SECRET as string,
                { expiresIn: '15m' }
            );

            return res.json({ accessToken: newAccessToken });
        } catch (err) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token missing' });
            }

            const refreshRepo = AppDataSource.getRepository(RefreshToken);

            await refreshRepo.delete({ token: refreshToken });

            return res.json({ message: 'Logout successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Logout failed' });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const userRepo = AppDataSource.getRepository(User);
            const otpRepo = AppDataSource.getRepository(Otp);

            const user = await userRepo.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            await otpRepo.save(
                otpRepo.create({
                    email,
                    code: otpCode,
                    expiredAt: new Date(Date.now() + 5 * 60 * 1000)
                })
            );

            try {
                await sendOtpEmail(email, otpCode);
            } catch (mailErr) {
                console.error("MAIL ERROR:", mailErr);
                return res.status(500).json({ message: "Gửi email thất bại", error: mailErr });
            }

            return res.json({ message: 'Mã OTP đã được gửi' });

        } catch (err) {
            console.error("FORGOT PASSWORD ERROR:", err);
            return res.status(500).json({ message: 'Lỗi yêu cầu OTP', error: err });
        }
    }


    static async resetPassword(req: Request, res: Response) {
        try {
            const { email, otpCode, newPassword } = req.body;

            if (!email || !otpCode || !newPassword) {
                return res.status(400).json({ message: 'Thiếu dữ liệu' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    message: 'Mật khẩu phải có ít nhất 8 ký tự',
                });
            }

            const userRepo = AppDataSource.getRepository(User);
            const otpRepo = AppDataSource.getRepository(Otp);

            const otpRecord = await otpRepo.findOne({
                where: { email, isUsed: false },
                order: { createdAt: 'DESC' },
            });

            if (!otpRecord) {
                return res.status(400).json({ message: 'OTP không tồn tại' });
            }

            if (otpRecord.expiredAt < new Date()) {
                return res.status(400).json({ message: 'OTP đã hết hạn' });
            }

            if (otpRecord.failedAttempts >= 5) {
                otpRecord.isUsed = true;
                await otpRepo.save(otpRecord);
                return res.status(400).json({
                    message: 'OTP đã bị khóa do nhập sai quá nhiều lần',
                });
            }


            if (otpCode != otpRecord.code) {
                otpRecord.failedAttempts += 1;
                await otpRepo.save(otpRecord);

                return res.status(400).json({
                    message: `OTP không đúng. Còn ${5 - otpRecord.failedAttempts} lần thử`,
                });
            }

            const user = await userRepo.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await userRepo.save(user);

            otpRecord.isUsed = true;
            await otpRepo.save(otpRecord);

            return res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Lỗi đặt lại mật khẩu' });
        }
    }
}
