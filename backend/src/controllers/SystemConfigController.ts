import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Banner } from "../models/Banner";
import { WebsiteConfig } from "../models/WebsiteConfig";
import { AdminLog } from "../models/AdminLog";
import fs from "fs";
import path from "path";

export class SystemConfigController {
    
    // Helper để ghi log
    private static async saveLog(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({ admin: { adminId }, action }));
    }

    // ================= WEBSITE CONFIG =================

    static async getWebsiteConfig(req: Request, res: Response) {
        try {
            const configRepo = AppDataSource.getRepository(WebsiteConfig);
            const config = await configRepo.findOne({ where: {} }); // Lấy bản ghi đầu tiên
            return res.json(config || {});
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy cấu hình" });
        }
    }

    static async updateWebsiteConfig(req: Request, res: Response) {
        try {
            const { siteName, email, phone, address } = req.body;
            const adminId = (req as any).admin.adminId;
            const configRepo = AppDataSource.getRepository(WebsiteConfig);

            let config = await configRepo.findOne({ where: {} });
            const isCreate = !config;

            if (isCreate) {
                config = configRepo.create({ siteName, email, phone, address });
            } else {
                config!.siteName = siteName;
                config!.email = email;
                config!.phone = phone;
                config!.address = address;
            }

            await configRepo.save(config!);
            await SystemConfigController.saveLog(adminId, `${isCreate ? 'Thêm mới' : 'Cập nhật'} thông tin website: ${siteName}`);

            return res.json({ message: "Lưu thông tin website thành công", config });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật website" });
        }
    }

    // ================= BANNER MANAGEMENT =================

    static async getBanners(req: Request, res: Response) {
        try {
            const bannerRepo = AppDataSource.getRepository(Banner);
            const banners = await bannerRepo.find();
            return res.json(banners);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy danh sách banner" });
        }
    }

    static async addBanner(req: Request, res: Response) {
        try {
            const { link } = req.body;
            const adminId = (req as any).admin.adminId;
            if (!req.file) return res.status(400).json({ message: "Vui lòng upload ảnh banner" });

            const bannerRepo = AppDataSource.getRepository(Banner);
            const banner = bannerRepo.create({
                imageUrl: `uploads/banners/${req.file.filename}`,
                link,
                isActive: true
            });

            await bannerRepo.save(banner);
            await SystemConfigController.saveLog(adminId, `Thêm mới banner: ${banner.imageUrl}`);

            return res.status(201).json({ message: "Thêm banner thành công", banner });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi thêm banner" });
        }
    }

    static async deleteBanner(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminId = (req as any).admin.adminId;
            const bannerRepo = AppDataSource.getRepository(Banner);

            const banner = await bannerRepo.findOneBy({ bannerId: Number(id) });
            if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

            // Xóa file vật lý
            const filePath = path.join(process.cwd(), banner.imageUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            await bannerRepo.remove(banner);
            await SystemConfigController.saveLog(adminId, `Xóa banner ID: ${id}`);

            return res.json({ message: "Xóa banner thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi xóa banner" });
        }
    }

    static async toggleBannerStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminId = (req as any).admin.adminId;
            const bannerRepo = AppDataSource.getRepository(Banner);

            const banner = await bannerRepo.findOneBy({ bannerId: Number(id) });
            if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

            banner.isActive = !banner.isActive;
            await bannerRepo.save(banner);
            await SystemConfigController.saveLog(adminId, `${banner.isActive ? 'Bật' : 'Tắt'} banner ID: ${id}`);

            return res.json({ message: "Cập nhật trạng thái thành công", isActive: banner.isActive });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
        }
    }
}