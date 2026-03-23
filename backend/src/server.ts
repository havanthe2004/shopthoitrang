import "dotenv/config";
import express from "express";
import path from 'path';
import { AppDataSource } from "./config/data-source";
import authRoute from './routes/auth.route';


import cors from 'cors';
const app = express();
app.use(express.json());

app.use(cors());
app.use('/api/auth', authRoute);



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
