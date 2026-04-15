import { Router } from "express";
import { AdminProfileController } from "../controllers/AdminProfileController";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";
import { uploadAdminAvatar } from "../config/uploaders"; 

const router = Router();

// Lấy thông tin cá nhân
router.get("/me", verifyAdminToken, AdminProfileController.getMyProfile);

// Cập nhật thông tin + upload avatar (trường 'avatar')
router.put(
    "/update", 
    verifyAdminToken, 
    uploadAdminAvatar.single('avatar'), 
    AdminProfileController.updateProfile
);

export default router;