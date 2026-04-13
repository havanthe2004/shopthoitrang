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


    private static sortObject(obj: any) {
        const sorted: any = {};
        const keys = Object.keys(obj).sort();

        keys.forEach(key => {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        });

        return sorted;
    }


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

          
            if (paymentMethod === "COD") {
                await queryRunner.connect();
                await queryRunner.startTransaction();

                try {
                 
                    const cartItems = await queryRunner.manager
                        .createQueryBuilder(CartItem, "item")
                        .leftJoinAndSelect("item.variant", "variant")
                        .leftJoinAndSelect("variant.product", "product")
                        .setLock("pessimistic_write") 
                        .where("variant.productVariantId IN (:...ids)", { ids: selectedIds })
                        .getMany();

                    if (cartItems.length === 0) {
                        throw new Error("Không tìm thấy sản phẩm trong giỏ");
                    }

                    
                    for (const item of cartItems) {
                        if (item.variant.stock < item.quantity) {
                            throw new Error(`Sản phẩm "${item.variant.product.name}" không đủ hàng`);
                        }
                    }

                 
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

                    
                    for (const item of cartItems) {


                       
                        item.variant.stock -= item.quantity;
                        await queryRunner.manager.save(item.variant);

                       
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

            if (secureHash !== signed) {
                return res.redirect(`http://localhost:5173/order-success?status=error`);
            }

           
            if (req.query.vnp_ResponseCode !== "00") {
                return res.redirect(`http://localhost:5173/order-success?status=cancel`);
            }

          
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const orderData = JSON.parse(
                    Buffer.from(req.query.vnp_OrderInfo as string, "base64").toString()
                );

               
                const cartItems = await queryRunner.manager
                    .createQueryBuilder(CartItem, "item")
                    .leftJoinAndSelect("item.variant", "variant")
                    .leftJoinAndSelect("variant.product", "product")
                    .setLock("pessimistic_write")
                    .where("variant.productVariantId IN (:...ids)", { ids: orderData.selectedIds })
                    .getMany();

               
                for (const item of cartItems) {
                    if (!item.variant.isActive) {
                        throw new Error(`Sản phẩm "${item.variant.product.name}" đã ngừng bán`);
                    }
                    if (item.variant.stock < item.quantity) {
                        throw new Error("Không đủ hàng");
                    }
                }

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

               
                for (const item of cartItems) {

                    item.variant.stock -= item.quantity;
                    await queryRunner.manager.save(item.variant);

                  
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

  
    static async cancelOrder(req: any, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userId = req.user.userId;
            const { orderId } = req.params;

         
            const order = await queryRunner.manager.findOne(Order, {
                where: { orderId: Number(orderId), user: { userId } },
                relations: ["items", "items.variant", "items.variant.product"]
            });

            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

         
            if (order.status !== "pending") {
                return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng đang chờ xác thực" });
            }

       
            for (const item of order.items) {
                const variant = item.variant;
                const product = variant.product;

              
                variant.stock += item.quantity;
                await queryRunner.manager.save(variant);

              
                product.sold = Math.max(0, product.sold - item.quantity);
                await queryRunner.manager.save(product);
            }

     
            order.status = "cancelled";
            await queryRunner.manager.save(order);

        
            await queryRunner.commitTransaction();

            return res.json({
                success: true,
                message: "Hủy đơn hàng thành công, kho và lượt bán đã được cập nhật"
            });

        } catch (error) {
         
            await queryRunner.rollbackTransaction();
            console.error("Cancel Order Error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi hủy đơn hàng" });
        } finally {
        
            await queryRunner.release();
        }
    }

  
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