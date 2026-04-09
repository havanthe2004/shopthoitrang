import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Admin } from "../models/Admin";
import { User } from "../models/User";
import { Order } from "../models/Order";

export class AdminDashboardController {
    static getDashboardData = async (req: Request, res: Response) => {
        try {
            // Nhận tham số bộ lọc từ Frontend (Mặc định là 'month')
            const {
                revFilter = 'month', revStart, revEnd,
                topFilter = 'month', topStart, topEnd
            } = req.query;

            const adminRepo = AppDataSource.getRepository(Admin);
            const userRepo = AppDataSource.getRepository(User);
            const orderRepo = AppDataSource.getRepository(Order);

            // ==========================================
            // 1. THỐNG KÊ TỔNG QUAN ALL-TIME
            // ==========================================
            const [totalAdmins, totalUsers, totalOrders] = await Promise.all([
                adminRepo.count(),
                userRepo.count(),
                orderRepo.count()
            ]);

            // Tổng doanh thu (Chỉ tính đơn completed)
            const revResult = await orderRepo.createQueryBuilder("order")
                .select("SUM(order.totalPrice)", "total")
                .where("order.status = :status", { status: "completed" })
                .getRawOne();

            const totalRevenue = revResult?.total ? Number(revResult.total) : 0;

            // ==========================================
            // 2. BIỂU ĐỒ DOANH THU (Lọc Tuần/Tháng/Năm/Tùy chỉnh)
            // ==========================================
            let chartQuery = orderRepo.createQueryBuilder("order")
                .where("order.status = :status", { status: "completed" });

            if (revFilter === 'custom' && revStart && revEnd) {
                // Tùy chỉnh: Gom nhóm theo từng ngày trong khoảng thời gian
                chartQuery.andWhere("DATE(order.createdAt) >= :start AND DATE(order.createdAt) <= :end", { start: revStart, end: revEnd })
                    .select("DATE_FORMAT(order.createdAt, '%Y-%m-%d')", "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy("DATE_FORMAT(order.createdAt, '%Y-%m-%d')")
                    .orderBy("date", "ASC");
            } else if (revFilter === 'year') {
                // Gom nhóm theo năm (5 năm gần nhất)
                chartQuery.select("YEAR(order.createdAt)", "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy("YEAR(order.createdAt)")
                    .orderBy("date", "DESC").limit(5);
            } else if (revFilter === 'week') {
                // Gom nhóm theo tuần (VD: 2023-W45) - 12 tuần gần nhất
                // Dùng chung 1 biểu thức cho cả Select, GroupBy và OrderBy để MySQL không báo lỗi only_full_group_by
                const weekFormat = "CONCAT(YEAR(order.createdAt), '-W', LPAD(WEEK(order.createdAt, 1), 2, '0'))";

                chartQuery.select(weekFormat, "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy(weekFormat)
                    .orderBy(weekFormat, "DESC")
                    .limit(12);
            } else {
                // Mặc định là Tháng: Gom nhóm theo tháng (12 tháng gần nhất)
                chartQuery.select("DATE_FORMAT(order.createdAt, '%Y-%m')", "date")
                    .addSelect("SUM(order.totalPrice)", "revenue")
                    .groupBy("DATE_FORMAT(order.createdAt, '%Y-%m')")
                    .orderBy("date", "DESC").limit(12);
            }

            const chartDataRaw = await chartQuery.getRawMany();

            // Xử lý đảo ngược mảng (nếu lấy từ mới đến cũ thì phải đảo lại để vẽ biểu đồ từ trái sang phải)
            const chartData = (revFilter === 'custom' ? chartDataRaw : chartDataRaw.reverse()).map(item => ({
                date: item.date,
                revenue: Number(item.revenue)
            }));

            // ==========================================
            // 3. TOP SẢN PHẨM BÁN CHẠY (Lọc Tuần/Tháng/Năm/Tùy chỉnh)
            // ==========================================
            let topQuery = orderRepo.createQueryBuilder("order")
                // Nối bảng Order -> OrderItem -> ProductVariant -> Product (Khớp 100% với Entity của bạn)
                .innerJoin("order.items", "item")
                .innerJoin("item.variant", "variant")
                .innerJoin("variant.product", "product")
                .select("product.productId", "productId")
                .addSelect("product.name", "productName")
                .addSelect("SUM(item.quantity)", "totalSold") // Tổng số lượng chiếc bán ra
                .addSelect("SUM(item.price * item.quantity)", "totalRevenue") // Doanh thu từ sản phẩm
                .where("order.status = :status", { status: "completed" });

            // Áp dụng bộ lọc thời gian
            if (topFilter === 'custom' && topStart && topEnd) {
                topQuery.andWhere("DATE(order.createdAt) >= :start AND DATE(order.createdAt) <= :end", { start: topStart, end: topEnd });
            } else if (topFilter === 'year') {
                topQuery.andWhere("YEAR(order.createdAt) = YEAR(CURDATE())"); // Trong năm nay
            } else if (topFilter === 'week') {
                topQuery.andWhere("YEARWEEK(order.createdAt, 1) = YEARWEEK(CURDATE(), 1)"); // Trong tuần này
            } else {
                // Mặc định: Trong tháng này
                topQuery.andWhere("MONTH(order.createdAt) = MONTH(CURDATE()) AND YEAR(order.createdAt) = YEAR(CURDATE())");
            }

            const topProducts = await topQuery
                .groupBy("product.productId")
                .addGroupBy("product.name") // Bắt buộc gom nhóm thêm name để chuẩn SQL Mode
                .orderBy("totalSold", "DESC") // Sắp xếp theo số lượng bán nhiều nhất
                .limit(5) // Lấy top 5
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