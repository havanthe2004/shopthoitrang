import { Router } from "express";
import { SystemConfigController } from "../controllers/SystemConfigController";
import { verifyAdminToken, requireRoles } from "../middlewares/adminAuth.middleware";
import { uploadBanner } from "../config/uploaders";

const router = Router();
// Website Config - public GET for storefront
router.get("/website", SystemConfigController.getWebsiteConfig);

// All other system configuration routes require 'admin' role
router.get("/logs", verifyAdminToken, requireRoles("admin"), SystemConfigController.getLogAdmin);
router.put("/website", verifyAdminToken, requireRoles("admin"), SystemConfigController.updateWebsiteConfig);

// Banners
router.get("/banners", verifyAdminToken, requireRoles("admin"), SystemConfigController.getBanners);
router.post("/banners", verifyAdminToken, requireRoles("admin"), uploadBanner.single("banner"), SystemConfigController.addBanner);
router.delete("/banners/:id", verifyAdminToken, requireRoles("admin"), SystemConfigController.deleteBanner);
router.patch("/banners/:id/toggle", verifyAdminToken, requireRoles("admin"), SystemConfigController.toggleBannerStatus);

export default router;