import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { getProfile } from "../controllers/admin.controller";

const router = Router();

router.get("/me", auth, getProfile);

export default router;
