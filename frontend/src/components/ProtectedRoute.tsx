import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location, openLogin: true }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // If they are logged in but not an admin, send them home
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
