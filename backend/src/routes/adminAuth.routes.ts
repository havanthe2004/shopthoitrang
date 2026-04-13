import { Router } from "express";
import { AdminAuthController } from "../controllers/AdminAuthController";

const router = Router();

// [POST] /api/admin/auth/login
router.post("/login", AdminAuthController.adminLogin);

// [POST] /api/admin/auth/refresh-token
router.post("/refresh-token", AdminAuthController.refreshAdminToken);

// [POST] /api/admin/auth/logout
router.post("/logout", AdminAuthController.adminLogout);

export default router;