import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Category } from "../models/Category";
import { AdminLog } from "../models/AdminLog";
import { createSlug } from "../utils/slugify";
import { Like, IsNull } from "typeorm";

export class AdminCategoryController {


    private static async logAction(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({ admin: { adminId }, action }));
    }

    static getAllCategories = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || "";
            const isTrash = req.query.isTrash === 'true'; 

            const categoryRepo = AppDataSource.getRepository(Category);

            const queryBuilder = categoryRepo.createQueryBuilder("category")
                .leftJoinAndSelect("category.parent", "parent")
                .where("category.isActive = :isActive", { isActive: !isTrash });

            if (search) {
                queryBuilder.andWhere("category.name LIKE :search", { search: `%${search}%` });
            }

          
            queryBuilder.orderBy("category.sortOrder", "ASC")
                .addOrderBy("category.categoryId", "DESC")
                .skip((page - 1) * limit)
                .take(limit);

            const [items, total] = await queryBuilder.getManyAndCount();

            return res.status(200).json({
                success: true,
                data: {
                    items,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error("Get Categories Error:", error);
            return res.status(500).json({ message: "Lỗi lấy danh sách danh mục" });
        }
    };

    
    static getLevel1Categories = async (req: Request, res: Response) => {
        try {
            const categoryRepo = AppDataSource.getRepository(Category);
           
            const categories = await categoryRepo.find({
                where: { parent: IsNull(), isActive: true },
                order: { sortOrder: "ASC", name: "ASC" }
            });
            return res.status(200).json({ success: true, data: categories });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    };

    static getLevel2Categories = async (req: Request, res: Response) => {
        try {
            const categoryRepo = AppDataSource.getRepository(Category);

            const categories = await categoryRepo.createQueryBuilder("category")
                .leftJoinAndSelect("category.parent", "parent")
                .where("category.parentId IS NOT NULL")
                .andWhere("category.isActive = :isActive", { isActive: true })
                .orderBy("category.name", "ASC")
                .getMany();

            return res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy danh mục cấp 2" });
        }
    };

  
    static createCategory = async (req: Request, res: Response) => {
        try {
            const { name, description, image, parentId, sortOrder } = req.body;

            const adminId = (req as any).admin.adminId;

            if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc" });

            const categoryRepo = AppDataSource.getRepository(Category);

       
            let slug = createSlug(name);
            let slugExists = await categoryRepo.findOne({ where: { slug } });
            if (slugExists) {
                slug = `${slug}-${Date.now().toString().slice(-4)}`; 
            }

            const newCategory = categoryRepo.create({
                name, slug, description, image, sortOrder: sortOrder || 0
            });

           
            if (parentId) {
                const parentCat = await categoryRepo.findOne({ where: { categoryId: parentId }, relations: ["parent"] });
                if (!parentCat) return res.status(404).json({ message: "Danh mục cha không tồn tại" });

              
                if (parentCat.parent) {
                    return res.status(400).json({ message: "Không thể chọn danh mục cấp 2 làm danh mục cha (Chỉ hỗ trợ tối đa 2 cấp)" });
                }
                newCategory.parent = parentCat;
            }

            await categoryRepo.save(newCategory);

           
            await this.logAction(adminId, `Thêm mới danh mục: ${name}`);

            return res.status(201).json({ success: true, message: "Thêm danh mục thành công" });
        } catch (error) {
            console.error("Create Category Error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi thêm danh mục" });
        }
    };

  
    static updateCategory = async (req: Request, res: Response) => {
        try {
            const categoryId = parseInt(req.params.id as string);
            const { name, description, image, parentId, sortOrder } = req.body;
            const adminId = (req as any).admin.adminId;

            const categoryRepo = AppDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({ where: { categoryId } });
            if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

           
            if (name && name !== category.name) {
                category.name = name;
                category.slug = createSlug(name);
               
                let slugExists = await categoryRepo.findOne({ where: { slug: category.slug } });
                if (slugExists && slugExists.categoryId !== categoryId) {
                    category.slug = `${category.slug}-${Date.now().toString().slice(-4)}`;
                }
            }

            category.description = description !== undefined ? description : category.description;
            category.image = image !== undefined ? image : category.image;
            category.sortOrder = sortOrder !== undefined ? sortOrder : category.sortOrder;

          
            if (parentId !== undefined) {
                if (parentId === null || parentId === "") {
                    category.parent = null; 
                } else {
                    if (Number(parentId) === categoryId) return res.status(400).json({ message: "Không thể chọn chính nó làm cha" });

                    const parentCat = await categoryRepo.findOne({ where: { categoryId: Number(parentId) }, relations: ["parent"] });
                    if (!parentCat) return res.status(404).json({ message: "Danh mục cha không tồn tại" });
                    if (parentCat.parent) return res.status(400).json({ message: "Chỉ hỗ trợ danh mục tối đa 2 cấp" });

                    category.parent = parentCat;
                }
            }

            await categoryRepo.save(category);
            await this.logAction(adminId, `Cập nhật danh mục ID: ${categoryId}`);

            return res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật danh mục" });
        }
    };

    
    static softDeleteCategory = async (req: Request, res: Response) => {
        try {
            const categoryId = parseInt(req.params.id as string);
            const adminId = (req as any).admin.adminId;

            const categoryRepo = AppDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({ where: { categoryId } });

            if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

            category.isActive = false;
            await categoryRepo.save(category);

            await this.logAction(adminId, `Dừng bán danh mục ID: ${categoryId}`);

            return res.status(200).json({ success: true, message: "Đã đưa danh mục vào thùng rác" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi xóa danh mục" });
        }
    };

   
    static restoreCategory = async (req: Request, res: Response) => {
        try {
            const categoryId = parseInt(req.params.id as string);
            const adminId = (req as any).admin.adminId;

            const categoryRepo = AppDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({ where: { categoryId } });

            if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

            category.isActive = true; 
            await categoryRepo.save(category);

            await this.logAction(adminId, `Khôi phục danh mục ID: ${categoryId}`);

            return res.status(200).json({ success: true, message: "Đã khôi phục danh mục thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi khôi phục danh mục" });
        }
    };
}