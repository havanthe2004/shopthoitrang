import React, { useState, useEffect, useRef, UIEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store'; // Adjust path if needed

interface Message {
    id: number;
    senderType: 'user' | 'admin';
    content: string;
    createdAt: string;
}

const SOCKET_URL = import.meta.env.VITE_API_KEY || import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${SOCKET_URL}/api`;

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number>(0);

    const { currentUser, token } = useSelector((state: RootState) => state.auth);

    // Initialize conversation and socket
    useEffect(() => {
        if (!currentUser || !isOpen) return;

        const initChat = async () => {
            try {
                // Get or create conversation
                const res = await axios.get(`${API_URL}/chat/my-conversation`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const convId = res.data.id;
                setConversationId(convId);

                // Fetch initial messages
                await fetchMessages(convId, null);

                // Connect socket
                socketRef.current = io(SOCKET_URL);
                socketRef.current.emit('joinRoom', convId.toString());

                // Listen for new messages
                socketRef.current.on('newMessage', (msg: Message) => {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                });

            } catch (error) {
                console.error("Failed to initialize chat", error);
            }
        };

        if (!socketRef.current) {
            initChat();
        }

        return () => {
            if (socketRef.current && !isOpen) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [currentUser, isOpen]);

    const fetchMessages = async (convId: number, cursor: string | null) => {
        try {
            setLoadingMore(true);
            let url = `${API_URL}/chat/conversations/${convId}/messages`;
            if (cursor) url += `?cursor=${cursor}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.messages.length > 0) {
                setMessages(prev => {
                    // If cursor exists, prepend, else set
                    return cursor ? [...res.data.messages, ...prev] : res.data.messages;
                });
                if (!cursor) {
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                    }, 100);
                }
            }
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        if (!hasMore || loadingMore || !conversationId) return;
        
        const target = e.target as HTMLDivElement;
        // If scrolled to top
        if (target.scrollTop === 0) {
            if (messages.length > 0) {
                const oldestMsgCursor = messages[0].createdAt;
                prevScrollHeight.current = target.scrollHeight;
                fetchMessages(conversationId, oldestMsgCursor);
            }
        }
    };

    // Maintain scroll position when new older messages are prepended
    useEffect(() => {
        if (chatBodyRef.current && prevScrollHeight.current > 0) {
            const newScrollHeight = chatBodyRef.current.scrollHeight;
            chatBodyRef.current.scrollTop = newScrollHeight - prevScrollHeight.current;
            prevScrollHeight.current = 0; // reset
        }
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Scroll to bottom when opening widget
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (!conversationId) {
            console.error("Lỗi: Không tìm thấy conversationId (Chưa khởi tạo được cuộc hội thoại)");
            return;
        }
        if (!socketRef.current) {
            console.error("Lỗi: Socket chưa được kết nối");
            return;
        }
        if (!currentUser) {
            console.error("Lỗi: Không tìm thấy currentUser");
            return;
        }

        socketRef.current.emit('sendMessage', {
            conversationId,
            senderType: 'user',
            senderId: currentUser.id || currentUser.userId,
            content: inputText
        });

        setInputText('');
    };

    if (!currentUser) return null; // Hide if not logged in

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <span className="font-semibold">Chat với Shop</span>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">&times;</button>
                    </div>

                    {/* Chat Body */}
                    <div 
                        className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2"
                        onScroll={handleScroll}
                        ref={chatBodyRef}
                    >
                        {loadingMore && <div className="text-center text-xs text-gray-400">Đang tải...</div>}
                        
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`max-w-[75%] p-2 rounded-lg text-sm ${
                                msg.senderType === 'user' 
                                    ? 'bg-blue-500 text-white self-end rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none'
                            }`}>
                                {msg.content}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-200 flex gap-2 rounded-b-lg">
                        <input 
                            type="text" 
                            className="flex-1 border rounded-full px-3 py-1 text-sm outline-none focus:border-blue-500"
                            placeholder="Nhập tin nhắn..." 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            className="bg-blue-600 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
                >
                    Chat
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
