import { Router } from "express";
import { AdminCategoryController } from "../controllers/AdminCategoryController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";
// Middleware verifyAdminToken PHẢI giải mã token và gán req.admin = decoded

const router = Router();

// Gắn middleware bảo vệ cho TẤT CẢ các route bên dưới
router.use(verifyAdminToken);

router.get("/", AdminCategoryController.getAllCategories);
router.get("/level1", AdminCategoryController.getLevel1Categories); // Phục vụ Dropdown
router.get("/level2", AdminCategoryController.getLevel2Categories);
router.post("/", AdminCategoryController.createCategory);
router.put("/:id", AdminCategoryController.updateCategory);
router.patch("/:id/soft-delete", AdminCategoryController.softDeleteCategory); // Đưa vào thùng rác
router.patch("/:id/restore", AdminCategoryController.restoreCategory); // Khôi phục

export default router;