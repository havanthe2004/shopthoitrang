import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post("/", verifyToken, OrderController.createOrder); 
router.get("/vnpay-return", OrderController.vnpayReturn);
router.get("/my-orders", verifyToken, OrderController.getMyOrders);
router.patch("/:orderId/cancel", verifyToken, OrderController.cancelOrder);
router.patch("/:orderId/return", verifyToken, OrderController.returnOrder);
export default router;