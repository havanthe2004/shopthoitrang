import { Router } from "express";
import { AdminManagementController } from "../controllers/AdminController";
import { verifyAdminToken, requireRoles } from "../middlewares/adminAuth.middleware";

const router = Router();

router.get("/", verifyAdminToken, requireRoles("admin", "manager"), AdminManagementController.getAdmins);
router.post("/", verifyAdminToken, requireRoles("admin", "manager"), AdminManagementController.createAdmin);
router.put("/:id", verifyAdminToken, requireRoles("admin"), AdminManagementController.updateAdmin);
router.patch("/toggle/:id", verifyAdminToken, requireRoles("admin", "manager"), AdminManagementController.toggleStatus);

export default router;