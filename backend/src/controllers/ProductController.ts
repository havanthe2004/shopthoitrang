import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

export class ProductController {

    // ================================
    // GET ALL PRODUCTS (CÓ PHÂN TRANG)
    // ================================
    static async getAll(req: Request, res: Response) {
        try {
            const {
                category: slug,
                sort,
                minPrice,
                maxPrice,
                keyword
            } = req.query;

            // =========================
            // Pagination
            // =========================
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

            // =========================
            // 1. SEARCH 🔥
            // =========================
            if (keyword) {
                query.andWhere(
                    `(LOWER(product.name) LIKE LOWER(:keyword)
                    OR LOWER(product.description) LIKE LOWER(:keyword)
                    OR LOWER(color.color) LIKE LOWER(:keyword))`,
                    { keyword: `%${keyword}%` }
                );
            }

            // =========================
            // 2. FILTER CATEGORY
            // =========================
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

            // 3. FILTER PRICE
            if (minPrice) {
                query.andWhere("variant.price >= :min", { min: Number(minPrice) });
            }

            if (maxPrice) {
                query.andWhere("variant.price <= :max", { max: Number(maxPrice) });
            }

            // =========================
            // 4. SORT
            // =========================
            if (sort === 'price-asc') {
                query.orderBy("variant.price", "ASC");
            } else if (sort === 'price-desc') {
                query.orderBy("variant.price", "DESC");
            } else {
                query.orderBy("product.productId", "DESC");
            }

            query.addOrderBy("image.productImageId", "ASC");
            // =========================
            // 5. FIX DUPLICATE
            // =========================
            query.distinct(true);

            // =========================
            // 6. PAGINATION
            // =========================
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

    // ================================
    // GET PRODUCT DETAIL
    // ================================
    // static async getBySlug(req: Request, res: Response) {
    //     try {
    //         const productRepo = AppDataSource.getRepository(Product);
    //         const slugParam = req.params.slug;

    //         if (Array.isArray(slugParam)) {
    //             return res.status(400).json({ message: "Slug không hợp lệ" });
    //         }

    //         const product = await productRepo.findOne({
    //             where: {
    //                 slug: slugParam,
    //                 isActive: true
    //             },
    //             relations: [
    //                 'category',
    //                 'variants',
    //                 'variants.color',
    //                 'colors',
    //                 'colors.images'
    //             ]
    //         });

    //         if (!product) {
    //             return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    //         }

    //         return res.json(product);

    //     } catch (err) {
    //         console.error(err);
    //         return res.status(500).json({ message: "Lỗi hệ thống" });
    //     }
    // }

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
                .leftJoinAndSelect("category.parent", "parentCategory") // 👈 thêm
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

            // 3. Kiểm tra và thêm điều kiện tìm kiếm
            if (keyword) {
                query.andWhere(
                    `(LOWER(product.name) LIKE LOWER(:keyword) 
                    OR LOWER(product.description) LIKE LOWER(:keyword) 
                    OR LOWER(color.color) LIKE LOWER(:keyword))`,
                    { keyword: `%${keyword}%` }
                );
            }
            // 4. Giới hạn số lượng trả về (thường gợi ý chỉ cần 5-10 kết quả)
            const limit = Number(req.query.limit) || 10;
            query.take(limit);

            // 5. Tránh lặp sản phẩm nếu một sản phẩm có nhiều màu/ảnh
            query.distinct(true);

            // 6. Thực thi truy vấn
            const products = await query.getMany();

            // 7. Trả dữ liệu về Frontend
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
}