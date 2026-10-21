import { Router } from "express";
import { AdminCategoryController } from "../controllers/AdminCategoryController";
import { verifyAdminToken, requireRoles } from "../middlewares/adminAuth.middleware";

const router = Router();

// Gắn middleware bảo vệ cho TẤT CẢ các route bên dưới
router.use(verifyAdminToken);

// Danh mục cấp 1, cấp 2 dùng chung cho cả admin, manager, staff khi tạo/sửa sản phẩm
router.get("/level1", AdminCategoryController.getLevel1Categories);
router.get("/level2", AdminCategoryController.getLevel2Categories);

// Các chức năng quản lý danh mục dành riêng cho admin và manager
router.get("/", requireRoles("admin", "manager"), AdminCategoryController.getAllCategories);
router.post("/", requireRoles("admin", "manager"), AdminCategoryController.createCategory);
router.put("/:id", requireRoles("admin", "manager"), AdminCategoryController.updateCategory);
router.patch("/:id/soft-delete", requireRoles("admin", "manager"), AdminCategoryController.softDeleteCategory);
router.patch("/:id/restore", requireRoles("admin", "manager"), AdminCategoryController.restoreCategory);

export default router;