import { Router } from "express";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";

const router = Router();

// Route: /api/admin/dashboard
router.get("/", verifyAdminToken, AdminDashboardController.getDashboardData);

export default router;