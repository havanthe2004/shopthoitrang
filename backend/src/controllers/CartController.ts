import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { ProductVariant } from "../models/ProductVariant";

export class CartController {
    static async addToCart(req: Request, res: Response) {
        try {
            const { productVariantId, quantity } = req.body;
            const userId = (req as any).user.id;

            const cartRepo = AppDataSource.getRepository(Cart);
            const cartItemRepo = AppDataSource.getRepository(CartItem);
            const variantRepo = AppDataSource.getRepository(ProductVariant);

            let cart = await cartRepo.findOne({ where: { user: { userId: userId } } });
            if (!cart) {
                cart = cartRepo.create({ user: { userId: userId } });
                await cartRepo.save(cart);
            }

            const variant = await variantRepo.findOneBy({ productVariantId: productVariantId });
            if (!variant) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

            let item = await cartItemRepo.findOne({
                where: { cart: { cartId: cart.cartId }, variant: { productVariantId: productVariantId } }
            });

            if (item) {
                item.quantity += quantity;
            } else {
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

    static async getCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const cartItemRepo = AppDataSource.getRepository(CartItem);

            const [items, total] = await cartItemRepo.findAndCount({
                where: {
                    cart: { user: { userId } }
                },
                relations: [
                    "cart",
                    "variant",
                    "variant.product",
                    "variant.color",
                    "variant.color.images"
                ],
                skip,
                take: limit
            });

            const formatted = items.map(item => {
                const color = item.variant.color;
                const images = color?.images || [];

                return {
                    productVariantId: item.variant.productVariantId,
                    name: item.variant.product.name,
                    price: item.variant.price,

                    image: images[0]?.url || "",

                    color: color?.color || "",

                    size: item.variant.size,
                    quantity: item.quantity
                };
            });

            return res.json({
                data: formatted,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi lấy giỏ hàng" });
        }
    }

    static async updateQuantity(req: Request, res: Response) {
        try {
            const { variantId, quantity } = req.body;
            const userId = (req as any).user.id;

            if (quantity < 1) return res.status(400).json({ message: "Số lượng không hợp lệ" });

            const cartItemRepo = AppDataSource.getRepository(CartItem);

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