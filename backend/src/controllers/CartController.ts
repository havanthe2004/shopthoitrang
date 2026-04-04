import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { ProductVariant } from "../models/ProductVariant";

export class CartController {
    /**
     * 1. THÊM SẢN PHẨM VÀO GIỎ HÀNG
     * Logic: Tìm Cart -> Tìm Variant -> Cập nhật hoặc Thêm mới CartItem
     */
    static async addToCart(req: Request, res: Response) {
        try {
            const { variantId, quantity } = req.body;
            const userId = (req as any).user.id;

            const cartRepo = AppDataSource.getRepository(Cart);
            const cartItemRepo = AppDataSource.getRepository(CartItem);
            const variantRepo = AppDataSource.getRepository(ProductVariant);

            // Bước A: Tìm Cart của User, nếu chưa có thì tạo mới
            let cart = await cartRepo.findOne({ where: { user: { userId: userId } } });
            if (!cart) {
                cart = cartRepo.create({ user: { userId: userId } });
                await cartRepo.save(cart);
            }

            // Bước B: Kiểm tra biến thể có tồn tại không
            const variant = await variantRepo.findOneBy({ productVariantId: variantId });
            if (!variant) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

            // Bước C: Kiểm tra sản phẩm đã có trong giỏ (CartItem) chưa
            let item = await cartItemRepo.findOne({
                where: { cart: { cartId: cart.cartId }, variant: { productVariantId: variantId } }
            });

            if (item) {
                // Nếu có rồi thì cộng dồn số lượng
                item.quantity += quantity;
            } else {
                // Nếu chưa có thì tạo mới dòng CartItem
                item = cartItemRepo.create({
                    cart: cart,
                    variant: variant,
                    quantity: quantity
                });
            }

            await cartItemRepo.save(item);
            return res.status(200).json({ message: "Đã thêm vào giỏ hàng", cartItemId: item.cartItemId });
        } catch (error) {
            console.error("Error in addToCart:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi thêm vào giỏ" });
        }
    }

    /**
     * 2. LẤY DANH SÁCH GIỎ HÀNG
     * Trả về dữ liệu format đúng chuẩn Frontend (CartItem interface)
     */
    static async getCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const cartRepo = AppDataSource.getRepository(Cart);

            // Lấy Cart kèm theo mảng Items và các thông tin liên quan (Variant, Product)
            const cart = await cartRepo.findOne({
                where: { user: { userId: userId } },
                relations: [
                    "items",
                    "items.variant",
                    "items.variant.product"
                ]
            });

            if (!cart || !cart.items) return res.json([]);

            // Chuyển đổi (Format) dữ liệu để khớp với Frontend
            const formattedItems = cart.items.map(item => ({
                // id: item.variant.product.id,
                productVariantId: item.variant.productVariantId,
                name: item.variant.product.name,
                price: item.variant.price,
                image: item.variant.images,
                color: item.variant.color,
                size: item.variant.size,
                quantity: item.quantity
            }));

            return res.json(formattedItems);
        } catch (error) {
            console.error("Error in getCart:", error);
            return res.status(500).json({ message: "Lỗi khi lấy dữ liệu giỏ hàng" });
        }
    }

    /**
     * 3. CẬP NHẬT SỐ LƯỢNG TRỰC TIẾP
     * Dùng khi khách nhấn +/- trong trang Giỏ hàng
     */
    static async updateQuantity(req: Request, res: Response) {
        try {
            const { variantId, quantity } = req.body;
            const userId = (req as any).user.id;

            if (quantity < 1) return res.status(400).json({ message: "Số lượng không hợp lệ" });

            const cartItemRepo = AppDataSource.getRepository(CartItem);

            // Tìm Item dựa trên userId (thông qua Cart) và variantId
            const item = await cartItemRepo.findOne({
                where: {
                    cart: { user: { userId: userId } },
                    variant: { productVariantId: variantId }
                }
            });

            if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });

            item.quantity = quantity;
            await cartItemRepo.save(item);

            return res.json({ message: "Cập nhật số lượng thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi cập nhật số lượng" });
        }
    }

    /**
     * 4. XÓA SẢN PHẨM KHỎI GIỎ
     */
    static async removeFromCart(req: Request, res: Response) {
        try {
            const variantId = parseInt(req.params.variantId as string);
            const userId = (req as any).user.id;

            const cartItemRepo = AppDataSource.getRepository(CartItem);

            const item = await cartItemRepo.findOne({
                where: {
                    cart: { user: { userId: userId } },
                    variant: { productVariantId: variantId }
                }
            });

            if (!item) return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });

            await cartItemRepo.remove(item);
            return res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
        }
    }
}