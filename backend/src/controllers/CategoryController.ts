import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Category } from '../models/Category';
import { IsNull } from 'typeorm';

export class CategoryController {
    static async getTree(req: Request, res: Response) {
        try {
            const categoryRepo = AppDataSource.getRepository(Category);
            const tree = await categoryRepo.find({
                where: { parent: IsNull(), isActive: true },
                relations: ['children'], // Lấy 1 cấp con
                order: { categoryId: 'ASC' }
            });
            return res.json(tree);
        } catch (err) {
            return res.status(500).json({ message: "Lỗi lấy cây danh mục" });
        }
    }
}