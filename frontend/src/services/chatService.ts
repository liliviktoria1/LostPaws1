import { authService } from './authService';

const BASE_API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export interface Conversation {
    id: string;
    user1Id: string;
    user2Id: string;
    reportId?: string;
    lastMessage?: string;
    lastMessageAt: string;
    otherUser: {
        id: string;
        name: string;
        email: string;
    };
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export const chatService = {
    getConversations: async (): Promise<Conversation[]> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/chats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    },

    startConversation: async (recipientId: string, reportId?: string): Promise<Conversation> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/chats`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ recipientId, reportId })
        });
        if (!response.ok) throw new Error('Failed to start conversation');
        return response.json();
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/chats/${conversationId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    sendMessage: async (conversationId: string, content: string): Promise<Message> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/chats/${conversationId}/messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ content })
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    }
};
