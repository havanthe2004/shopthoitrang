import { Router } from "express";
import { PostController } from "../controllers/AdminPostController";
import { uploadPostImage } from "../config/uploaders";
import { verifyAdminToken, requireRoles } from "../middlewares/adminAuth.middleware";


const router = Router();

router.get("/", PostController.getAllPosts);
router.post("/", verifyAdminToken, requireRoles("admin", "manager"), uploadPostImage.single('image'), PostController.createPost);
router.put("/:id", verifyAdminToken, requireRoles("admin", "manager"), uploadPostImage.single('image'), PostController.updatePost);
router.delete("/:id", verifyAdminToken, requireRoles("admin", "manager"), PostController.deletePost);

export default router;