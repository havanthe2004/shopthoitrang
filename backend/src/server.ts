import "dotenv/config";
import express from "express";
import path from 'path';
import productRoutes from "./routes/product.route";
import { AppDataSource } from "./config/data-source";
import authRoute from './routes/auth.route';
import categoryRoute from "./routes/category.routes";
import userRoutes from "./routes/user.routes";
import cartRoutes from "./routes/cart.routes"
import orderRoutes from "./routes/order.routes"
import { seedAdmin } from "./seeds/admin.seed";

// import của admin
import adminAuthRoutes from './routes/adminAuth.routes';
import adminDashboardRoutes from './routes/adminDashboard.routes';
import adminCategoryRoutes from './routes/adminCategory.routes';
import adminProductRoutes from './routes/adminProduct.routes'
import adminManagementRoutes from "./routes/adminManagement.routes";
import adminStockRoutes from "./routes/adminStock.routes";
import adminOrderRoutes from "./routes/adminOrder.routes";
import adminUserRoutes from "./routes/adminUser.routes";

import cors from 'cors';
const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use(cors());
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoute)
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


//admin
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/admin-management", adminManagementRoutes);
app.use("/api/admin/stock", adminStockRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);
AppDataSource.initialize()
    .then(async () => {
        console.log("✅ Kết nối databse thành công!");
        await seedAdmin();
        app.listen(3000, () => {
            console.log("🚀 Server đang chạy ở http://localhost:3000");
        });
    })
    .catch((err) => {
        console.error("❌ DB error", err);
    });
