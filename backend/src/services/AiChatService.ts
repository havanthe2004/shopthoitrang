import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppDataSource } from "../config/data-source";
import { Message } from "../models/Message";
import { Product } from "../models/Product";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export class AiChatService {
    static async generateResponse(conversationId: number, userMessage: string): Promise<string> {
        try {
            if (!apiKey) {
                return "Xin lỗi, hiện tại tính năng AI chưa được cấu hình API Key. Vui lòng liên hệ quản trị viên.";
            }

            // Lấy lịch sử tin nhắn để cung cấp ngữ cảnh cho AI (tùy chọn)
            const messageRepo = AppDataSource.getRepository(Message);
            const historyMessages = await messageRepo.find({
                where: { conversation: { id: conversationId } },
                order: { createdAt: "ASC" },
                take: 10 // Lấy 10 tin nhắn gần nhất làm ngữ cảnh
            });

            // --- 1. DỮ LIỆU ĐẦU VÀO (KNOWLEDGE BASE) ĐỘNG TỪ DATABASE ---
            // Lấy danh sách sản phẩm đang bán (tối đa 20 sản phẩm để không làm tràn context của AI)
            const productRepo = AppDataSource.getRepository(Product);
            const products = await productRepo.find({
                where: { isActive: true },
                relations: ["variants", "variants.color", "category"],
                take: 20 
            });

            let productInfo = "Danh sách sản phẩm cửa hàng đang có:\n";
            products.forEach((p: any) => {
                productInfo += `- ${p.name} (Danh mục: ${p.category?.name || 'Khác'}):\n`;
                // Liệt kê các biến thể (màu, size, giá, tồn kho)
                if (p.variants && p.variants.length > 0) {
                    p.variants.forEach((v: any) => {
                        productInfo += `  + Màu ${v.color?.colorName || 'Mặc định'}, Size ${v.size}: Giá ${v.price} VNĐ (Tồn kho: ${v.stock > 0 ? v.stock : 'Hết hàng'})\n`;
                    });
                } else {
                    productInfo += `  + Hiện chưa có thông tin chi tiết.\n`;
                }
            });

            const shopKnowledge = `
            Thông tin cửa hàng:
            - Tên: Shop Thời Trang (Fashion Shop)
            - Chính sách: Đổi trả miễn phí trong 7 ngày nếu lỗi. Phí ship toàn quốc 30k, freeship đơn trên 500k.
            
            ${productInfo}
            `;

            // Chuyển đổi lịch sử thành định dạng phù hợp
            let context = `Bạn là nhân viên hỗ trợ khách hàng của một cửa hàng thời trang. Khách hàng chỉ được phép hỏi, còn bạn dựa vào dữ liệu hệ thống (sản phẩm, giá, tồn kho) để trả lời. Hãy trả lời tự nhiên, ngắn gọn, thân thiện và hữu ích bằng tiếng Việt.\nDựa vào thông tin cửa hàng và sản phẩm sau để tư vấn:\n${shopKnowledge}\n\n`;
            context += "Lịch sử trò chuyện:\n";
            historyMessages.forEach(msg => {
                const sender = msg.senderType === 'user' ? 'Khách hàng' : 'Cửa hàng';
                context += `${sender}: ${msg.content}\n`;
            });
            context += `Khách hàng: ${userMessage}\nCửa hàng:`;

            // Gọi API Gemini
            const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
            const result = await model.generateContent(context);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error: any) {
            console.error("\n=== LỖI KHI GỌI AI ===");
            console.error(error?.message || error);
            console.error("======================\n");
            
            if (error?.message?.includes("API key not valid")) {
                return "Lỗi: API Key không hợp lệ. Vui lòng kiểm tra lại.";
            }
            return "Lỗi kết nối AI (Code đã update). Vui lòng check Terminal backend để xem chi tiết lỗi.";
        }
    }
}
