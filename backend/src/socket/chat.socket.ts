import { Server, Socket } from "socket.io";
import { AppDataSource } from "../config/data-source";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import jwt from "jsonwebtoken";
import { AiChatService } from "../services/AiChatService";

export const initializeSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("Client connected:", socket.id);

        // Join room theo conversationId
        socket.on("joinRoom", (conversationId: string) => {
            socket.join(`room_${conversationId}`);
            console.log(`Socket ${socket.id} joined room_${conversationId}`);
        });

        // Xử lý gửi tin nhắn
        socket.on("sendMessage", async (data: {
            conversationId: number,
            senderType: "user" | "admin",
            senderId: number,
            content: string
        }) => {
            try {
                const messageRepo = AppDataSource.getRepository(Message);
                const conversationRepo = AppDataSource.getRepository(Conversation);

                const conversation = await conversationRepo.findOneBy({ id: data.conversationId });
                if (!conversation) return;

                // Tạo tin nhắn mới
                const newMessage = new Message();
                newMessage.conversation = conversation;
                newMessage.senderType = data.senderType;
                newMessage.senderId = data.senderId;
                newMessage.content = data.content;
                
                await messageRepo.save(newMessage);

                // Cập nhật lastMessage và updatedAt cho Conversation
                conversation.lastMessage = data.content;
                conversation.updatedAt = new Date();
                await conversationRepo.save(conversation);

                // Gửi tin nhắn mới tới những người trong phòng (bao gồm cả người gửi để họ xác nhận)
                io.to(`room_${data.conversationId}`).emit("newMessage", newMessage);
                
                // Gửi sự kiện cập nhật danh sách chat cho Admin
                io.emit("updateConversationList");

                // Nếu người gửi là user, gọi AI để trả lời tự động
                if (data.senderType === "user") {
                    const aiResponseText = await AiChatService.generateResponse(conversation.id, data.content);

                    const aiMessage = new Message();
                    aiMessage.conversation = conversation;
                    aiMessage.senderType = "admin"; // Giả lập admin trả lời
                    aiMessage.senderId = 0; // 0 hoặc ID mặc định cho AI (system)
                    aiMessage.content = aiResponseText;

                    await messageRepo.save(aiMessage);

                    conversation.lastMessage = aiResponseText;
                    conversation.updatedAt = new Date();
                    await conversationRepo.save(conversation);

                    io.to(`room_${data.conversationId}`).emit("newMessage", aiMessage);
                    io.emit("updateConversationList");
                }
                
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn qua socket:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};
