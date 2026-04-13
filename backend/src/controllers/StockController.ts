import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { ProductVariant } from "../models/ProductVariant";

import { AdminLog } from "../models/AdminLog";

export class StockController {

    private static async saveLog(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({ admin: { adminId }, action }));
    }

    // 1. Lấy danh sách tồn kho 
    static async getStock(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const lowStockOnly = req.query.lowStock === "true"; // Chỉ lấy hàng sắp hết

            const variantRepo = AppDataSource.getRepository(ProductVariant);

            const query = variantRepo.createQueryBuilder("variant")
                .leftJoinAndSelect("variant.product", "product")
                .leftJoinAndSelect("variant.color", "color")
                .leftJoinAndSelect("color.images", "images")
                .select([
                    "variant.productVariantId",
                    "variant.size",
                    "variant.stock",
                    "variant.price",
                    "product.name",
                    "product.productId",
                    "color.productColorId",
                    "color.color",
                    "color.hexCode",
                    "images.productImageId",
                    "images.url",
                    "images.isThumbnail"
                ]);

            // Tìm kiếm theo tên sản phẩm
            if (search) {
                query.andWhere("product.name LIKE :search", { search: `%${search}%` });
            }

            // Lọc sản phẩm sắp hết hàng (< 10)
            if (lowStockOnly) {
                query.andWhere("variant.stock < 10");
            }

            const [items, total] = await query
                .orderBy("variant.stock", "ASC") // Ưu tiên hiện số lượng ít trước
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            return res.json({
                items,
                meta: {
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page
                }
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy dữ liệu tồn kho" });
        }
    }

    // 2. Cập nhật số lượng tồn kho
    static async updateStock(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { addStock } = req.body; // Giá trị nhập từ ô input (ví dụ: 10)
            const adminId = (req as any).admin.adminId;

            const variantRepo = AppDataSource.getRepository(ProductVariant);
            const variant = await variantRepo.findOne({
                where: { productVariantId: Number(id) },
                relations: ["product", "color"]
            });

            if (!variant) {
                return res.status(404).json({ message: "Không tìm thấy biến thể" });
            }

            // Kiểm tra nếu admin nhập số âm hoặc không phải số
            const incrementValue = parseInt(addStock);
            if (isNaN(incrementValue) || incrementValue <= 0) {
                return res.status(400).json({ message: "Số lượng nhập thêm phải lớn hơn 0" });
            }

            const oldStock = variant.stock;

            // 🔥 THỰC HIỆN CỘNG DỒN
            variant.stock = Number(oldStock) + incrementValue;

            await variantRepo.save(variant);

            // Ghi log chi tiết hành động nhập hàng
            await StockController.saveLog(
                adminId,
                `NHẬP HÀNG: SP ${variant.product.name} [Màu: ${variant.color.color}, Size: ${variant.size}]. Nhập thêm: +${incrementValue}. Tổng kho mới: ${variant.stock}`
            );

            return res.json({
                message: `Đã nhập thêm ${incrementValue} sản phẩm thành công`,
                updatedStock: variant.stock
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật kho" });
        }
    }
}