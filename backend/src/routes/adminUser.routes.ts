import { Router } from "express";
import { UserManagementController } from "../controllers/UserManagementController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";

const router = Router();

// Lấy danh sách (Có phân trang, search, lọc)
router.get("/", verifyAdminToken, UserManagementController.getUsers);

// Xem chi tiết
router.get("/:id", verifyAdminToken, UserManagementController.getUserDetail);

// Khóa hoặc mở khóa người dùng
router.patch("/toggle-status/:id", verifyAdminToken, UserManagementController.toggleUserStatus);

export default router;