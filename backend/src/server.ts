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

import cors from 'cors';
const app = express();
app.use(express.json());

app.use(cors());
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoute)
app.use("/api/cart", cartRoutes);
app.use("/api/orders",orderRoutes);


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Kết nối databse thành công!");

        app.listen(3000, () => {
            console.log("🚀 Server đang chạy ở http://localhost:3000");
        });
    })
    .catch((err) => {
        console.error("❌ DB error", err);
    });
