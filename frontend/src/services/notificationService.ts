import { authService } from './authService';

const BASE_API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export interface AppNotification {
    id: string;
    userId: string;
    message: string;
    reportId?: string;
    isRead: boolean;
    type: 'match_alert' | 'system';
    createdAt: string;
}

export const notificationService = {
    // Get all notifications
    getNotifications: async (): Promise<AppNotification[]> => {
        const token = authService.getToken();
        if (!token) return [];

        const response = await fetch(`${BASE_API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    // Mark a notification as read
    markAsRead: async (id: string): Promise<AppNotification> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    }
};
