import "reflect-metadata";
import { DataSource } from "typeorm";

import { Product } from "../models/Product";
import { Address } from "../models/Address";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import { Admin } from "../models/Admin";
import { AdminLog } from "../models/AdminLog";
import { Banner } from "../models/Banner";
import { OrderItem } from "../models/OrderItem";
import { Post } from "../models/Post";
import { ProductImage } from "../models/ProductImage";
import { ProductVariant } from "../models/ProductVariant";
import { RefreshToken } from "../models/RefreshToken";
import { User } from "../models/User";
import { Voucher } from "../models/Voucher";
import { WebsiteConfig } from "../models/WebsiteConfig";
import { AdminRefreshToken } from "../models/AdminRefreshToken";
import { Otp } from "../models/Otp";

import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [Product, Address, Cart, CartItem, Category, Order, Admin, AdminLog, Banner, OrderItem,
        Post, ProductImage, ProductVariant, RefreshToken, User, Voucher, WebsiteConfig, AdminRefreshToken,Otp
    ],
});
