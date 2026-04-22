import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { Post } from '../models/Post';

const router = Router();
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostDetail);
router.get('/new-post', PostController.getLatestPosts);
export default router;