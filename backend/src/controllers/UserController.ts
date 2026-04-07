import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Address } from '../models/Address';

export class UserController {
    static async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const userRepo = AppDataSource.getRepository(User);

            const user = await userRepo.findOne({
                where: { userId: userId },
                relations: ['addresses']
            });

            if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

            const { password, ...userData } = user;
            return res.json(userData);
        } catch (err) {
            return res.status(500).json({ message: "Lỗi hệ thống", error: err });
        }
    }


    static async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { name, phone } = req.body;
            const userRepo = AppDataSource.getRepository(User);

            const user = await userRepo.findOneBy({ userId: userId });
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });


            if (name) user.name = name;
            if (phone) user.phone = phone;


            if (req.file) {
                if (user.avatar && fs.existsSync(path.join(__dirname, '../../', user.avatar))) {
                    fs.unlinkSync(path.join(__dirname, '../../', user.avatar));
                }
                user.avatar = `uploads/avatars/user/${req.file.filename}`;
            }

            await userRepo.save(user);
            const { password, ...updatedUser } = user;
            return res.json({ message: "Cập nhật hồ sơ thành công", user: updatedUser });
        } catch (err) {
            return res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "Xác nhận mật khẩu mới không khớp" });
            }

            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ userId: userId });

            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });


            user.password = await bcrypt.hash(newPassword, 10);
            await userRepo.save(user);

            return res.json({ message: "Thay đổi mật khẩu thành công" });
        } catch (err) {
            return res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
        }
    }


    static async getAddresses(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const addressRepo = AppDataSource.getRepository(Address);
            const addresses = await addressRepo.find({
                where: { user: { userId: userId } },
                order: { isDefault: 'DESC', addressId: 'ASC' }
            });
            return res.json(addresses);
        } catch (err) {
            return res.status(500).json({ message: "Lỗi lấy danh sách địa chỉ" });
        }
    }

    static async addAddress(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const addressData = req.body;
            const addressRepo = AppDataSource.getRepository(Address);


            const count = await addressRepo.count({ where: { user: { userId: userId } } });
            if (count === 0) addressData.isDefault = true;


            if (addressData.isDefault) {
                await addressRepo.update({ user: { userId: userId } }, { isDefault: false });
            }

            const newAddress = addressRepo.create({ ...addressData, user: { userId: userId } });
            await addressRepo.save(newAddress);

            return res.status(201).json(newAddress);
        } catch (err) {
            return res.status(500).json({ message: "Lỗi thêm địa chỉ" });
        }
    }


    static async updateAddress(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;
            const updateData = req.body;
            const addressRepo = AppDataSource.getRepository(Address);

            const address = await addressRepo.findOne({ where: { addressId: Number(id), user: { userId: userId } } });
            if (!address) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

            if (updateData.isDefault) {
                await addressRepo.update({ user: { userId: userId } }, { isDefault: false });
            }

            Object.assign(address, updateData);
            await addressRepo.save(address);

            return res.json(address);
        } catch (err) {
            return res.status(500).json({ message: "Lỗi cập nhật địa chỉ" });
        }
    }


    static async deleteAddress(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;
            const addressRepo = AppDataSource.getRepository(Address);

            const address = await addressRepo.findOne({ where: { addressId: Number(id), user: { userId: userId } } });
            if (!address) return res.status(404).json({ message: "Địa chỉ không tồn tại" });
            if (address.isDefault) return res.status(400).json({ message: "Không thể xóa địa chỉ mặc định" });

            await addressRepo.remove(address);
            return res.json({ message: "Đã xóa địa chỉ thành công" });
        } catch (err) {
            return res.status(500).json({ message: "Lỗi xóa địa chỉ" });
        }
    }

    static async setDefaultAddress(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;
            const addressRepo = AppDataSource.getRepository(Address);


            const targetAddress = await addressRepo.findOne({
                where: { addressId: Number(id), user: { userId: userId } }
            });

            if (!targetAddress) {
                return res.status(404).json({ message: "Không tìm thấy địa chỉ để thiết lập mặc định" });
            }


            await addressRepo.update(
                { user: { userId: userId } },
                { isDefault: false }
            );


            targetAddress.isDefault = true;
            await addressRepo.save(targetAddress);

            return res.json({
                message: "Đã thiết lập địa chỉ mặc định mới thành công",
                address: targetAddress
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi thiết lập địa chỉ mặc định" });
        }
    }
}