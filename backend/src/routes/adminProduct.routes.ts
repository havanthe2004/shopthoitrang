import { Router } from "express";
import { AdminProductController } from "../controllers/AdminProductController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";
import { uploadProductImage } from "../config/uploaders";

const router = Router();

// 1. Lấy danh sách sản phẩm (Phân trang, tìm kiếm)
router.get("/", verifyAdminToken, AdminProductController.getProducts);

// 2. Lấy chi tiết sản phẩm (Để đổ dữ liệu vào trang Sửa)
router.get("/:id", verifyAdminToken, AdminProductController.getDetail);

// 3. Thêm mới sản phẩm (Kèm upload nhiều ảnh)
router.post("/", verifyAdminToken, uploadProductImage.any(), AdminProductController.createProduct);

// 4. Cập nhật sản phẩm (Logic chặn sửa/xóa khi có đơn hàng)
router.put("/:id", verifyAdminToken, uploadProductImage.any(), AdminProductController.updateProduct);

// 5. Ẩn/Hiện sản phẩm (Soft Toggle)
router.patch("/toggle/:productId", verifyAdminToken, AdminProductController.toggleProduct);

// 6. Khôi phục biến thể (Bật lại isActive)
router.patch("/restore-variant/:variantId", verifyAdminToken, AdminProductController.restoreVariant);

// 7. Toggle biến thể (Ẩn/Hiện từng size/màu riêng lẻ)
router.patch("/toggle-variant/:variantId", verifyAdminToken, AdminProductController.toggleVariant);

export default router;