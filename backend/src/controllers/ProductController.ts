import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

export class ProductController {
    static async getAll(req: Request, res: Response) {
        try {
            const slug = req.query.category as string;
            const { sort, minPrice, maxPrice } = req.query;

            const productRepo = AppDataSource.getRepository(Product);
            const categoryRepo = AppDataSource.getRepository(Category);

            const query = productRepo.createQueryBuilder("product")
                .leftJoinAndSelect("product.category", "category")
                .leftJoinAndSelect("product.variants", "variant")
                .leftJoinAndSelect("variant.images", "image")
                .where("product.isActive = :isActive", { isActive: true });

            // 1. Lọc theo Danh mục
            if (slug) {
                const foundCat = await categoryRepo.findOne({
                    where: { slug: slug }, // Giờ đây slug chắc chắn là string
                    relations: ['children', 'parent']
                });

                if (foundCat) {
                    if (!foundCat.parent && foundCat.children && foundCat.children.length > 0) {
                        const childIds = foundCat.children.map(c => c.categoryId);
                        const allRelevantIds = [...childIds, foundCat.categoryId];

                        query.andWhere("category.categoryId IN (:...ids)", { ids: allRelevantIds });
                    } else {
                        query.andWhere("category.slug = :slug", { slug });
                    }
                }
            }

            // 2. Lọc theo Giá
            if (minPrice) query.andWhere("variant.price >= :min", { min: Number(minPrice) });
            if (maxPrice) query.andWhere("variant.price <= :max", { max: Number(maxPrice) });

            // 3. Sắp xếp
            if (sort === 'price-asc') {
                query.orderBy("variant.price", "ASC");
            } else if (sort === 'price-desc') {
                query.orderBy("variant.price", "DESC");
            } else {
                query.orderBy("product.productId", "DESC");
            }

            const products = await query.getMany();
            return res.json(products);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi Server" });
        }
    }

    static async getBySlug(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const productRepo = AppDataSource.getRepository(Product);

            const product = await productRepo.findOne({
                where: {
                    slug: slug,
                    isActive: true
                },
                relations: [
                    'category',
                    'variants',
                    'variants.images'
                ]
            });

            if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

            return res.json(product);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}