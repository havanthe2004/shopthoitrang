import { Router } from "express";
import { AdminProductController } from "../controllers/AdminProductController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";
import { uploadProductImage } from "../config/uploaders";

const router = Router();

router.get("/", verifyAdminToken, AdminProductController.getProducts);

router.get("/:id", verifyAdminToken, AdminProductController.getDetail);

router.post("/", verifyAdminToken, uploadProductImage.any(), AdminProductController.createProduct);

router.put("/:id", verifyAdminToken, uploadProductImage.any(), AdminProductController.updateProduct);

router.patch("/toggle/:productId", verifyAdminToken, AdminProductController.toggleProduct);

router.patch("/toggle-variant/:variantId", verifyAdminToken, AdminProductController.toggleVariant);

export default router;