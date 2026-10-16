import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { verifyToken } from "../middlewares/auth.middleware";
import { verifyAdminToken } from "../middlewares/adminAuth.middleware";

const router = Router();

// [Admin] Lấy danh sách các cuộc hội thoại
router.get("/conversations", verifyAdminToken, ChatController.getConversations);

// [Admin & User] Lấy tin nhắn của 1 cuộc hội thoại (phân trang)
router.get("/conversations/:conversationId/messages", ChatController.getMessages);

// [User] Lấy hoặc tạo cuộc hội thoại của user hiện tại
router.get("/my-conversation", verifyToken, ChatController.getOrCreateUserConversation);

export default router;
