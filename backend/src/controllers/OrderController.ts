import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { vnpayConfig } from "../config/vnpay.config";
import crypto from "crypto";
import qs from "qs";
import { format } from "date-fns";

export class OrderController {
    private static sortObject(obj: any) {
        let sorted: any = {};
        let str = Object.keys(obj).map(key => encodeURIComponent(key)).sort();
        str.forEach(key => {
            sorted[key] = encodeURIComponent(obj[decodeURIComponent(key)]).replace(/%20/g, "+");
        });
        return sorted;
    }

    /**
     * Hàm dùng chung để xử lý logic: Trừ Kho, Tăng Đã Bán, Tạo OrderItem
     * Dùng cho cả COD và VNPAY (khi thành công)
     */
    private static async processOrderLogic(manager: any, savedOrder: Order, selectedIds: number[]) {
        // 1. Lấy chi tiết các mục trong giỏ hàng (kèm thông tin Product để tăng 'sold')
        const cartItems = await manager.createQueryBuilder(CartItem, "item")
            .leftJoinAndSelect("item.variant", "variant")
            .leftJoinAndSelect("variant.product", "product") // Lấy thông tin Product chính
            .where("variant.productVariantId IN (:...ids)", { ids: selectedIds })
            .getMany();

        if (!cartItems || cartItems.length === 0) {
            throw new Error("Giỏ hàng trống hoặc sản phẩm không tồn tại");
        }

        for (const item of cartItems) {
            // KIỂM TRA TỒN KHO
            if (item.variant.stock < item.quantity) {
                throw new Error(`Sản phẩm ${item.variant.color}-${item.variant.size} không đủ số lượng trong kho`);
            }

            // A. TRỪ TỒN KHO (Stock) của Variant
            item.variant.stock -= item.quantity;
            await manager.save(ProductVariant, item.variant);

            // B. TĂNG SỐ LƯỢNG ĐÃ BÁN (Sold) của Product chính
            const product = item.variant.product;
            product.sold = (product.sold || 0) + item.quantity;
            await manager.save(Product, product);

            // C. TẠO ORDER ITEM (Lưu giá tại thời điểm mua)
            const orderItem = new OrderItem();
            orderItem.order = savedOrder;
            orderItem.variant = item.variant;
            orderItem.quantity = item.quantity;
            orderItem.price = item.variant.price; // Lưu giá lịch sử
            await manager.save(OrderItem, orderItem);
        }

        // D. XÓA GIỎ HÀNG sau khi đã xử lý xong các mục
        await manager.delete(CartItem, cartItems.map(i => i.cartItemId));
    }

    // --- API TẠO ĐƠN HÀNG ---
    static createOrder = async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { selectedIds, totalPrice, receiverName, phone, address, paymentMethod, note } = req.body;

        // TRƯỜNG HỢP 1: COD (Xử lý và lưu ngay lập tức)
        if (paymentMethod === 'COD') {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const order = new Order();
                Object.assign(order, { user: { userId }, receiverName, phone, address, totalPrice, paymentMethod, note, status: 'pending', paymentStatus: 'pending' });
                const savedOrder = await queryRunner.manager.save(order);

                // Gọi hàm xử lý logic nghiệp vụ (Trừ kho, Tăng sold, Tạo items)
                await OrderController.processOrderLogic(queryRunner.manager, savedOrder, selectedIds);

                await queryRunner.commitTransaction();
                return res.status(201).json({ message: "Đặt hàng thành công", orderId: savedOrder.orderId });
            } catch (error: any) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({ message: error.message });
            } finally { await queryRunner.release(); }
        }

        // TRƯỜNG HỢP 2: VNPAY (Chỉ tạo link, không lưu vào DB)
        if (paymentMethod === 'VNPAY') {
            const orderData = { userId, selectedIds, receiverName, phone, address, totalPrice, note };
            const orderInfo = Buffer.from(JSON.stringify(orderData)).toString('base64');

            let vnp_Params: any = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': vnpayConfig.vnp_TmnCode,
                'vnp_Locale': 'vn',
                'vnp_CurrCode': 'VND',
                'vnp_TxnRef': `${Date.now()}`,
                'vnp_OrderInfo': orderInfo,
                'vnp_OrderType': 'other',
                'vnp_Amount': totalPrice * 100,
                'vnp_ReturnUrl': vnpayConfig.vnp_ReturnUrl,
                'vnp_IpAddr': req.ip || "127.0.0.1",
                'vnp_CreateDate': format(new Date(), "yyyyMMddHHmmss"),
            };

            vnp_Params = OrderController.sortObject(vnp_Params);
            const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
            vnp_Params['vnp_SecureHash'] = hmac.update(Buffer.from(qs.stringify(vnp_Params, { encode: false }), 'utf-8')).digest("hex");

            return res.status(200).json({ url: vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false }) });
        }
    }

    // --- API CALLBACK VNPAY ---
    static vnpayReturn = async (req: Request, res: Response) => {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;

        if (vnp_ResponseCode === "00") {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Giải mã dữ liệu đơn hàng từ Base64
                const data = JSON.parse(Buffer.from(vnp_OrderInfo as string, 'base64').toString());

                // 1. Tạo Order chính thức
                const order = new Order();
                Object.assign(order, {
                    user: { userId: data.userId },
                    receiverName: data.receiverName,
                    phone: data.phone,
                    address: data.address,
                    totalPrice: data.totalPrice,
                    paymentMethod: 'VNPAY',
                    status: 'approved', // Thanh toán xong nên để là đã duyệt
                    paymentStatus: 'paid'
                });
                const savedOrder = await queryRunner.manager.save(order);

                // 2. Gọi hàm xử lý logic nghiệp vụ (Trừ kho, Tăng sold, Tạo items)
                await OrderController.processOrderLogic(queryRunner.manager, savedOrder, data.selectedIds);

                await queryRunner.commitTransaction();
                return res.redirect(`http://localhost:5173/order-success?status=success&id=${savedOrder.orderId}`);
            } catch (error) {
                await queryRunner.rollbackTransaction();
                return res.redirect(`http://localhost:5173/order-success?status=error`);
            } finally { await queryRunner.release(); }
        }
        return res.redirect(`http://localhost:5173/order-success?status=cancel`);
    }
}