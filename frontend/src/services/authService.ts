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
    register: async (userData: any): Promise<{ token: string; user: User }> => {
        const response = await fetch(`${BASE_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    login: async (credentials: any): Promise<{ token: string; user: User }> => {
        const response = await fetch(`${BASE_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    }
};
