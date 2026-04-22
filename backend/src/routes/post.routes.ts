import { Router } from "express";
import { PostController } from "../controllers/PostController";


const router = Router();
router.get('/new-post', PostController.getLatestPosts);
router.get('/posts-latest', PostController.getLatestPosts)
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostDetail);

export default router;