import React, { useState, useEffect, useRef, UIEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { searchAPI } from '../../services/productService';

interface ProductData {
    productId: number;
    name: string;
    price: number | string;
    image: string;
    slug: string;
}

interface Conversation {
    id: number;
    user: { userId: number; name: string; avatar: string; email?: string };
    lastMessage: string;
    chatMode?: 'ai' | 'staff';
    unreadAdminCount?: number;
    unreadUserCount?: number;
    updatedAt: string;
}

interface Message {
    id?: number;
    senderType: 'user' | 'admin';
    senderId?: number;
    content: string;
    messageType?: 'text' | 'product';
    productData?: ProductData | null;
    createdAt: string;
    conversation?: any;
}

const SOCKET_URL = import.meta.env.VITE_API_KEY || import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${SOCKET_URL}/api`;

const ChatManagement: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    
    // Pagination states
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Modal chọn sản phẩm gửi cho khách
    const [showProductModal, setShowProductModal] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productList, setProductList] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number>(0);

    const { currentAdmin, adminToken } = useSelector((state: RootState) => state.adminAuth);

    const selectedConv = conversations.find(c => c.id === selectedConvId);

    // Trích xuất ảnh và giá nhỏ nhất của sản phẩm
    const extractProductDetails = (product: any): { minPrice: number; image: string } => {
        const variants = product.variants || [];
        const allPrices = variants.map((v: any) => parseFloat(v.price) || 0);
        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;

        const rawImg = product.colors?.[0]?.images?.[0]?.url || '';
        let image = 'https://via.placeholder.com/150';
        if (rawImg) {
            image = rawImg.startsWith('http') ? rawImg : `${SOCKET_URL}/${rawImg}`;
        }
        return { minPrice, image };
    };

    // Tải danh sách cuộc hội thoại
    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${API_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setConversations(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách hội thoại:", error);
        }
    };

    // Khởi tạo socket và lấy danh sách chat
    useEffect(() => {
        if (!currentAdmin) return;

        fetchConversations();

        socketRef.current = io(SOCKET_URL);

        // Lắng nghe cập nhật danh sách hội thoại
        socketRef.current.on('updateConversationList', () => {
            fetchConversations();
        });

        // Lắng nghe tin nhắn mới
        socketRef.current.on('newMessage', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();

            // Nếu đang xem hội thoại này thì lập tức đánh dấu đã đọc
            if (selectedConvId) {
                socketRef.current?.emit('markAsRead', { conversationId: selectedConvId, readerType: 'admin' });
            }
        });

        // Lắng nghe thay đổi chế độ chat (AI / Staff)
        socketRef.current.on('chatModeChanged', (data: { conversationId: number; chatMode: 'ai' | 'staff' }) => {
            setConversations(prev => prev.map(c => c.id === data.conversationId ? { ...c, chatMode: data.chatMode } : c));
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [currentAdmin, selectedConvId]);

    // Khi chọn cuộc hội thoại (đánh dấu đã đọc ngay lập tức)
    const handleSelectConversation = (convId: number) => {
        setSelectedConvId(convId);
        // Cập nhật số chưa đọc về 0 ngay lập tức ở frontend
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadAdminCount: 0 } : c));

        if (socketRef.current) {
            socketRef.current.emit('markAsRead', { conversationId: convId, readerType: 'admin' });
        }
        axios.patch(`${API_URL}/chat/conversations/${convId}/read`, { readerType: 'admin' }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        }).catch(() => {});
    };

    // Khi chọn cuộc hội thoại khác
    useEffect(() => {
        if (selectedConvId && socketRef.current) {
            socketRef.current.emit('joinRoom', selectedConvId.toString());
            fetchMessages(selectedConvId, null);
        }
    }, [selectedConvId]);

    const fetchMessages = async (convId: number, cursor: string | null) => {
        try {
            setLoadingMore(true);
            let url = `${API_URL}/chat/conversations/${convId}/messages`;
            if (cursor) url += `?cursor=${cursor}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            if (res.data.messages.length > 0) {
                setMessages(prev => {
                    return cursor ? [...res.data.messages, ...prev] : res.data.messages;
                });
                if (!cursor) {
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                    }, 100);
                }
            } else if (!cursor) {
                setMessages([]);
            }
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        if (!hasMore || loadingMore || !selectedConvId) return;
        
        const target = e.target as HTMLDivElement;
        if (target.scrollTop === 0 && messages.length > 0) {
            const oldestMsgCursor = messages[0].createdAt;
            if (oldestMsgCursor) {
                prevScrollHeight.current = target.scrollHeight;
                fetchMessages(selectedConvId, oldestMsgCursor);
            }
        }
    };

    useEffect(() => {
        if (chatBodyRef.current && prevScrollHeight.current > 0) {
            const newScrollHeight = chatBodyRef.current.scrollHeight;
            chatBodyRef.current.scrollTop = newScrollHeight - prevScrollHeight.current;
            prevScrollHeight.current = 0;
        }
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Gửi tin nhắn chữ từ Admin
    const handleSend = () => {
        if (!inputText.trim() || !selectedConvId || !socketRef.current || !currentAdmin) return;

        socketRef.current.emit('sendMessage', {
            conversationId: selectedConvId,
            senderType: 'admin',
            senderId: currentAdmin.adminId || currentAdmin.id, 
            content: inputText,
            messageType: 'text'
        });

        setInputText('');
    };

    // Tải danh sách sản phẩm khi mở modal
    useEffect(() => {
        if (!showProductModal) return;

        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const res = await searchAPI(productSearch.trim());
                if (res && res.data) {
                    setProductList(res.data);
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách sản phẩm:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [showProductModal, productSearch]);

    // Admin gửi thẻ sản phẩm tư vấn cho khách
    const handleSendProduct = (product: any) => {
        if (!selectedConvId || !socketRef.current || !currentAdmin) return;

        const { minPrice, image } = extractProductDetails(product);

        const productPayload: ProductData = {
            productId: product.productId,
            name: product.name,
            price: minPrice,
            image: image,
            slug: product.slug
        };

        socketRef.current.emit('sendMessage', {
            conversationId: selectedConvId,
            senderType: 'admin',
            senderId: currentAdmin.adminId || currentAdmin.id,
            content: `Shop gợi ý cho bạn sản phẩm "${product.name}"`,
            messageType: 'product',
            productData: productPayload
        });

        setShowProductModal(false);
    };

    // Admin chuyển đổi chế độ thủ công nếu muốn
    const handleAdminSwitchMode = (newMode: 'ai' | 'staff') => {
        if (!selectedConvId || !socketRef.current) return;
        socketRef.current.emit('switchChatMode', {
            conversationId: selectedConvId,
            chatMode: newMode
        });
    };

    return (
        <div className="flex h-[82vh] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-sans">
            {/* Cột trái - Danh sách cuộc hội thoại */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col bg-slate-50/50">
                <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-gray-800 text-base">Hội thoại khách hàng</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Tổng số: {conversations.length} hội thoại</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {conversations.map(conv => {
                        const isStaff = conv.chatMode === 'staff';
                        const isSelected = selectedConvId === conv.id;
                        const isUnread = (conv.unreadAdminCount || 0) > 0;

                        return (
                            <div 
                                key={conv.id} 
                                onClick={() => handleSelectConversation(conv.id)}
                                className={`p-3.5 cursor-pointer transition-all hover:bg-gray-100/80 ${
                                    isSelected 
                                        ? 'bg-blue-50/90 border-l-4 border-blue-600 shadow-xs' 
                                        : isUnread 
                                            ? 'bg-amber-50/40 border-l-4 border-amber-500' 
                                            : 'bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className={`text-sm truncate flex items-center gap-1.5 ${
                                        isUnread ? 'font-black text-gray-950' : 'font-semibold text-gray-800'
                                    }`}>
                                        {isUnread && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0 animate-pulse"></span>
                                        )}
                                        <span>{conv.user?.name || conv.user?.email || 'Khách hàng'}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {isUnread && (
                                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-600 text-white min-w-[18px] text-center shadow-xs">
                                                {conv.unreadAdminCount}
                                            </span>
                                        )}
                                        {isStaff ? (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                                                <span>👤 Cần hỗ trợ</span>
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                                                <span>🤖 AI</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-xs truncate mt-1 ${
                                    isUnread ? 'font-bold text-gray-900' : 'font-normal text-gray-500'
                                }`}>
                                    {conv.lastMessage || 'Chưa có tin nhắn...'}
                                </div>
                            </div>
                        );
                    })}
                    {conversations.length === 0 && (
                        <div className="p-8 text-gray-400 text-center text-sm">
                            Chưa có cuộc trò chuyện nào.
                        </div>
                    )}
                </div>
            </div>

            {/* Cột phải - Khung chat chi tiết */}
            <div className="w-2/3 flex flex-col bg-slate-50 relative">
                {selectedConvId ? (
                    <>
                        {/* Header phòng chat */}
                        <div className="p-3.5 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                                    {selectedConv?.user?.name ? selectedConv.user.name.charAt(0).toUpperCase() : 'K'}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <span>{selectedConv?.user?.name || selectedConv?.user?.email || 'Khách hàng'}</span>
                                        {selectedConv?.chatMode === 'staff' ? (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                Khách đang yêu cầu nhân viên hỗ trợ
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                                Khách đang chat với AI
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Hội thoại #{selectedConv?.id}
                                    </div>
                                </div>
                            </div>

                            {/* Nút chuyển chế độ phía Admin */}
                            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => handleAdminSwitchMode('ai')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        selectedConv?.chatMode === 'ai' 
                                            ? 'bg-white text-blue-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    🤖 AI xử lý
                                </button>
                                <button
                                    onClick={() => handleAdminSwitchMode('staff')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        selectedConv?.chatMode === 'staff' 
                                            ? 'bg-white text-amber-700 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    👤 Nhân viên tiếp quản
                                </button>
                            </div>
                        </div>
                        
                        {/* Khu vực hiển thị tin nhắn */}
                        <div 
                            className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 relative"
                            onScroll={handleScroll}
                            ref={chatBodyRef}
                        >
                            {loadingMore && <div className="text-center text-xs text-gray-400">Đang tải tin cũ...</div>}
                            
                            {messages.map((msg, idx) => {
                                const isUser = msg.senderType === 'user';
                                const isAi = msg.senderType === 'admin' && msg.senderId === 0;
                                const isAdmin = msg.senderType === 'admin' && msg.senderId !== 0;

                                const isSystem = msg.senderId === 0 && !msg.productData && (msg.content?.includes('Bạn đã chuyển sang chế độ') || msg.content?.includes('🔔') || msg.content?.includes('👤 Bạn đã chuyển') || msg.content?.includes('🤖 Bạn đã chuyển'));

                                if (isSystem) {
                                    return (
                                        <div key={idx} className="self-center my-1 px-3 py-1 bg-gray-200/90 text-gray-600 rounded-full text-xs text-center max-w-[80%] shadow-xs font-medium">
                                            {msg.content}
                                        </div>
                                    );
                                }

                                // Tin nhắn sản phẩm
                                if (msg.messageType === 'product' && msg.productData) {
                                    const prod = msg.productData;
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`max-w-[70%] rounded-2xl p-3 shadow-xs border ${
                                                isAdmin
                                                    ? 'bg-blue-600 text-white self-end rounded-br-none border-blue-500' 
                                                    : 'bg-white text-gray-800 border-gray-200 self-start rounded-bl-none'
                                            }`}
                                        >
                                            <div className="text-[10px] uppercase font-bold tracking-wider mb-1.5 opacity-80">
                                                {isAdmin ? '🛍️ Bạn đã gửi sản phẩm tư vấn' : '🛍️ Khách gửi sản phẩm'}
                                            </div>
                                            <div className="flex gap-3 items-center bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800">
                                                <img 
                                                    src={prod.image} 
                                                    alt={prod.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold truncate text-gray-900">{prod.name}</div>
                                                    <div className="text-sm font-extrabold text-red-600 mt-1">
                                                        {Number(prod.price) > 0 ? `${Number(prod.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                                    </div>
                                                    <a 
                                                        href={`/product/${prod.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-block mt-1 text-[11px] text-blue-600 font-semibold hover:underline"
                                                    >
                                                        Xem trang sản phẩm →
                                                    </a>
                                                </div>
                                            </div>
                                            {msg.content && (
                                                <div className="mt-2 text-xs opacity-90">{msg.content}</div>
                                            )}
                                        </div>
                                    );
                                }

                                // Tin nhắn văn bản
                                return (
                                    <div 
                                        key={idx} 
                                        className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-xs ${
                                            isAdmin 
                                                ? 'bg-blue-600 text-white self-end rounded-br-none' 
                                                : isAi
                                                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 self-start rounded-bl-none'
                                                    : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none'
                                        }`}
                                    >
                                        <div className="text-[10px] font-bold mb-1 opacity-75">
                                            {isAdmin ? 'Bạn (Quản trị viên)' : isAi ? '🤖 Trợ lý AI trả lời' : (selectedConv?.user?.name || 'Khách hàng')}
                                        </div>
                                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                    </div>
                                );
                            })}
                        <div ref={messagesEndRef} />
                        </div>

                        {/* Ô nhập tin nhắn */}
                        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                            {/* Nút gửi sản phẩm tư vấn */}
                            <button
                                type="button"
                                onClick={() => setShowProductModal(prev => !prev)}
                                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center flex-shrink-0 ${
                                    showProductModal
                                        ? 'bg-blue-50 border-blue-400 text-blue-600'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                                }`}
                                title="Đính kèm sản phẩm tư vấn"
                            >
                                <span className="text-base">🛍️</span>
                            </button>

                            <input 
                                type="text" 
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
                                placeholder="Nhập tin nhắn trả lời khách hàng..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />

                            <button 
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl p-2.5 w-11 h-11 flex items-center justify-center transition-all shadow-sm flex-shrink-0"
                                title="Gửi tin nhắn"
                            >
                                ➤
                            </button>
                        </div>

                        {/* Modal chọn sản phẩm gửi cho khách (nằm ngoài khung cuộn) */}
                        {showProductModal && (
                            <div className="absolute inset-x-6 bottom-20 top-20 bg-white z-30 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <div className="p-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                                        <span>🛍️</span>
                                        <span>Chọn sản phẩm để tư vấn cho khách hàng</span>
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={() => setShowProductModal(false)}
                                        className="text-gray-400 hover:text-gray-700 w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center font-bold text-lg"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="p-2.5 border-b border-gray-100 bg-white">
                                    <input 
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Gõ từ khóa tìm sản phẩm theo tên..."
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 divide-y divide-gray-100">
                                    {loadingProducts && (
                                        <div className="text-center text-xs text-gray-400 py-6">Đang tìm sản phẩm...</div>
                                    )}

                                    {!loadingProducts && productList.length === 0 && (
                                        <div className="text-center text-xs text-gray-400 py-6">
                                            Không tìm thấy sản phẩm nào phù hợp.
                                        </div>
                                    )}

                                    {!loadingProducts && productList.map((p) => {
                                        const { minPrice, image } = extractProductDetails(p);
                                        return (
                                            <div 
                                                key={p.productId} 
                                                className="py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 rounded-xl px-2 transition-colors"
                                            >
                                                <img 
                                                    src={image} 
                                                    alt={p.name} 
                                                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                                                    <div className="text-xs font-bold text-red-600 mt-1">
                                                        {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendProduct(p)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0 shadow-xs"
                                                >
                                                    Gửi cho khách
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <span className="text-4xl">💬</span>
                        <p className="text-sm font-medium">Chọn một cuộc hội thoại bên trái để bắt đầu trò chuyện</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;
