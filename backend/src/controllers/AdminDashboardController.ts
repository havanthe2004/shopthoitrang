import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
import { User } from "../models/User";
import { Order } from "../models/Order";

export class AdminDashboardController {
    static getDashboardData = async (req: Request, res: Response) => {
        try {

            const {
                revFilter = 'month', revStart, revEnd,
                topFilter = 'month', topStart, topEnd
            } = req.query;

            const adminRepo = AppDataSource.getRepository(Admin);
            const userRepo = AppDataSource.getRepository(User);
            const orderRepo = AppDataSource.getRepository(Order);

            const [totalAdmins, totalUsers, totalOrders] = await Promise.all([
                adminRepo.count(),
                userRepo.count(),
                orderRepo.count()
            ]);


            const revResult = await orderRepo.createQueryBuilder("order")
                .select("SUM(order.totalPrice)", "total")
                .where("order.status = :status", { status: "completed" })
                .andWhere("order.paymentStatus = :paymentStatus", { paymentStatus: "paid" }) 
                .getRawOne();

            const totalRevenue = revResult?.total ? Number(revResult.total) : 0;


            let chartQuery = orderRepo.createQueryBuilder("order")
                .where("order.status = :status", { status: "completed" });

            if (revFilter === 'custom' && revStart && revEnd) {
                chartQuery.andWhere("DATE(order.createdAt) >= :start AND DATE(order.createdAt) <= :end", { start: revStart, end: revEnd })
                    .select("DATE_FORMAT(order.createdAt, '%Y-%m-%d')", "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy("DATE_FORMAT(order.createdAt, '%Y-%m-%d')")
                    .orderBy("date", "ASC");
            } else if (revFilter === 'year') {
                chartQuery.select("YEAR(order.createdAt)", "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy("YEAR(order.createdAt)")
                    .orderBy("date", "DESC").limit(5);
            } else if (revFilter === 'week') {
                const weekFormat = "CONCAT(YEAR(order.createdAt), '-W', LPAD(WEEK(order.createdAt, 1), 2, '0'))";

                chartQuery.select(weekFormat, "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy(weekFormat)
                    .orderBy(weekFormat, "DESC")
                    .limit(12);
            } else {
                chartQuery.select("DATE_FORMAT(order.createdAt, '%Y-%m')", "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy("DATE_FORMAT(order.createdAt, '%Y-%m')")
                    .orderBy("date", "DESC").limit(12);
            }

            const chartDataRaw = await chartQuery.getRawMany();

            const chartData = (revFilter === 'custom' ? chartDataRaw : chartDataRaw.reverse()).map(item => ({
                date: item.date,
                revenue: Number(item.revenue)
            }));

            let topQuery = orderRepo.createQueryBuilder("order")
                .innerJoin("order.items", "item")
                .innerJoin("item.variant", "variant")
                .innerJoin("variant.product", "product")
                .select("product.productId", "productId")
                .addSelect("product.name", "productName")
                .addSelect("SUM(item.quantity)", "totalSold")
                .addSelect("SUM(item.price * item.quantity)", "totalRevenue")
                .where("order.status = :status", { status: "completed" });

            if (topFilter === 'custom' && topStart && topEnd) {
                topQuery.andWhere("DATE(order.createdAt) >= :start AND DATE(order.createdAt) <= :end", { start: topStart, end: topEnd });
            } else if (topFilter === 'year') {
                topQuery.andWhere("YEAR(order.createdAt) = YEAR(CURDATE())");
            } else if (topFilter === 'week') {
                topQuery.andWhere("YEARWEEK(order.createdAt, 1) = YEARWEEK(CURDATE(), 1)");
            } else {
                topQuery.andWhere("MONTH(order.createdAt) = MONTH(CURDATE()) AND YEAR(order.createdAt) = YEAR(CURDATE())");
            }

            const topProducts = await topQuery
                .groupBy("product.productId")
                .addGroupBy("product.name")
                .orderBy("totalSold", "DESC")
                .limit(5)
                .getRawMany();

            return res.status(200).json({
                success: true,
                data: {
                    stats: {
                        totalAdmins,
                        totalUsers,
                        totalOrders,
                        totalRevenue
                    },
                    chartData,
                    topProducts
                }
            });

        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu thống kê" });
        }
    };
}