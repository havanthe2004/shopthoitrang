import { Router } from "express";
import { PostController } from "../controllers/AdminPostController";
import { uploadPostImage } from "../config/uploaders";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";


const router = Router();

router.get("/", PostController.getAllPosts);
router.post("/", verifyAdminToken, uploadPostImage.single('image'), PostController.createPost);
router.put("/:id", verifyAdminToken, uploadPostImage.single('image'), PostController.updatePost);
router.delete("/:id", verifyAdminToken, PostController.deletePost);

export default router;