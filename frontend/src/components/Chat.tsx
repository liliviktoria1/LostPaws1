import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService, Conversation, Message } from '../services/chatService';
import { io, Socket } from 'socket.io-client';
import { FiSend, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Chat.css';

const Chat: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket.io
    useEffect(() => {
        const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/api$/, '');
        socketRef.current = io(socketUrl);

        socketRef.current.on('receive_message', (message: Message) => {
            if (activeConversation && message.conversationId === activeConversation.id) {
                setMessages(prev => [...prev, message]);
            }
            // Update last message in sidebar
            setConversations(prev => prev.map(c => 
                c.id === message.conversationId 
                ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
                : c
            ));
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [activeConversation]);

    // Fetch Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await chatService.getConversations();
                setConversations(data);
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchConversations();
    }, [user]);

    // Fetch Messages when active conversation changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeConversation) return;
            try {
                const data = await chatService.getMessages(activeConversation.id);
                setMessages(data);
                socketRef.current?.emit('join_conversation', activeConversation.id);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };
        fetchMessages();
    }, [activeConversation]);

    // Scroll to bottom without affecting the entire page
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const message = await chatService.sendMessage(activeConversation.id, newMessage);
            setMessages(prev => [...prev, message]);
            socketRef.current?.emit('send_message', message);
            setNewMessage('');
            
            // Update sidebar
            setConversations(prev => prev.map(c => 
                c.id === activeConversation.id 
                ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
                : c
            ));
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    if (!user) return <div className="chat-error">Please log in to use chat.</div>;

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Sidebar */}
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <h2><FiMessageSquare /> {t('header.messages')}</h2>
                    </div>
                    <div className="conversations-list">
                        {isLoading ? (
                            <p className="chat-loading">{t('common.loading')}</p>
                        ) : conversations.length > 0 ? (
                            conversations.map(conv => (
                                <div 
                                    key={conv.id} 
                                    className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => setActiveConversation(conv)}
                                >
                                    <div className="conv-avatar">
                                        <FiUser />
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-header">
                                            <strong>{conv.otherUser?.name || "User"}</strong>
                                            <span className="conv-time">
                                                {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="conv-last-msg">{conv.lastMessage || "No messages yet"}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-convs">No conversations yet.</p>
                        )}
                    </div>
                </div>

                {/* Main Chat Window */}
                <div className="chat-window">
                    {activeConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="user-info">
                                    <FiUser />
                                    <h3>{activeConversation.otherUser?.name || "User"}</h3>
                                </div>
                            </div>
                            <div className="messages-container">
                                {messages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`message-bubble ${msg.senderId === user.id ? 'mine' : 'theirs'}`}
                                    >
                                        <div className="msg-content">{msg.content}</div>
                                        <span className="msg-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button type="submit" disabled={!newMessage.trim()}>
                                    <FiSend />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <FiMessageSquare />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
