import { Server, Socket } from "socket.io";
import { AppDataSource } from "../config/data-source";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { AiChatService } from "../services/AiChatService";

let ioInstance: Server | null = null;

export const setIO = (io: Server) => {
    ioInstance = io;
};

export const getIO = (): Server | null => {
    return ioInstance;
};

/**
 * Phát sự kiện đơn hàng mới tới các client quản trị
 */
export const notifyNewOrder = (orderData: any) => {
    if (ioInstance) {
        ioInstance.emit("newOrder", orderData);
    }
};

/**
 * Phát sự kiện trạng thái đơn hàng thay đổi tới các client quản trị
 */
export const notifyOrderStatusChanged = (orderData: any) => {
    if (ioInstance) {
        ioInstance.emit("orderStatusChanged", orderData);
    }
};

export const initializeSocket = (io: Server) => {
    setIO(io);

    io.on("connection", (socket: Socket) => {
        console.log("Client connected:", socket.id);

        // Join room theo conversationId
        socket.on("joinRoom", (conversationId: string) => {
            socket.join(`room_${conversationId}`);
            console.log(`Socket ${socket.id} joined room_${conversationId}`);
        });

        // Chuyển đổi chế độ chat giữa AI và Nhân viên
        socket.on("switchChatMode", async (data: {
            conversationId: number,
            chatMode: "ai" | "staff"
        }) => {
            try {
                const conversationRepo = AppDataSource.getRepository(Conversation);
                const messageRepo = AppDataSource.getRepository(Message);

                const conversation = await conversationRepo.findOne({
                    where: { id: data.conversationId },
                    relations: ["user"]
                });
                if (!conversation) return;

                conversation.chatMode = data.chatMode;
                await conversationRepo.save(conversation);

                // Tạo tin nhắn hệ thống thông báo đổi chế độ
                const systemMessage = new Message();
                systemMessage.conversation = conversation;
                systemMessage.senderType = "admin";
                systemMessage.senderId = 0;
                systemMessage.messageType = "text";
                systemMessage.content = data.chatMode === "staff"
                    ? "👤 Đã chuyển sang chế độ chat với Nhân viên hỗ trợ. Nhân viên của shop sẽ phản hồi trong giây lát!"
                    : "🤖 Đã chuyển sang chế độ chat với Trợ lý ảo AI. AI sẵn sàng hỗ trợ bạn 24/7!";

                await messageRepo.save(systemMessage);

                conversation.lastMessage = systemMessage.content;
                conversation.updatedAt = new Date();
                await conversationRepo.save(conversation);

                // Gửi sự kiện cập nhật chế độ và tin nhắn hệ thống tới phòng chat
                io.to(`room_${data.conversationId}`).emit("newMessage", systemMessage);
                io.to(`room_${data.conversationId}`).emit("chatModeChanged", {
                    conversationId: data.conversationId,
                    chatMode: data.chatMode
                });
                io.emit("updateConversationList");
            } catch (error) {
                console.error("Lỗi khi chuyển đổi chế độ chat qua socket:", error);
            }
        });

        // Xử lý gửi tin nhắn
        socket.on("sendMessage", async (data: {
            conversationId: number,
            senderType: "user" | "admin",
            senderId: number,
            content: string,
            messageType?: "text" | "product",
            productData?: any
        }) => {
            try {
                const messageRepo = AppDataSource.getRepository(Message);
                const conversationRepo = AppDataSource.getRepository(Conversation);

                const conversation = await conversationRepo.findOne({
                    where: { id: data.conversationId },
                    relations: ["user"]
                });
                if (!conversation) return;

                const messageType = data.messageType || "text";
                const productData = data.productData || null;

                // Tạo tin nhắn mới
                const newMessage = new Message();
                newMessage.conversation = conversation;
                newMessage.senderType = data.senderType;
                newMessage.senderId = data.senderId;
                newMessage.content = data.content;
                newMessage.messageType = messageType;
                newMessage.productData = productData;

                await messageRepo.save(newMessage);

                // Cập nhật số tin nhắn chưa đọc
                if (data.senderType === "user") {
                    conversation.unreadAdminCount = (conversation.unreadAdminCount || 0) + 1;
                } else {
                    conversation.unreadUserCount = (conversation.unreadUserCount || 0) + 1;
                }

                // Cập nhật lastMessage và updatedAt cho Conversation
                const lastMsgPreview = messageType === "product" && productData
                    ? `[Sản phẩm] ${productData.name}`
                    : data.content;

                conversation.lastMessage = lastMsgPreview;
                conversation.updatedAt = new Date();
                await conversationRepo.save(conversation);

                // Gửi tin nhắn mới tới những người trong phòng (bao gồm cả người gửi để họ xác nhận)
                io.to(`room_${data.conversationId}`).emit("newMessage", newMessage);

                // Gửi sự kiện cập nhật danh sách chat cho Admin
                io.emit("updateConversationList");

                // Nếu người gửi là user (khách hàng), bắn sự kiện thông báo tin nhắn mới cho Admin
                if (data.senderType === "user") {
                    const senderName = conversation.user?.name || conversation.user?.email || "Khách hàng";
                    const currentMode = conversation.chatMode || "ai";

                    io.emit("newChatMessage", {
                        conversationId: data.conversationId,
                        senderType: data.senderType,
                        senderId: data.senderId,
                        senderName: senderName,
                        content: lastMsgPreview,
                        createdAt: newMessage.createdAt,
                        chatMode: currentMode
                    });

                    // CHỈ GỌI AI KHI ĐANG Ở CHẾ ĐỘ 'ai' (Mặc định nếu chưa chọn là 'ai')
                    if (currentMode === "ai") {
                        let promptText = data.content;
                        if (messageType === "product" && productData) {
                            promptText = `Khách hàng vừa chia sẻ sản phẩm: "${productData.name}" (Giá: ${Number(productData.price).toLocaleString('vi-VN')} VNĐ). Hãy chào khách và hỏi xem khách cần tư vấn gì về kích cỡ, chất liệu hay sản phẩm này.`;
                        }

                        // Gọi AI để trả lời tự động cho khách
                        const aiResponseText = await AiChatService.generateResponse(conversation.id, promptText);

                        const aiMessage = new Message();
                        aiMessage.conversation = conversation;
                        aiMessage.senderType = "admin"; // Giả lập admin / bot trả lời
                        aiMessage.senderId = 0; // 0 cho AI (system)
                        aiMessage.messageType = "text";
                        aiMessage.content = aiResponseText;

                        await messageRepo.save(aiMessage);

                        conversation.unreadUserCount = (conversation.unreadUserCount || 0) + 1;
                        conversation.lastMessage = aiResponseText;
                        conversation.updatedAt = new Date();
                        await conversationRepo.save(conversation);

                        io.to(`room_${data.conversationId}`).emit("newMessage", aiMessage);
                        io.emit("updateConversationList");
                    }
                }

            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn qua socket:", error);
            }
        });

        // Đánh dấu đã đọc tin nhắn
        socket.on("markAsRead", async (data: {
            conversationId: number,
            readerType: "user" | "admin"
        }) => {
            try {
                const conversationRepo = AppDataSource.getRepository(Conversation);
                const messageRepo = AppDataSource.getRepository(Message);

                const conversation = await conversationRepo.findOneBy({ id: data.conversationId });
                if (!conversation) return;

                if (data.readerType === "admin") {
                    conversation.unreadAdminCount = 0;
                    await conversationRepo.save(conversation);
                    await messageRepo.update(
                        { conversation: { id: data.conversationId }, senderType: "user", isRead: false },
                        { isRead: true }
                    );
                    io.emit("updateConversationList");
                } else {
                    conversation.unreadUserCount = 0;
                    await conversationRepo.save(conversation);
                    await messageRepo.update(
                        { conversation: { id: data.conversationId }, senderType: "admin", isRead: false },
                        { isRead: true }
                    );
                }
            } catch (error) {
                console.error("Lỗi khi xử lý markAsRead qua socket:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};
