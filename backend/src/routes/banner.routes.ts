import { Router } from "express";
import { BannerController } from "../controllers/BannerController";

const router = Router();

router.get("/active", BannerController.getActiveBanners);

export default router;