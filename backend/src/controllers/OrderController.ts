import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
import { PaymentTransaction } from "../models/PaymentTransaction";
import { vnpay, vnpayConfig } from "../config/vnpay.config";
import { ProductCode, VnpLocale, dateFormat } from "vnpay";
import { notifyNewOrder, notifyOrderStatusChanged } from "../socket/chat.socket";

export const getVnpayResponseMessage = (code: string): string => {
    switch (code) {
        case "00":
            return "Giao dịch thành công.";
        case "07":
            return "Trừ tiền thành công. Giao dịch bị nghi ngờ bất thường.";
        case "09":
            return "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
        case "10":
            return "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
        case "11":
            return "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.";
        case "12":
            return "Thẻ/Tài khoản của bạn đã bị khóa.";
        case "13":
            return "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
        case "24":
            return "Giao dịch đã bị hủy bởi khách hàng.";
        case "51":
            return "Tài khoản của bạn không đủ số dư để thực hiện giao dịch.";
        case "65":
            return "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.";
        case "71":
            return "Website/Terminal này chưa được VNPAY phê duyệt hoặc thông tin thẻ không chính xác.";
        case "75":
            return "Ngân hàng thanh toán đang bảo trì. Vui lòng thử lại sau.";
        case "79":
            return "Nhập sai mật khẩu thanh toán quá số lần quy định.";
        case "97":
            return "Chữ ký bảo mật (checksum) không hợp lệ.";
        default:
            return "Thanh toán không thành công hoặc giao dịch đã bị hủy.";
    }
};

export class OrderController {

    /**
     * Tạo đơn hàng mới
     * - Với COD: Tạo đơn hàng ngay, trừ kho và xóa sản phẩm khỏi giỏ hàng.
     * - Với VNPAY: CHƯA TẠO đơn hàng trong bảng orders, chỉ tạo phiên giao dịch tạm (PaymentTransaction).
     *   Đơn hàng chỉ được tạo khi khách hàng đã thanh toán thành công qua VNPAY.
     */
    static createOrder = async (req: Request, res: Response) => {
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

            if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
                return res.status(400).json({ message: "Không có sản phẩm nào được chọn" });
            }

            if (!receiverName || !phone || !address) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin nhận hàng" });
            }

            // ==========================================
            // 1. THANH TOÁN KHI NHẬN HÀNG (COD)
            // ==========================================
            if (paymentMethod === "COD") {
                const queryRunner = AppDataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();

                try {
                    const cartItems = await queryRunner.manager
                        .createQueryBuilder(CartItem, "item")
                        .innerJoin("item.cart", "cart")
                        .innerJoin("cart.user", "user")
                        .leftJoinAndSelect("item.variant", "variant")
                        .leftJoinAndSelect("variant.product", "product")
                        .setLock("pessimistic_write")
                        .where("user.userId = :userId", { userId })
                        .andWhere("variant.productVariantId IN (:...ids)", { ids: selectedIds })
                        .getMany();

                    if (cartItems.length === 0) {
                        throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
                    }

                    for (const item of cartItems) {
                        if (item.variant.stock < item.quantity) {
                            throw new Error(`Sản phẩm "${item.variant.product.name}" không đủ số lượng trong kho`);
                        }
                    }

                    const order = queryRunner.manager.create(Order, {
                        user: { userId },
                        receiverName,
                        phone,
                        address,
                        totalPrice,
                        paymentMethod: "COD",
                        note: note || "",
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

                    // Bắn socket thông báo đơn hàng mới cho quản trị viên
                    notifyNewOrder({
                        orderId: savedOrder.orderId,
                        receiverName: savedOrder.receiverName,
                        phone: savedOrder.phone,
                        totalPrice: savedOrder.totalPrice,
                        paymentMethod: savedOrder.paymentMethod,
                        createdAt: savedOrder.createdAt
                    });

                    return res.status(201).json({
                        message: "Đặt hàng thành công",
                        orderId: savedOrder.orderId
                    });

                } catch (err: any) {
                    await queryRunner.rollbackTransaction();
                    return res.status(400).json({ message: err.message || "Không thể tạo đơn hàng vào lúc này." });
                } finally {
                    await queryRunner.release();
                }
            }

            // ==========================================
            // 2. THANH TOÁN VNPAY ONLINE
            // ==========================================
            if (paymentMethod === "VNPAY") {
                // Kiểm tra giỏ hàng và số lượng tồn kho trước khi tạo link
                const cartItemRepo = AppDataSource.getRepository(CartItem);
                const cartItems = await cartItemRepo
                    .createQueryBuilder("item")
                    .innerJoin("item.cart", "cart")
                    .innerJoin("cart.user", "user")
                    .leftJoinAndSelect("item.variant", "variant")
                    .leftJoinAndSelect("variant.product", "product")
                    .where("user.userId = :userId", { userId })
                    .andWhere("variant.productVariantId IN (:...ids)", { ids: selectedIds })
                    .getMany();

                if (cartItems.length === 0) {
                    return res.status(400).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
                }

                for (const item of cartItems) {
                    if (item.variant.stock < item.quantity) {
                        return res.status(400).json({
                            message: `Sản phẩm "${item.variant.product.name}" không đủ số lượng trong kho`
                        });
                    }
                }

                // TẠO GIAO DỊCH TẠM (PaymentTransaction)
                // Tuyệt đối CHƯA tạo bản ghi nào trong bảng orders!
                const txnRef = `${Date.now()}${userId}${Math.floor(1000 + Math.random() * 9000)}`;

                const transactionRepo = AppDataSource.getRepository(PaymentTransaction);
                const transaction = transactionRepo.create({
                    txnRef,
                    userId,
                    amount: totalPrice,
                    status: "pending",
                    orderPayload: {
                        selectedIds,
                        receiverName,
                        phone,
                        address,
                        totalPrice,
                        note: note || ""
                    }
                });

                await transactionRepo.save(transaction);

                // Tạo URL thanh toán VNPAY
                const date = new Date();
                const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "127.0.0.1";
                let clientIp = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "127.0.0.1";
                if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1" || clientIp.includes(":")) {
                    clientIp = "127.0.0.1";
                }

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                const paymentUrl = vnpay.buildPaymentUrl({
                    vnp_Amount: Number(totalPrice),
                    vnp_IpAddr: clientIp,
                    vnp_TxnRef: txnRef,
                    vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
                    vnp_Locale: VnpLocale.VN,
                    vnp_CreateDate: dateFormat(new Date()),
                    vnp_ExpireDate: dateFormat(tomorrow),
                });

                // ========== DEBUG LOG ==========
                console.log("\n===== [VNPAY DEBUG] =====\n");
                console.log("[1] TmnCode   :", vnpayConfig.vnp_TmnCode);
                console.log("[2] ReturnUrl :", vnpayConfig.vnp_ReturnUrl);
                console.log("[3] clientIp  :", clientIp);
                console.log("[4] txnRef    :", txnRef);
                console.log("[5] Amount    :", totalPrice);
                console.log("[6] paymentUrl:", paymentUrl);
                console.log("========================\n");
                // ================================

                return res.json({
                    url: paymentUrl
                });
            }

            return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });

        } catch (error: any) {
            console.error("Lỗi createOrder:", error);
            return res.status(500).json({ message: error.message || "Lỗi server" });
        }
    };

    /**
     * Hàm nội bộ xử lý tạo đơn hàng khi VNPAY xác nhận thanh toán thành công
     */
    private static async handleSuccessfulVnpayOrder(
        transaction: PaymentTransaction,
        responseCode: string
    ): Promise<Order> {
        // Đã tạo đơn trước đó (idempotency), trả về đơn hiện tại
        if (transaction.status === "success" && transaction.orderId) {
            const orderRepo = AppDataSource.getRepository(Order);
            const existingOrder = await orderRepo.findOne({
                where: { orderId: transaction.orderId },
                relations: ["items"]
            });
            if (existingOrder) return existingOrder;
        }

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { selectedIds, receiverName, phone, address, totalPrice, note } = transaction.orderPayload;
            const userId = transaction.userId;

            // 1. Khóa và lấy các sản phẩm trong giỏ hàng
            const cartItems = await queryRunner.manager
                .createQueryBuilder(CartItem, "item")
                .innerJoin("item.cart", "cart")
                .innerJoin("cart.user", "user")
                .leftJoinAndSelect("item.variant", "variant")
                .leftJoinAndSelect("variant.product", "product")
                .setLock("pessimistic_write")
                .where("user.userId = :userId", { userId })
                .andWhere("variant.productVariantId IN (:...ids)", { ids: selectedIds })
                .getMany();

            if (cartItems.length === 0) {
                throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
            }

            for (const item of cartItems) {
                if (item.variant.stock < item.quantity) {
                    throw new Error(`Sản phẩm "${item.variant.product.name}" không đủ số lượng trong kho`);
                }
            }

            // 2. TẠO ĐƠN HÀNG CHÍNH THỨC TRONG DATABASE (KHI ĐÃ THANH TOÁN THÀNH CÔNG)
            const order = queryRunner.manager.create(Order, {
                user: { userId },
                receiverName,
                phone,
                address,
                totalPrice,
                paymentMethod: "VNPAY",
                paymentStatus: "paid",
                status: "pending",
                note: note || ""
            });

            const savedOrder = await queryRunner.manager.save(order);

            // 3. Trừ kho, tăng số lượng đã bán và tạo OrderItem
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

            // 4. Xóa chỉ những mặt hàng đã thanh toán khỏi giỏ hàng
            await queryRunner.manager.delete(
                CartItem,
                cartItems.map(i => i.cartItemId)
            );

            // 5. Cập nhật transaction
            transaction.status = "success";
            transaction.orderId = savedOrder.orderId;
            transaction.responseCode = responseCode;
            await queryRunner.manager.save(transaction);

            await queryRunner.commitTransaction();

            // 6. Gửi socket thông báo đơn hàng mới cho Admin
            notifyNewOrder({
                orderId: savedOrder.orderId,
                receiverName: savedOrder.receiverName,
                phone: savedOrder.phone,
                totalPrice: savedOrder.totalPrice,
                paymentMethod: savedOrder.paymentMethod,
                createdAt: savedOrder.createdAt
            });

            return savedOrder;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Lỗi khi tạo đơn hàng VNPAY thành công:", error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * VNPAY IPN (Server-to-Server Webhook)
     */
    static vnpayIpn = async (req: any, res: Response) => {
        try {
            const verify = vnpay.verifyIpnCall(req.query);

            if (!verify.isVerified) {
                console.error("VNPAY IPN: Chữ ký không khớp!", verify);
                return res.json({ RspCode: "97", Message: "Invalid signature" });
            }

            const txnRef = verify.vnp_TxnRef;
            const responseCode = String(verify.vnp_ResponseCode);
            const amount = Number(verify.vnp_Amount);

            const transactionRepo = AppDataSource.getRepository(PaymentTransaction);
            const transaction = await transactionRepo.findOne({ where: { txnRef } });

            if (!transaction) {
                return res.json({ RspCode: "01", Message: "Order not found" });
            }

            if (Math.round(Number(transaction.amount)) !== Math.round(amount)) {
                return res.json({ RspCode: "04", Message: "Invalid amount" });
            }

            // Đã xử lý thành công trước đó
            if (transaction.status === "success") {
                return res.json({ RspCode: "02", Message: "Order already confirmed" });
            }

            // NẾU THANH TOÁN THẤT BẠI: Đánh dấu transaction là failed, TUYỆT ĐỐI KHÔNG TẠO ĐƠN HÀNG!
            if (responseCode !== "00") {
                transaction.status = "failed";
                transaction.responseCode = responseCode;
                await transactionRepo.save(transaction);
                return res.json({ RspCode: "00", Message: "Confirm Success" });
            }

            // NẾU THANH TOÁN THÀNH CÔNG: Tạo đơn hàng chính thức
            await OrderController.handleSuccessfulVnpayOrder(transaction, responseCode);
            return res.json({ RspCode: "00", Message: "Confirm Success" });

        } catch (error) {
            console.error("Lỗi vnpayIpn:", error);
            return res.json({ RspCode: "99", Message: "Unknown error" });
        }
    };

    /**
     * VNPAY Return (Trình duyệt người dùng được redirect về sau khi thanh toán)
     */
    static vnpayReturn = async (req: any, res: Response) => {
        try {
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

            // Nếu người dùng vô tình truy cập trực tiếp URL vnpay-return mà không có tham số
            if (!req.query || Object.keys(req.query).length === 0) {
                return res.redirect(`${clientUrl}/cart`);
            }

            const verify = vnpay.verifyReturnUrl(req.query);

            // ========== DEBUG LOG ==========
            console.log("\n===== [VNPAY RETURN VERIFY] =====\n");
            console.log("[1] isVerified :", verify.isVerified);
            console.log("[2] isSuccess  :", verify.isSuccess);
            console.log("[3] message    :", verify.message);
            console.log("[4] txnRef     :", verify.vnp_TxnRef);
            console.log("[5] respCode   :", verify.vnp_ResponseCode);
            console.log("=================================\n");
            // ================================

            if (!verify.isVerified) {
                console.error("VNPAY Return: Chữ ký bảo mật không khớp!", verify);
                return res.redirect(`${clientUrl}/order-success?status=failed&message=${encodeURIComponent("Chữ ký bảo mật không hợp lệ!")}`);
            }

            const txnRef = verify.vnp_TxnRef;
            const responseCode = String(verify.vnp_ResponseCode);

            const transactionRepo = AppDataSource.getRepository(PaymentTransaction);
            const transaction = await transactionRepo.findOne({ where: { txnRef } });

            if (!transaction) {
                return res.redirect(`${clientUrl}/order-success?status=failed&message=${encodeURIComponent("Không tìm thấy thông tin giao dịch thanh toán!")}`);
            }

            // ==========================================
            // 👉 NẾU THANH TOÁN THẤT BẠI HOẶC BỊ HỦY:
            // TUYỆT ĐỐI KHÔNG TẠO ĐƠN HÀNG TRONG DATABASE!
            // ==========================================
            if (responseCode !== "00") {
                transaction.status = "failed";
                transaction.responseCode = responseCode;
                await transactionRepo.save(transaction);

                const message = getVnpayResponseMessage(responseCode);
                return res.redirect(
                    `${clientUrl}/order-success?status=failed&code=${responseCode}&message=${encodeURIComponent(message)}`
                );
            }

            // ==========================================
            // 👉 NẾU THANH TOÁN THÀNH CÔNG (code === "00"):
            // TIẾN HÀNH TẠO ĐƠN HÀNG CHÍNH THỨC
            // ==========================================
            const order = await OrderController.handleSuccessfulVnpayOrder(transaction, responseCode);

            return res.redirect(`${clientUrl}/order-success?status=success&orderId=${order.orderId}`);

        } catch (error: any) {
            console.error("Lỗi vnpayReturn:", error);
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            return res.redirect(
                `${clientUrl}/order-success?status=failed&message=${encodeURIComponent(error.message || "Lỗi xử lý kết quả thanh toán")}`
            );
        }
    };

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     */
    static async getMyOrders(req: any, res: Response) {
        try {
            const userId = req.user?.userId || req.user?.id;
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

    /**
     * Hủy đơn hàng (dành cho đơn hàng COD đang chờ duyệt)
     */
    static async cancelOrder(req: any, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userId = req.user?.userId || req.user?.id;
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

            // Cập nhật trạng thái đơn hàng thời gian thực cho Admin
            notifyOrderStatusChanged({
                orderId: order.orderId,
                status: "cancelled",
                oldStatus: "pending"
            });

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

    /**
     * Yêu cầu hoàn trả đơn hàng
     */
    static async returnOrder(req: any, res: Response) {
        try {
            const userId = req.user?.userId || req.user?.id;
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