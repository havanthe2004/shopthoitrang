import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Banner } from "../models/Banner";

export class BannerController {
    static async getActiveBanners(req: Request, res: Response) {
        try {
            const bannerRepo = AppDataSource.getRepository(Banner);
            const banners = await bannerRepo.find({
                where: { isActive: true }
            });
            return res.json(banners);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi lấy banner" });
        }
    }
}