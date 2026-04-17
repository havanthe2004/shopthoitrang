import { Router } from "express";
import { SystemConfigController } from "../controllers/SystemConfigController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";
import { uploadBanner } from "../config/uploaders";

const router = Router();

// Website Config
router.get("/website", SystemConfigController.getWebsiteConfig);
router.put("/website", verifyAdminToken, SystemConfigController.updateWebsiteConfig);

// Banners
router.get("/banners", verifyAdminToken, SystemConfigController.getBanners);
router.post("/banners", verifyAdminToken, uploadBanner.single("banner"), SystemConfigController.addBanner);
router.delete("/banners/:id", verifyAdminToken, SystemConfigController.deleteBanner);
router.patch("/banners/:id/toggle", verifyAdminToken, SystemConfigController.toggleBannerStatus);

export default router;