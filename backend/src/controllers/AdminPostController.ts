import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";
import { AdminLog } from "../models/AdminLog";
import fs from "fs";
import path from "path";
import { Like } from "typeorm";

export class PostController {
    private static postRepo = AppDataSource.getRepository(Post);

    private static async logAction(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({ admin: { adminId }, action }));
    }


    // Lấy danh sách bài viết (Admin)
static async getAllPosts(req: Request, res: Response) {
        try {
            // 1. Lấy các tham số từ Query String
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;
            const search = (req.query.search as string) || "";

            // 2. Tính toán vị trí bắt đầu bỏ qua (Offset)
            const skip = (page - 1) * limit;

            // 3. Truy vấn dữ liệu có lọc và phân trang
            // findAndCount trả về [danh_sách_items, tổng_số_lượng]
            const [items, total] = await PostController.postRepo.findAndCount({
                where: search ? [
                    { title: Like(`%${search}%`) }, // Tìm kiếm trong tiêu đề
                    { content: Like(`%${search}%`) } // Hoặc tìm trong nội dung
                ] : {},
                order: { createdAt: "DESC" },
                skip: skip,
                take: limit,
            });

            // 4. Trả về cấu trúc dữ liệu chuẩn mà FE đang mong đợi
            return res.json({
                items,
                meta: {
                    totalItems: total,
                    itemCount: items.length,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                },
            });
        } catch (error) {
            console.error("Error at getAllPosts:", error);
            return res.status(500).json({ message: "Lỗi lấy danh sách bài viết" });
        }
    }

    // Thêm bài viết mới
    static async createPost(req: Request, res: Response) {
        try {
            const { title, content } = req.body;
            const adminId = (req as any).admin.adminId;

            const image = req.file ? `uploads/posts/${req.file.filename}` : "";

            const newPost = PostController.postRepo.create({ title, content, image });
            await PostController.postRepo.save(newPost);
            await PostController.logAction(adminId, `Tạo bài viết mới :${newPost.title}`)
            return res.status(201).json({ message: "Thêm bài viết thành công", post: newPost });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi thêm bài viết" });
        }
    }

    // Cập nhật bài viết
    static async updatePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            const adminId = (req as any).admin.adminId;
            const post = await PostController.postRepo.findOneBy({ postId: Number(id) });

            if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });

            if (req.file) {
                if (post.image) {
                    const oldPath = path.join(process.cwd(), post.image);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                post.image = `uploads/posts/${req.file.filename}`;
            }
            post.title = title;
            post.content = content;
            await PostController.postRepo.save(post);
            await PostController.logAction(adminId, `Sửa bài viết :${title}`)
            return res.json({ message: "Cập nhật bài viết thành công", post });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật bài viết" });
        }
    }

    // Xóa bài viết
    static async deletePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminId = (req as any).admin.adminId;
            const post = await PostController.postRepo.findOneBy({ postId: Number(id) });

            if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
            if (post.image) {
                const filePath = path.join(process.cwd(), post.image);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            await PostController.postRepo.remove(post);
            await PostController.logAction(adminId, `Xoá bài viết có ID: ${id}`)
            return res.json({ message: "Xóa bài viết thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi xóa bài viết" });
        }
    }
}