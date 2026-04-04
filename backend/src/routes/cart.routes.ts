// backend/src/routes/cartRoutes.ts
import { Router } from "express";
import { CartController } from "../controllers/CartController";
import { verifyToken } from "../middlewares/auth.middleware"; // Quan trọng: Phải có để lấy req.user.id

const router = Router();

router.get("/", verifyToken, CartController.getCart);
router.post("/add", verifyToken, CartController.addToCart);
router.put("/update/:variantId", verifyToken, CartController.updateQuantity);
router.delete("/delete/:variantId", verifyToken, CartController.removeFromCart);

export default router;