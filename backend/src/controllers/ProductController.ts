import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

export class ProductController {

    static async getAll(req: Request, res: Response) {
        try {
            const {
                category: slug,
                sort,
                minPrice,
                maxPrice,
                keyword
            } = req.query;           
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const productRepo = AppDataSource.getRepository(Product);
            const categoryRepo = AppDataSource.getRepository(Category);

            const query = productRepo.createQueryBuilder("product")
                .leftJoinAndSelect("product.category", "category")
                .leftJoinAndSelect("product.variants", "variant")
                .leftJoinAndSelect("variant.color", "variantColor")
                .leftJoinAndSelect("product.colors", "color")
                .leftJoinAndSelect("color.images", "image")
                .where("product.isActive = :isActive", { isActive: true })
                .andWhere("variant.isActive = :variantActive", { variantActive: true });;        
            if (keyword) {
                query.andWhere(
                    `(LOWER(product.name) LIKE LOWER(:keyword)
                    OR LOWER(product.description) LIKE LOWER(:keyword)
                    OR LOWER(color.color) LIKE LOWER(:keyword))`,
                    { keyword: `%${keyword}%` }
                );
            }      
            if (slug) {
                const foundCat = await categoryRepo.findOne({
                    where: { slug: slug as string },
                    relations: ['children', 'parent']
                });

                if (foundCat) {
                    if (!foundCat.parent && foundCat.children?.length > 0) {
                        const childIds = foundCat.children.map(c => c.categoryId);
                        const allIds = [...childIds, foundCat.categoryId];

                        query.andWhere("category.categoryId IN (:...ids)", { ids: allIds });
                    } else {
                        query.andWhere("category.slug = :slug", { slug });
                    }
                }
            }

            if (minPrice) {
                query.andWhere("variant.price >= :min", { min: Number(minPrice) });
            }

            if (maxPrice) {
                query.andWhere("variant.price <= :max", { max: Number(maxPrice) });
            }

          
            if (sort === 'price-asc') {
                query.orderBy("variant.price", "ASC");
            } else if (sort === 'price-desc') {
                query.orderBy("variant.price", "DESC");
            } else {
                query.orderBy("product.productId", "DESC");
            }

            query.addOrderBy("image.productImageId", "ASC");
         
            query.distinct(true);

       
            query.skip(skip).take(limit);

            const [products, total] = await query.getManyAndCount();

            return res.json({
                data: products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi Server" });
        }
    }


    static async getBySlug(req: Request, res: Response) {
        try {
            const productRepo = AppDataSource.getRepository(Product);
            const slugParam = req.params.slug;

            if (Array.isArray(slugParam)) {
                return res.status(400).json({ message: "Slug không hợp lệ" });
            }

            const product = await productRepo
                .createQueryBuilder("product")
                .leftJoinAndSelect("product.category", "category")
                .leftJoinAndSelect("category.parent", "parentCategory") 
                .leftJoinAndSelect("product.variants", "variant")
                .leftJoinAndSelect("variant.color", "variantColor")
                .leftJoinAndSelect("product.colors", "color")
                .leftJoinAndSelect("color.images", "image")
                .where("product.slug = :slug", { slug: slugParam })
                .andWhere("product.isActive = :isActive", { isActive: true })
                .andWhere("category.isActive = :categoryActive", { categoryActive: true })
                .andWhere(`(parentCategory.categoryId IS NULL OR parentCategory.isActive = true)`)
                .andWhere("variant.isActive = true")
                .getOne();

            if (!product) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại hoặc đã ngừng bán" });
            }

            return res.json(product);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    static async search(req: Request, res: Response) {
        try {
            const productRepo = AppDataSource.getRepository(Product);
            const keyword = req.query.keyword;

            const query = productRepo.createQueryBuilder("product")
                .leftJoinAndSelect("product.category", "category")
                .leftJoinAndSelect("category.parent", "parentCategory")
                .leftJoinAndSelect("product.variants", "variant")
                .leftJoinAndSelect("product.colors", "color")
                .leftJoinAndSelect("color.images", "image") 
                .where("product.isActive = :isActive", { isActive: true })
                .andWhere("category.isActive = :categoryActive", { categoryActive: true })
                .andWhere(`(parentCategory.categoryId IS NULL OR parentCategory.isActive = true)`)
                .andWhere("variant.isActive = :variantActive", { variantActive: true });

            if (keyword) {
                query.andWhere(
                    `(LOWER(product.name) LIKE LOWER(:keyword) 
                    OR LOWER(product.description) LIKE LOWER(:keyword) 
                    OR LOWER(color.color) LIKE LOWER(:keyword))`,
                    { keyword: `%${keyword}%` }
                );
            }
            const limit = Number(req.query.limit) || 10;
            query.take(limit);

            query.distinct(true);

            const products = await query.getMany();

            return res.status(200).json({
                success: true,
                data: products
            });

        } catch (err) {
            console.error("Search Error:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tìm kiếm"
            });
        }
    }

    static async getBestSellers(req: Request, res: Response) {
    try {
        const products = await AppDataSource.getRepository(Product).find({
            where: { isActive: true },
            relations: ["colors", "colors.images", "variants"],
            order: { sold: "DESC" }, // Lấy theo số lượng đã bán
            take: 10 // Lấy top 10 bản ghi
        });
        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi Server" });
    }
}
}