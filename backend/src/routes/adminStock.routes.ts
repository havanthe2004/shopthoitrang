import { Router } from "express";
import { StockController } from "../controllers/StockController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";

const router = Router();

router.get("/", verifyAdminToken, StockController.getStock);
router.patch("/update/:id", verifyAdminToken, StockController.updateStock);

export default router;