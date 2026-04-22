import { Router } from "express";
import { OrderManagementController } from "../controllers/AdminOrderManagementController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";

const router = Router();

router.get("/", verifyAdminToken, OrderManagementController.getOrders);
router.patch("/status/:id", verifyAdminToken, OrderManagementController.updateOrderStatus);
router.patch("/payment/:id", verifyAdminToken, OrderManagementController.updatePaymentStatus);

export default router;