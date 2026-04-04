import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post("/", verifyToken, OrderController.createOrder); 
router.get("/vnpay-return", OrderController.vnpayReturn);

export default router;