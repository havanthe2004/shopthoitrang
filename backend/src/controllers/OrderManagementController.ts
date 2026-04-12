import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../models/Order";
import { AdminLog } from "../models/AdminLog";

export class OrderManagementController {
    private static ORDER_FLOW: { [key: string]: string[] } = {
        pending: ["approved", "cancelled"], // Chờ xác thực -> Xác thực hoặc Hủy
        approved: ["shipping"],             // Xác thực -> Vận chuyển
        shipping: ["completed", "returned"],// Vận chuyển -> Hoàn thành hoặc Trả hàng
        completed: ["returned"],            // Hoàn thành -> Trả hàng (Đổi ý/Lỗi sau nhận)
        cancelled: [],                      // Trạng thái cuối
        returned: []                        // Trạng thái cuối
    };


    private static PAYMENT_FLOW: { [key: string]: string[] } = {
        pending: ["paid"],
        paid: ["refunded"], // Chỉ có thể hoàn tiền sau khi đã thu tiền
        failed: ["pending"], // Cho phép thử thanh toán lại
        refunded: []
    };


    private static async saveLog(adminId: number, action: string) {
        const logRepo = AppDataSource.getRepository(AdminLog);
        await logRepo.save(logRepo.create({ admin: { adminId }, action }));
    }

    static async getOrders(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;
            const search = req.query.search as string;

            const orderRepo = AppDataSource.getRepository(Order);
            const query = orderRepo.createQueryBuilder("order")
                .leftJoinAndSelect("order.user", "user")
                .leftJoinAndSelect("order.items", "items")
                .leftJoinAndSelect("items.variant", "variant")
                .leftJoinAndSelect("variant.product", "product")
                .leftJoinAndSelect("variant.color", "color")
                .leftJoinAndSelect("color.images", "images");;

            if (status) {
                query.andWhere("order.status = :status", { status });
            }

            if (search) {
                query.andWhere("(order.receiverName LIKE :search OR order.phone LIKE :search OR order.orderId = :idSearch)", {
                    search: `%${search}%`,
                    idSearch: isNaN(Number(search)) ? -1 : Number(search)
                });
            }

            const [items, total] = await query
                .orderBy("order.createdAt", "DESC")
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
            return res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
        }
    }

    static async updateOrderStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { newStatus } = req.body;
            const adminId = (req as any).admin.adminId;

            const orderRepo = AppDataSource.getRepository(Order);
            const order = await orderRepo.findOneBy({ orderId: Number(id) });
            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

            // Kiểm tra quy tắc 1 chiều đơn hàng
            if (!OrderManagementController.ORDER_FLOW[order.status].includes(newStatus)) {
                return res.status(400).json({ message: "Luồng đơn hàng không hợp lệ" });
            }

            const oldStatus = order.status;
            order.status = newStatus;
            if (newStatus === "completed") {
                order.paymentStatus = "paid";
            }

            await orderRepo.save(order);
            await OrderManagementController.saveLog(adminId, `Đơn #${id}: Trạng thái ${oldStatus} -> ${newStatus}`);

            return res.json({ message: "Cập nhật đơn hàng thành công", order });
        } catch (error) { return res.status(500).json({ message: "Lỗi server" }); }
    }

    static async updatePaymentStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { newPaymentStatus } = req.body;
            const adminId = (req as any).admin.adminId;

            const orderRepo = AppDataSource.getRepository(Order);
            const order = await orderRepo.findOneBy({ orderId: Number(id) });
            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
            if (!OrderManagementController.PAYMENT_FLOW[order.paymentStatus].includes(newPaymentStatus)) {
                return res.status(400).json({ message: "Luồng thanh toán không hợp lệ" });
            }

            const oldPayment = order.paymentStatus;
            order.paymentStatus = newPaymentStatus;

            await orderRepo.save(order);
            await OrderManagementController.saveLog(adminId, `Đơn #${id}: Thanh toán ${oldPayment} -> ${newPaymentStatus}`);

            return res.json({ message: "Cập nhật thanh toán thành công", order });
        } catch (error) { return res.status(500).json({ message: "Lỗi server" }); }
    }
}