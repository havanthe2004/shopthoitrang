import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
import { vnpayConfig } from "../config/vnpay.config";
import crypto from "crypto";
import qs from "qs";
import { format } from "date-fns";

export class OrderController {

    // ================================
    // HELPER: SORT PARAMS VNPAY
    // ================================
    private static sortObject(obj: any) {
        const sorted: any = {};
        const keys = Object.keys(obj).sort();

        keys.forEach(key => {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        });

        return sorted;
    }

    // ================================
    // CREATE ORDER
    // ================================
    static createOrder = async (req: Request, res: Response) => {
        const queryRunner = AppDataSource.createQueryRunner();

        try {
            const userId = (req as any).user?.userId || (req as any).user?.id;

            const {
                selectedIds,
                totalPrice,
                receiverName,
                phone,
                address,
                paymentMethod,
                note
            } = req.body;

            if (!selectedIds || selectedIds.length === 0) {
                return res.status(400).json({ message: "Không có sản phẩm nào được chọn" });
            }

            // ============================
            // COD
            // ============================
            if (paymentMethod === "COD") {
                await queryRunner.connect();
                await queryRunner.startTransaction();

                try {
                    // 1. Lấy cart items + lock
                    const cartItems = await queryRunner.manager
                        .createQueryBuilder(CartItem, "item")
                        .leftJoinAndSelect("item.variant", "variant")
                        .leftJoinAndSelect("variant.product", "product")
                        .setLock("pessimistic_write") // 🔥 chống race condition
                        .where("variant.productVariantId IN (:...ids)", { ids: selectedIds })
                        .getMany();

                    if (cartItems.length === 0) {
                        throw new Error("Không tìm thấy sản phẩm trong giỏ");
                    }

                    // 2. Check stock
                    for (const item of cartItems) {
                        if (item.variant.stock < item.quantity) {
                            throw new Error(`Sản phẩm "${item.variant.product.name}" không đủ hàng`);
                        }
                    }

                    // 3. Tạo order
                    const order = queryRunner.manager.create(Order, {
                        user: { userId },
                        receiverName,
                        phone,
                        address,
                        totalPrice,
                        paymentMethod,
                        note,
                        status: "pending",
                        paymentStatus: "pending"
                    });

                    const savedOrder = await queryRunner.manager.save(order);

                    // 4. Xử lý từng item
                    for (const item of cartItems) {


                        // Trừ kho
                        item.variant.stock -= item.quantity;
                        await queryRunner.manager.save(item.variant);

                        // 🔥 TĂNG SOLD
                        const product = item.variant.product;
                        product.sold += item.quantity;
                        await queryRunner.manager.save(Product, product);

                        // Tạo order item
                        const orderItem = queryRunner.manager.create(OrderItem, {
                            order: savedOrder,
                            variant: item.variant,
                            quantity: item.quantity,
                            price: item.variant.price
                        });

                        await queryRunner.manager.save(orderItem);
                    }

                    // 5. Xóa cart
                    await queryRunner.manager.delete(
                        CartItem,
                        cartItems.map(i => i.cartItemId)
                    );

                    await queryRunner.commitTransaction();

                    return res.status(201).json({
                        message: "Đặt hàng thành công",
                        orderId: savedOrder.orderId
                    });

                } catch (err: any) {
                    await queryRunner.rollbackTransaction();
                    return res.status(400).json({ message: err.message });
                } finally {
                    await queryRunner.release();
                }
            }

            // ============================
            // VNPAY
            // ============================
            if (paymentMethod === "VNPAY") {

                const orderData = {
                    userId,
                    selectedIds,
                    receiverName,
                    phone,
                    address,
                    totalPrice,
                    note
                };

                const orderInfo = Buffer.from(JSON.stringify(orderData)).toString("base64");

                const date = new Date();

                let vnp_Params: any = {
                    vnp_Version: "2.1.0",
                    vnp_Command: "pay",
                    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
                    vnp_Locale: "vn",
                    vnp_CurrCode: "VND",
                    vnp_TxnRef: Date.now().toString(),
                    vnp_OrderInfo: orderInfo,
                    vnp_OrderType: "other",
                    vnp_Amount: totalPrice * 100,
                    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
                    vnp_IpAddr: req.ip || "127.0.0.1",
                    vnp_CreateDate: format(date, "yyyyMMddHHmmss"),
                };

                vnp_Params = OrderController.sortObject(vnp_Params);

                const signData = qs.stringify(vnp_Params, { encode: false });

                const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
                const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

                vnp_Params["vnp_SecureHash"] = signed;

                return res.json({
                    url: vnpayConfig.vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false })
                });
            }

        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };

    // ================================
    // VNPAY RETURN
    // ================================
    static vnpayReturn = async (req: Request, res: Response) => {
        const queryRunner = AppDataSource.createQueryRunner();

        try {
            let vnp_Params: any = { ...req.query };
            const secureHash = vnp_Params["vnp_SecureHash"];

            delete vnp_Params["vnp_SecureHash"];
            delete vnp_Params["vnp_SecureHashType"];

            const sortedParams = OrderController.sortObject(vnp_Params);

            const signData = qs.stringify(sortedParams, { encode: false });

            const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
            const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

            // ❌ Nếu hash sai => reject
            if (secureHash !== signed) {
                return res.redirect(`http://localhost:5173/order-success?status=error`);
            }

            // ❌ Nếu thanh toán fail
            if (req.query.vnp_ResponseCode !== "00") {
                return res.redirect(`http://localhost:5173/order-success?status=cancel`);
            }

            // ============================
            // THANH TOÁN THÀNH CÔNG
            // ============================
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const orderData = JSON.parse(
                    Buffer.from(req.query.vnp_OrderInfo as string, "base64").toString()
                );

                // Lấy cart items + lock
                const cartItems = await queryRunner.manager
                    .createQueryBuilder(CartItem, "item")
                    .leftJoinAndSelect("item.variant", "variant")
                    .leftJoinAndSelect("variant.product", "product")
                    .setLock("pessimistic_write")
                    .where("variant.productVariantId IN (:...ids)", { ids: orderData.selectedIds })
                    .getMany();

                // Check stock
                for (const item of cartItems) {
                    if (!item.variant.isActive) {
                        throw new Error(`Sản phẩm "${item.variant.product.name}" đã ngừng bán`);
                    }
                    if (item.variant.stock < item.quantity) {
                        throw new Error("Không đủ hàng");
                    }
                }

                // Tạo order
                const order = queryRunner.manager.create(Order, {
                    user: { userId: orderData.userId },
                    receiverName: orderData.receiverName,
                    phone: orderData.phone,
                    address: orderData.address,
                    totalPrice: orderData.totalPrice,
                    paymentMethod: "VNPAY",
                    status: "pending",
                    paymentStatus: "paid"
                });

                const savedOrder = await queryRunner.manager.save(order);

                // Xử lý item
                for (const item of cartItems) {

                    item.variant.stock -= item.quantity;
                    await queryRunner.manager.save(item.variant);

                    // 🔥 tăng sold
                    const product = item.variant.product;
                    product.sold += item.quantity;
                    await queryRunner.manager.save(Product, product);

                    const orderItem = queryRunner.manager.create(OrderItem, {
                        order: savedOrder,
                        variant: item.variant,
                        quantity: item.quantity,
                        price: item.variant.price
                    });

                    await queryRunner.manager.save(orderItem);
                }

                // Xóa cart
                await queryRunner.manager.delete(
                    CartItem,
                    cartItems.map(i => i.cartItemId)
                );

                await queryRunner.commitTransaction();

                return res.redirect(`http://localhost:5173/order-success?status=success&id=${savedOrder.orderId}`);

            } catch (err) {
                await queryRunner.rollbackTransaction();
                return res.redirect(`http://localhost:5173/order-success?status=error`);
            } finally {
                await queryRunner.release();
            }

        } catch (error) {
            return res.redirect(`http://localhost:5173/order-success?status=error`);
        }
    };
    // static async getMyOrders(req: any, res: Response) {
    //     try {
    //         const userId = req.user.userId;
    //         const { status } = req.query; // Filter: pending, approved, v.v..

    //         const orderRepo = AppDataSource.getRepository(Order);

    //         const query: any = {
    //             where: { user: { userId: userId } },
    //             relations: ["items", "items.variant", "items.variant.product", "items.variant.color", "items.variant.color.images"],
    //             order: { createdAt: "DESC" }
    //         };

    //         if (status && status !== "all") {
    //             query.where.status = status;
    //         }

    //         const orders = await orderRepo.find(query);
    //         return res.json(orders);
    //     } catch (error) {
    //         return res.status(500).json({ message: "Lỗi server", error });
    //     }
    // }

    static async getMyOrders(req: any, res: Response) {
        try {
            const userId = req.user.userId;

            const { status, page = 1, limit = 10 } = req.query;

            const orderRepo = AppDataSource.getRepository(Order);

            const skip = (Number(page) - 1) * Number(limit);

            const query: any = {
                where: { user: { userId: userId } },
                relations: [
                    "items",
                    "items.variant",
                    "items.variant.product",
                    "items.variant.color",
                    "items.variant.color.images"
                ],
                order: { createdAt: "DESC" },
                skip: skip,
                take: Number(limit)
            };

            if (status && status !== "all") {
                query.where.status = status;
            }

            const [orders, total] = await orderRepo.findAndCount(query);

            return res.json({
                data: orders,
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit)
            });

        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error });
        }
    }

    // Hủy đơn hàng (Chỉ khi status là pending)
    static async cancelOrder(req: any, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userId = req.user.userId;
            const { orderId } = req.params;

            // 1. Tìm đơn hàng kèm theo danh sách sản phẩm (items)
            const order = await queryRunner.manager.findOne(Order, {
                where: { orderId: Number(orderId), user: { userId } },
                relations: ["items", "items.variant", "items.variant.product"]
            });

            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

            // 2. Kiểm tra điều kiện hủy (Chỉ cho phép khi đang 'pending')
            if (order.status !== "pending") {
                return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng đang chờ xác thực" });
            }

            // 3. HOÀN LẠI KHO VÀ GIẢM LƯỢT BÁN
            for (const item of order.items) {
                const variant = item.variant;
                const product = variant.product;

                // A. Cộng lại số lượng vào kho (Stock)
                variant.stock += item.quantity;
                await queryRunner.manager.save(variant);

                // B. Trừ đi số lượng đã bán (Sold)
                // Đảm bảo sold không bị âm (đề phòng lỗi logic)
                product.sold = Math.max(0, product.sold - item.quantity);
                await queryRunner.manager.save(product);
            }

            // 4. Cập nhật trạng thái đơn hàng thành 'cancelled'
            order.status = "cancelled";
            await queryRunner.manager.save(order);

            // 5. Xác nhận hoàn tất các thay đổi
            await queryRunner.commitTransaction();

            return res.json({
                success: true,
                message: "Hủy đơn hàng thành công, kho và lượt bán đã được cập nhật"
            });

        } catch (error) {
            // Nếu có bất kỳ lỗi nào, hủy bỏ toàn bộ thay đổi để tránh sai lệch dữ liệu
            await queryRunner.rollbackTransaction();
            console.error("Cancel Order Error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi hủy đơn hàng" });
        } finally {
            // Giải phóng kết nối
            await queryRunner.release();
        }
    }

    // Yêu cầu trả hàng (Chỉ khi status là completed)
    static async returnOrder(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { orderId } = req.params;
            const orderRepo = AppDataSource.getRepository(Order);

            const order = await orderRepo.findOne({ where: { orderId: Number(orderId), user: { userId } } });

            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            if (order.status !== "completed") return res.status(400).json({ message: "Chỉ có thể trả hàng khi đơn đã hoàn tất" });

            order.status = "returned";
            await orderRepo.save(order);

            return res.json({ message: "Yêu cầu trả hàng đã được gửi", order });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
}