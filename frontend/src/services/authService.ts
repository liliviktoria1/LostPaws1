import { User } from '../types';

const BASE_API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const handleResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        const errorMessage = data?.message || (isJson ? 'Request failed' : `Server error: ${response.status} ${response.statusText}`);
        throw new Error(errorMessage);
    }
    return data;
};

export const authService = {
    register: async (userData: any) => {
        const response = await fetch(`${BASE_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (response.status === 403 && data?.isVerified === false) {
            return { requiresVerification: true, email: data.email };
        }
        if (!response.ok) throw new Error(data?.message || 'Registration failed');
        return data;
    },

    login: async (credentials: any) => {
        const response = await fetch(`${BASE_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (response.status === 403 && data?.isVerified === false) {
            return { requiresVerification: true, email: data.email };
        }
        if (!response.ok) throw new Error(data?.message || 'Login failed');
        return data;
    },

    verifyEmail: async (email: string, code: string) => {
        const response = await fetch(`${BASE_API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });
        return handleResponse(response);
    },

    resendVerification: async (email: string) => {
        const response = await fetch(`${BASE_API_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return handleResponse(response);
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    verify: async (): Promise<User> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${BASE_API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    getProfile: async (): Promise<User> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    updateProfile: async (data: { name?: string, phoneNumber?: string, password?: string }): Promise<User> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_API_URL}/auth/profile`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result.user || result;
    },

    getCurrentUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    // Admin Methods
    adminGetAllUsers: async (): Promise<User[]> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_API_URL}/auth/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    adminVerifyUser: async (userId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_API_URL}/auth/admin/users/${userId}/verify`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    adminUpdateRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_API_URL}/auth/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });
        return handleResponse(response);
    },

    adminDeleteUser: async (userId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_API_URL}/auth/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    }
};
