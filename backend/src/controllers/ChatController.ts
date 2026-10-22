import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { LessThan } from "typeorm";

export class ChatController {
    // [Admin] Lấy danh sách các cuộc hội thoại
    static async getConversations(req: Request, res: Response) {
        try {
            const conversationRepo = AppDataSource.getRepository(Conversation);
            
            const conversations = await conversationRepo.find({
                order: {
                    updatedAt: "DESC"
                },
                relations: ["user"]
            });
            
            res.json(conversations);
        } catch (error) {
            console.error("Lỗi getConversations:", error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Lấy tin nhắn của một cuộc hội thoại, phân trang 40 tin nhắn
    static async getMessages(req: Request, res: Response) {
        try {
            const conversationId = Number(req.params.conversationId);
            const cursor = req.query.cursor ? new Date(req.query.cursor as string) : null;
            const limit = 40;

            const messageRepo = AppDataSource.getRepository(Message);
            
            const whereCondition: any = {
                conversation: { id: conversationId }
            };

            // Nếu có cursor, lấy những tin nhắn tạo TRƯỚC thời điểm cursor (cũ hơn)
            if (cursor) {
                whereCondition.createdAt = LessThan(cursor);
            }

            const messages = await messageRepo.find({
                where: whereCondition,
                order: {
                    createdAt: "DESC" // Mới nhất lên trước để lấy 40 cái gần nhất so với cursor
                },
                take: limit
            });

            // Revert lại thứ tự thành ASC (cũ -> mới) để dễ render ở frontend
            const sortedMessages = messages.reverse();

            const hasMore = messages.length === limit;

            res.json({
                messages: sortedMessages,
                hasMore
            });
        } catch (error) {
            console.error("Lỗi getMessages:", error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    // [User] Lấy hoặc tạo cuộc hội thoại cho user hiện tại
    static async getOrCreateUserConversation(req: Request, res: Response) {
        try {
            // Trong auth.middleware, payload chứa { id: ... } chứ không phải userId
            const userId = (req as any).user.id;
            const conversationRepo = AppDataSource.getRepository(Conversation);

            let conversation = await conversationRepo.findOne({
                where: { user: { userId } }
            });

            if (!conversation) {
                const user = await AppDataSource.getRepository(User).findOneBy({ userId });
                if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

                conversation = new Conversation();
                conversation.user = user;
                conversation.chatMode = "ai";
                await conversationRepo.save(conversation);
            } else if (!conversation.chatMode) {
                conversation.chatMode = "ai";
                await conversationRepo.save(conversation);
            }

            res.json(conversation);
        } catch (error) {
            console.error("Lỗi getOrCreateUserConversation:", error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Cập nhật chế độ chat (ai / staff)
    static async switchChatMode(req: Request, res: Response) {
        try {
            const conversationId = Number(req.params.conversationId);
            const { chatMode } = req.body;
            if (!["ai", "staff"].includes(chatMode)) {
                return res.status(400).json({ message: "Chế độ chat không hợp lệ (ai hoặc staff)" });
            }

            const conversationRepo = AppDataSource.getRepository(Conversation);
            const conversation = await conversationRepo.findOneBy({ id: conversationId });
            if (!conversation) return res.status(404).json({ message: "Không tìm thấy hội thoại" });

            conversation.chatMode = chatMode;
            await conversationRepo.save(conversation);

            return res.json({ success: true, chatMode: conversation.chatMode });
        } catch (error) {
            console.error("Lỗi switchChatMode:", error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Đánh dấu đã đọc tin nhắn
    static async markAsRead(req: Request, res: Response) {
        try {
            const conversationId = Number(req.params.conversationId);
            const { readerType } = req.body; // 'admin' | 'user'

            const conversationRepo = AppDataSource.getRepository(Conversation);
            const messageRepo = AppDataSource.getRepository(Message);

            const conversation = await conversationRepo.findOneBy({ id: conversationId });
            if (!conversation) return res.status(404).json({ message: "Không tìm thấy hội thoại" });

            if (readerType === "admin") {
                conversation.unreadAdminCount = 0;
                await conversationRepo.save(conversation);
                await messageRepo.update(
                    { conversation: { id: conversationId }, senderType: "user", isRead: false },
                    { isRead: true }
                );
            } else {
                conversation.unreadUserCount = 0;
                await conversationRepo.save(conversation);
                await messageRepo.update(
                    { conversation: { id: conversationId }, senderType: "admin", isRead: false },
                    { isRead: true }
                );
            }

            return res.json({ success: true });
        } catch (error) {
            console.error("Lỗi markAsRead:", error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }
}
