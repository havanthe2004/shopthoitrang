import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";

export class PostController {
    private static postRepo = AppDataSource.getRepository(Post);

    // Lấy danh sách bài viết (chỉ lấy tiêu đề và ngày tạo để tối ưu)
    static async getPosts(req: Request, res: Response) {
        try {
            // 1. Lấy page và limit từ query string (ví dụ: /api/posts?page=1&limit=6)
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 6;

            // 2. Tính toán số lượng bài viết cần bỏ qua
            const skip = (page - 1) * limit;

            // 3. findAndCount trả về [danh_sách, tổng_số_lượng]
            const [items, total] = await PostController.postRepo.findAndCount({
                select: ["postId", "title", "createdAt", "image"], // Thêm image nếu có
                order: { createdAt: "DESC" },
                skip: skip, // Bỏ qua bao nhiêu bản ghi
                take: limit  // Lấy bao nhiêu bản ghi
            });

            // 4. Trả về cấu trúc dữ liệu kèm "meta" để FE làm phân trang
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
            console.error("Lỗi phân trang BE:", error);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    // Lấy chi tiết 1 bài viết
    static async getPostDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const post = await PostController.postRepo.findOneBy({ postId: Number(id) });
            if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
            return res.json(post);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    static async getLatestPosts(req: Request, res: Response) {
    try {
        const posts = await AppDataSource.getRepository(Post).find({
            select: ["postId", "title", "createdAt", "image"], 
            order: { createdAt: "DESC" },
            take: 3
        });
        return res.json(posts);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi Server" });
    }
}
}