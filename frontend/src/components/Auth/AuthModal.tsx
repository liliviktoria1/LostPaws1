import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const { login, register } = useAuth();
    
    // Sync mode when initialMode changes or modal opens
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode, isOpen]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords don't match");
                }
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
            } else {
                await login({
                    email: formData.email,
                    password: formData.password
                });
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                
                <div className="modal-header">
                    <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{mode === 'login' ? 'Login to manage your pet alerts' : 'Join our community to help find pets'}</p>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}
                    
                    {mode === 'signup' && (
                        <div className="auth-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="John Doe"
                                required 
                            />
                        </div>
                    )}

                    <div className="auth-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="email@example.com"
                            required 
                        />
                    </div>

                    <div className="auth-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="********"
                            required 
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="auth-group">
                            <label>Confirm Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                placeholder="********"
                                required 
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-submit" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="modal-footer">
                    {mode === 'login' ? (
                        <p>Don't have an account? <span onClick={() => setMode('signup')}>Sign Up</span></p>
                    ) : (
                        <p>Already have an account? <span onClick={() => setMode('login')}>Login</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
