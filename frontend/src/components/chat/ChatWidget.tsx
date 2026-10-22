import React, { useState, useEffect, useRef, UIEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { searchAPI } from '../../services/productService';
import { playNotificationSound } from '../../utils/soundUtils';

interface ProductData {
    productId: number;
    name: string;
    price: number | string;
    image: string;
    slug: string;
}

interface Message {
    id?: number;
    senderType: 'user' | 'admin';
    senderId?: number;
    content: string;
    messageType?: 'text' | 'product';
    productData?: ProductData | null;
    createdAt?: string;
}

const SOCKET_URL = import.meta.env.VITE_API_KEY || import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [chatMode, setChatMode] = useState<'ai' | 'staff'>('ai');
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [authError, setAuthError] = useState(false);

    // Thông báo tin nhắn chưa đọc bên khách hàng
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [latestAdminMessage, setLatestAdminMessage] = useState<Message | null>(null);
    const [showToastNotification, setShowToastNotification] = useState<boolean>(false);
    const isOpenRef = useRef(isOpen);

    // Modal chọn sản phẩm
    const [showProductModal, setShowProductModal] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productList, setProductList] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number>(0);

    const { currentUser } = useSelector((state: RootState) => state.auth);

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

    // Đồng bộ ref của isOpen để socket callback luôn biết trạng thái đóng/mở
    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            setUnreadCount(0);
            setShowToastNotification(false);
            scrollToBottom();
            if (conversationId && socketRef.current) {
                socketRef.current.emit('markAsRead', { conversationId, readerType: 'user' });
                api.patch(`/chat/conversations/${conversationId}/read`, { readerType: 'user' }).catch(() => {});
            }
        }
    }, [isOpen, conversationId]);

    // Khởi tạo cuộc hội thoại và kết nối socket luôn khi user đăng nhập (để nhận thông báo cả khi đóng chat)
    useEffect(() => {
        if (!currentUser) return;

        let isMounted = true;

        const initChat = async () => {
            try {
                setAuthError(false);
                const res = await api.get('/chat/my-conversation');
                const conv = res.data;
                const convId = conv.id;
                if (!isMounted) return;

                setConversationId(convId);
                if (conv.chatMode) {
                    setChatMode(conv.chatMode);
                }
                if (conv.unreadUserCount && conv.unreadUserCount > 0) {
                    setUnreadCount(conv.unreadUserCount);
                }

                // Tải tin nhắn ban đầu
                await fetchMessages(convId, null);

                // Kết nối socket
                if (!socketRef.current) {
                    socketRef.current = io(SOCKET_URL);
                    socketRef.current.emit('joinRoom', convId.toString());

                    // Nhận tin nhắn mới
                    socketRef.current.on('newMessage', (msg: Message) => {
                        setMessages(prev => [...prev, msg]);

                        // Nếu là tin nhắn từ admin hoặc AI
                        if (msg.senderType === 'admin') {
                            setLatestAdminMessage(msg);

                            // Nếu đang mở chat thì cuộn xuống và đánh dấu đọc
                            if (isOpenRef.current) {
                                scrollToBottom();
                                socketRef.current?.emit('markAsRead', { conversationId: convId, readerType: 'user' });
                                api.patch(`/chat/conversations/${convId}/read`, { readerType: 'user' }).catch(() => {});
                            } else {
                                // Nếu đang đóng chat thì tăng badge, hiện popover thông báo và phát chuông
                                setUnreadCount(prev => prev + 1);
                                setShowToastNotification(true);
                                playNotificationSound();
                            }
                        } else {
                            scrollToBottom();
                        }
                    });

                    // Lắng nghe sự kiện chuyển đổi chế độ
                    socketRef.current.on('chatModeChanged', (data: { conversationId: number; chatMode: 'ai' | 'staff' }) => {
                        if (data.conversationId === convId) {
                            setChatMode(data.chatMode);
                        }
                    });
                }
            } catch (error: any) {
                console.error("Lỗi khởi tạo chat:", error);
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    setAuthError(true);
                }
            }
        };

        initChat();

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    // Tải tin nhắn phân trang
    const fetchMessages = async (convId: number, cursor: string | null) => {
        try {
            setLoadingMore(true);
            let url = `/chat/conversations/${convId}/messages`;
            if (cursor) url += `?cursor=${cursor}`;

            const res = await api.get(url);

            if (res.data.messages.length > 0) {
                setMessages(prev => {
                    return cursor ? [...res.data.messages, ...prev] : res.data.messages;
                });
                if (!cursor) {
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                    }, 100);
                }
            }
            setHasMore(res.data.hasMore);
        } catch (error: any) {
            console.error("Lỗi tải tin nhắn:", error);
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                setAuthError(true);
            }
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        if (!hasMore || loadingMore || !conversationId) return;

        const target = e.target as HTMLDivElement;
        if (target.scrollTop === 0 && messages.length > 0) {
            const oldestMsgCursor = messages[0].createdAt;
            if (oldestMsgCursor) {
                prevScrollHeight.current = target.scrollHeight;
                fetchMessages(conversationId, oldestMsgCursor);
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

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen]);

    // Chuyển đổi chế độ chat (AI <-> Nhân viên)
    const handleSwitchMode = (newMode: 'ai' | 'staff') => {
        if (chatMode === newMode || !conversationId) return;
        setChatMode(newMode);

        if (socketRef.current) {
            socketRef.current.emit('switchChatMode', {
                conversationId,
                chatMode: newMode
            });
        }
        api.patch(`/chat/conversations/${conversationId}/mode`, { chatMode: newMode }).catch(() => {});
    };

    // Gửi tin nhắn chữ
    const handleSend = () => {
        if (!inputText.trim()) return;
        if (!conversationId || !socketRef.current || !currentUser) return;

        socketRef.current.emit('sendMessage', {
            conversationId,
            senderType: 'user',
            senderId: currentUser.id || currentUser.userId,
            content: inputText,
            messageType: 'text'
        });

        setInputText('');
    };

    // Tải danh sách sản phẩm khi mở modal chọn sản phẩm
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

    // Gửi thẻ sản phẩm vào chat
    const handleSendProduct = (product: any) => {
        if (!conversationId || !socketRef.current || !currentUser) return;

        const { minPrice, image } = extractProductDetails(product);

        const productPayload: ProductData = {
            productId: product.productId,
            name: product.name,
            price: minPrice,
            image: image,
            slug: product.slug
        };

        socketRef.current.emit('sendMessage', {
            conversationId,
            senderType: 'user',
            senderId: currentUser.id || currentUser.userId,
            content: `Tôi muốn hỏi về sản phẩm "${product.name}"`,
            messageType: 'product',
            productData: productPayload
        });

        setShowProductModal(false);
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {isOpen ? (
                <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3.5 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                                    🛍️
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight">Hỗ Trợ Khách Hàng</h3>
                                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                                    {chatMode === 'ai' ? '🤖 Trợ lý AI đang sẵn sàng' : '👤 Nhân viên shop sẵn sàng tư vấn'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-lg"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Thanh chọn chế độ Chat: AI vs Nhân viên */}
                    <div className="bg-slate-100/90 p-1.5 flex gap-1.5 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => handleSwitchMode('ai')}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                                chatMode === 'ai'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-500/20'
                                    : 'text-gray-600 hover:text-gray-900 bg-transparent'
                            }`}
                        >
                            <span className="text-sm">🤖</span>
                            <span>Chat với AI</span>
                            {chatMode === 'ai' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSwitchMode('staff')}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                                chatMode === 'staff'
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-500/20'
                                    : 'text-gray-600 hover:text-gray-900 bg-transparent'
                            }`}
                        >
                            <span className="text-sm">👤</span>
                            <span>Chat Nhân viên</span>
                            {chatMode === 'staff' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            )}
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div 
                        className="flex-1 p-3 overflow-y-auto bg-slate-50/50 flex flex-col gap-2.5 relative"
                        onScroll={handleScroll}
                        ref={chatBodyRef}
                    >
                        {authError ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
                                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-3 shadow-inner">
                                    🔒
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 mb-1">Phiên đăng nhập đã hết hạn</h4>
                                <p className="text-xs text-gray-500 mb-4 max-w-[220px]">
                                    Vui lòng đăng nhập lại tài khoản để tiếp tục gửi tin nhắn với shop.
                                </p>
                                <a 
                                    href="/login" 
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                                >
                                    Đăng nhập ngay
                                </a>
                            </div>
                        ) : (
                            <>
                                {loadingMore && (
                                    <div className="text-center text-xs text-gray-400 py-1">Đang tải tin nhắn cũ...</div>
                                )}

                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 text-xs py-8">
                                        <div className="text-3xl mb-2">👋</div>
                                        <p className="font-medium text-gray-600">Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
                                        <p className="mt-1 text-[11px] text-gray-400">
                                            Đang ở chế độ <span className="text-blue-600 font-semibold">{chatMode === 'ai' ? 'Trợ lý AI' : 'Nhân viên hỗ trợ'}</span>.
                                        </p>
                                    </div>
                                )}

                        {messages.map((msg, idx) => {
                            const isSystem = msg.senderId === 0 && !msg.productData && (msg.content?.includes('Bạn đã chuyển sang chế độ') || msg.content?.includes('🔔') || msg.content?.includes('👤 Bạn đã chuyển') || msg.content?.includes('🤖 Bạn đã chuyển'));

                            // Tin nhắn hệ thống (thông báo chuyển chế độ)
                            if (isSystem) {
                                return (
                                    <div key={idx} className="self-center my-1 px-3 py-1 bg-gray-200/90 text-gray-600 rounded-full text-[11px] text-center max-w-[90%] shadow-xs font-medium">
                                        {msg.content}
                                    </div>
                                );
                            }

                            const isUser = msg.senderType === 'user';
                            const isAi = msg.senderType === 'admin' && msg.senderId === 0;

                            // Tin nhắn dạng thẻ Sản Phẩm
                            if (msg.messageType === 'product' && msg.productData) {
                                const prod = msg.productData;
                                return (
                                    <div 
                                        key={idx} 
                                        className={`max-w-[85%] rounded-2xl p-2.5 shadow-sm border ${
                                            isUser 
                                                ? 'bg-blue-50/90 border-blue-200 text-gray-800 self-end rounded-br-none' 
                                                : 'bg-white border-gray-200 text-gray-800 self-start rounded-bl-none'
                                        }`}
                                    >
                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <span>🏷️ Sản phẩm quan tâm</span>
                                        </div>
                                        <div className="flex gap-2.5 items-center bg-white p-2 rounded-xl border border-gray-100">
                                            <img 
                                                src={prod.image} 
                                                alt={prod.name}
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0 bg-gray-50"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                                                    {prod.name}
                                                </h4>
                                                <div className="text-sm font-extrabold text-red-600 mt-1">
                                                    {Number(prod.price) > 0 
                                                        ? `${Number(prod.price).toLocaleString('vi-VN')}₫`
                                                        : 'Liên hệ'}
                                                </div>
                                                <a 
                                                    href={`/product/${prod.slug}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-block mt-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                                >
                                                    Xem chi tiết →
                                                </a>
                                            </div>
                                        </div>
                                        {msg.content && msg.content !== `Tôi muốn hỏi về sản phẩm "${prod.name}"` && (
                                            <div className="mt-2 text-xs text-gray-700 font-medium">
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Tin nhắn văn bản thông thường
                            return (
                                <div 
                                    key={idx} 
                                    className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs sm:text-sm shadow-xs ${
                                        isUser 
                                            ? 'bg-blue-600 text-white self-end rounded-br-none font-normal' 
                                            : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none'
                                    }`}
                                >
                                    {!isUser && (
                                        <div className="text-[10px] font-bold mb-1 flex items-center gap-1 text-gray-500">
                                            {isAi ? (
                                                <span className="text-blue-600 flex items-center gap-0.5">🤖 AI Tư vấn</span>
                                            ) : (
                                                <span className="text-indigo-600 flex items-center gap-0.5">👤 Nhân viên Shop</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Footer */}
                    <div className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-1.5">
                        {/* Nút gửi sản phẩm */}
                        <button
                            type="button"
                            onClick={() => setShowProductModal(prev => !prev)}
                            className={`p-2 rounded-xl transition-all border flex items-center justify-center flex-shrink-0 ${
                                showProductModal
                                    ? 'bg-blue-50 border-blue-400 text-blue-600'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                            }`}
                            title="Chọn sản phẩm gửi vào chat"
                        >
                            <span className="text-base">🛍️</span>
                        </button>

                        <input 
                            type="text" 
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
                            placeholder={chatMode === 'ai' ? 'Hỏi AI về size, màu, tồn kho...' : 'Nhắn tin cho nhân viên...'}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />

                        <button 
                            type="button"
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl p-2 w-9 h-9 flex items-center justify-center transition-all shadow-sm flex-shrink-0"
                            title="Gửi tin nhắn"
                        >
                            ➤
                        </button>
                    </div>

                    {/* Modal chọn sản phẩm gửi đi (đặt ngoài khung cuộn chat để không bị nhảy vị trí cuộn) */}
                    {showProductModal && (
                        <div className="absolute inset-x-0 bottom-0 top-[54px] bg-white z-30 flex flex-col animate-in slide-in-from-bottom-2 duration-200 shadow-2xl">
                            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <div className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                                    <span>🛍️</span>
                                    <span>Chọn sản phẩm gửi cho shop</span>
                                </div>
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
                                    placeholder="Tìm tên sản phẩm..."
                                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 shadow-xs"
                                    autoFocus
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto p-2.5 divide-y divide-gray-100">
                                {loadingProducts && (
                                    <div className="text-center text-xs text-gray-400 py-6">Đang tìm sản phẩm...</div>
                                )}

                                {!loadingProducts && productList.length === 0 && (
                                    <div className="text-center text-xs text-gray-400 py-6">
                                        Không tìm thấy sản phẩm nào.
                                    </div>
                                )}

                                {!loadingProducts && productList.map((p) => {
                                    const { minPrice, image } = extractProductDetails(p);
                                    return (
                                        <div 
                                            key={p.productId} 
                                            className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-gray-50 rounded-xl px-2 transition-colors"
                                        >
                                            <img 
                                                src={image} 
                                                alt={p.name} 
                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-gray-800 truncate">{p.name}</div>
                                                <div className="text-[11px] font-bold text-red-600 mt-0.5">
                                                    {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleSendProduct(p)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0 shadow-xs"
                                            >
                                                Gửi
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-end">
                    {/* Toast thông báo tin nhắn mới nổi lên trên nút Chat */}
                    {showToastNotification && latestAdminMessage && (
                        <div 
                            onClick={() => {
                                setIsOpen(true);
                                setShowToastNotification(false);
                            }}
                            className="mb-3 max-w-[280px] sm:max-w-[320px] bg-white rounded-2xl shadow-2xl border border-blue-200 p-3.5 cursor-pointer hover:bg-blue-50/50 transition-all animate-in slide-in-from-bottom-3 duration-300 relative group"
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowToastNotification(false);
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 flex items-center justify-center text-xs font-bold shadow-xs transition-colors"
                            >
                                &times;
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                                    {latestAdminMessage.senderId === 0 ? '🤖' : '👤'}
                                </div>
                                <span className="text-xs font-bold text-gray-900">
                                    {latestAdminMessage.senderId === 0 ? 'Trợ lý AI' : 'Shop Thời Trang'}
                                </span>
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold ml-auto flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                                    Mới
                                </span>
                            </div>
                            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-medium">
                                {latestAdminMessage.messageType === 'product'
                                    ? `[Gợi ý sản phẩm] ${latestAdminMessage.productData?.name || ''}`
                                    : latestAdminMessage.content}
                            </p>
                            <div className="mt-1.5 text-[11px] font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                                <span>Bấm để xem và trả lời ngay</span>
                                <span>→</span>
                            </div>
                        </div>
                    )}

                    {/* Nút tròn Chat với Shop */}
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                    >
                        <span className="text-xl">💬</span>
                        <span className="text-sm">Chat với Shop</span>

                        {unreadCount > 0 ? (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-600 text-white text-[11px] font-extrabold border-2 border-white shadow-md">
                                    {unreadCount}
                                </span>
                            </span>
                        ) : (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
