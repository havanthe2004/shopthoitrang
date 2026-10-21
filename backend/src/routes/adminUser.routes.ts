import { Router } from "express";
import { UserManagementController } from "../controllers/AdminUserManagementController";
import { verifyAdminToken, requireRoles } from "../middlewares/adminAuth.middleware";

const router = Router();

// Lấy danh sách (Có phân trang, search, lọc)
router.get("/", verifyAdminToken, requireRoles("admin", "manager"), UserManagementController.getUsers);

// Xem chi tiết
router.get("/:id", verifyAdminToken, requireRoles("admin", "manager"), UserManagementController.getUserDetail);

// Khóa hoặc mở khóa người dùng
router.patch("/toggle-status/:id", verifyAdminToken, requireRoles("admin", "manager"), UserManagementController.toggleUserStatus);

export default router;