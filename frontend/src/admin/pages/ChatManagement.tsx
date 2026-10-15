import React, { useState, useEffect, useRef, UIEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store'; // Adjust path if needed

interface Conversation {
    id: number;
    user: { userId: number; name: string; avatar: string };
    lastMessage: string;
    updatedAt: string;
}

interface Message {
    id: number;
    senderType: 'user' | 'admin';
    senderId: number;
    content: string;
    createdAt: string;
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

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number>(0);

    const { currentAdmin, adminToken } = useSelector((state: RootState) => state.adminAuth);

    // Fetch conversation list
    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${API_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setConversations(res.data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    // Initialize socket & fetch convs
    useEffect(() => {
        if (!currentAdmin) return;

        fetchConversations();

        socketRef.current = io(SOCKET_URL);

        // Listen for list updates
        socketRef.current.on('updateConversationList', () => {
            fetchConversations();
        });

        // Listen for new messages if joined
        socketRef.current.on('newMessage', (msg: Message) => {
            if (msg.conversation && (msg.conversation as any).id === selectedConvId) {
                 setMessages(prev => [...prev, msg]);
                 scrollToBottom();
            } else {
                // if we don't have conversation populated in msg but we are in that room
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [currentAdmin]);

    // Handle selecting a conversation
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
            console.error("Failed to fetch messages", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        if (!hasMore || loadingMore || !selectedConvId) return;
        
        const target = e.target as HTMLDivElement;
        if (target.scrollTop === 0) {
            if (messages.length > 0) {
                const oldestMsgCursor = messages[0].createdAt;
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



    const handleSend = () => {
        if (!inputText.trim() || !selectedConvId || !socketRef.current || !currentAdmin) return;

        socketRef.current.emit('sendMessage', {
            conversationId: selectedConvId,
            senderType: 'admin',
            senderId: currentAdmin.adminId || currentAdmin.id, 
            content: inputText
        });

        setInputText('');
    };

    return (
        <div className="flex h-[80vh] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Left Sidebar - Conversations */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-gray-50 border-b font-semibold text-gray-700">
                    Tin nhắn khách hàng
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div 
                            key={conv.id} 
                            onClick={() => setSelectedConvId(conv.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${selectedConvId === conv.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        >
                            <div className="font-semibold">{conv.user?.name || 'Khách hàng'}</div>
                            <div className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Bắt đầu trò chuyện...'}</div>
                        </div>
                    ))}
                    {conversations.length === 0 && <div className="p-4 text-gray-500 text-center">Không có tin nhắn nào.</div>}
                </div>
            </div>

            {/* Right Side - Chat Box */}
            <div className="w-2/3 flex flex-col bg-gray-50">
                {selectedConvId ? (
                    <>
                        <div className="p-4 bg-white border-b flex items-center justify-between font-semibold shadow-sm z-10">
                            {conversations.find(c => c.id === selectedConvId)?.user?.name || 'Khách hàng'}
                        </div>
                        
                        {/* Messages Area */}
                        <div 
                            className="flex-1 p-4 overflow-y-auto flex flex-col gap-3"
                            onScroll={handleScroll}
                            ref={chatBodyRef}
                        >
                            {loadingMore && <div className="text-center text-xs text-gray-400">Đang tải...</div>}
                            
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${
                                    msg.senderType === 'admin' 
                                        ? 'bg-blue-600 text-white self-end rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 self-start rounded-bl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                                placeholder="Nhập tin nhắn..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Chọn một cuộc hội thoại để bắt đầu
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;
