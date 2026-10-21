import { Router } from "express";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import { verifyAdminToken, requireRoles } from "../middlewares/adminAuth.middleware";

const router = Router();

// Route: /api/admin/dashboard
router.get("/", verifyAdminToken, requireRoles("admin", "manager"), AdminDashboardController.getDashboardData);

export default router;