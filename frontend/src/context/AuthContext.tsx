import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => void;
    isLoading: boolean;
    handleVerificationSuccess: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = authService.getToken();
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const verifiedUser = await authService.verify();
                setUser(verifiedUser);
            } catch (err) {
                console.warn("Session expired or invalid token. Logging out.");
                authService.logout();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        if (!data.requiresVerification) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        }
        return data;
    };

    const register = async (userData: any) => {
        return await authService.register(userData);
    };

    const handleVerificationSuccess = (data: any) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading, handleVerificationSuccess }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
