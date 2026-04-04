import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { CartItem } from "../models/CartItem";
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

    static createOrder = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId || (req as any).user?.id;
            const { selectedIds, totalPrice, receiverName, phone, address, paymentMethod, note } = req.body;

            // --- TH1: COD (LƯU NGAY) ---
            if (paymentMethod === 'COD') {
                const queryRunner = AppDataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    const order = new Order();
                    Object.assign(order, { user: { userId }, receiverName, phone, address, totalPrice, paymentMethod, note, status: 'pending', paymentStatus: 'pending' });
                    const savedOrder = await queryRunner.manager.save(order);

                    const cartItems = await queryRunner.manager.createQueryBuilder(CartItem, "item")
                        .leftJoinAndSelect("item.variant", "variant")
                        .where("variant.productVariantId IN (:...ids)", { ids: selectedIds })
                        .getMany();

                    for (const item of cartItems) {
                        item.variant.stock -= item.quantity;
                        await queryRunner.manager.save(item.variant);
                        const orderItem = new OrderItem();
                        Object.assign(orderItem, { order: savedOrder, variant: item.variant, quantity: item.quantity, price: item.variant.price });
                        await queryRunner.manager.save(orderItem);
                    }

                    await queryRunner.manager.delete(CartItem, cartItems.map(i => i.cartItemId));
                    await queryRunner.commitTransaction();
                    return res.status(201).json({ message: "Thành công", orderId: savedOrder.orderId });
                } catch (err: any) {
                    await queryRunner.rollbackTransaction();
                    throw err;
                } finally { await queryRunner.release(); }
            }

            // --- TH2: VNPAY (CHỈ TẠO URL) ---
            if (paymentMethod === 'VNPAY') {
                const orderData = { userId, selectedIds, receiverName, phone, address, totalPrice, note };
                const orderInfoString = Buffer.from(JSON.stringify(orderData)).toString('base64');
                const date = new Date();

                let vnp_Params: any = {
                    'vnp_Version': '2.1.0',
                    'vnp_Command': 'pay',
                    'vnp_TmnCode': vnpayConfig.vnp_TmnCode,
                    'vnp_Locale': 'vn',
                    'vnp_CurrCode': 'VND',
                    'vnp_TxnRef': `${Date.now()}`,
                    'vnp_OrderInfo': orderInfoString,
                    'vnp_OrderType': 'other',
                    'vnp_Amount': totalPrice * 100,
                    'vnp_ReturnUrl': vnpayConfig.vnp_ReturnUrl,
                    'vnp_IpAddr': req.ip || "127.0.0.1",
                    'vnp_CreateDate': format(date, "yyyyMMddHHmmss"),
                };

                vnp_Params = OrderController.sortObject(vnp_Params);
                const signData = qs.stringify(vnp_Params, { encode: false });
                const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
                vnp_Params['vnp_SecureHash'] = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

                return res.status(200).json({ url: vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false }) });
            }
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    static vnpayReturn = async (req: Request, res: Response) => {
        const { vnp_ResponseCode, vnp_OrderInfo, vnp_SecureHash } = req.query;

        if (vnp_ResponseCode === "00") {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const orderData = JSON.parse(Buffer.from(vnp_OrderInfo as string, 'base64').toString());
                const order = new Order();
                Object.assign(order, { user: { userId: orderData.userId }, receiverName: orderData.receiverName, phone: orderData.phone, address: orderData.address, totalPrice: orderData.totalPrice, paymentMethod: 'VNPAY', status: 'pending', paymentStatus: 'paid' });
                const savedOrder = await queryRunner.manager.save(order);

                const cartItems = await queryRunner.manager.createQueryBuilder(CartItem, "item")
                    .leftJoinAndSelect("item.variant", "variant")
                    .where("variant.productVariantId IN (:...ids)", { ids: orderData.selectedIds })
                    .getMany();

                for (const item of cartItems) {
                    item.variant.stock -= item.quantity;
                    await queryRunner.manager.save(item.variant);
                    const orderItem = new OrderItem();
                    Object.assign(orderItem, { order: savedOrder, variant: item.variant, quantity: item.quantity, price: item.variant.price });
                    await queryRunner.manager.save(orderItem);
                }

                await queryRunner.manager.delete(CartItem, cartItems.map(i => i.cartItemId));
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