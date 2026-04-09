import { Router } from "express";
import { AdminManagementController } from "../controllers/AdminController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";

const router = Router();

router.get("/", verifyAdminToken, AdminManagementController.getAdmins);
router.post("/", verifyAdminToken, AdminManagementController.createAdmin);
router.put("/:id", verifyAdminToken, AdminManagementController.updateAdmin);
router.patch("/toggle/:id", verifyAdminToken, AdminManagementController.toggleStatus);

export default router;