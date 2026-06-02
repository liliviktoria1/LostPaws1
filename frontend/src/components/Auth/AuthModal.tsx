import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import VerificationModal from './VerificationModal';
import './AuthModal.css';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'verify'>(initialMode as any);
    const [verifyEmail, setVerifyEmail] = useState('');
    const { login, register } = useAuth();
    
    // Sync mode when initialMode changes or modal opens
    useEffect(() => {
        if (isOpen && mode !== 'verify') {
            setMode(initialMode);
        }
    }, [initialMode, isOpen]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup') {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords don't match");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (mode === 'signup') {
                const res = await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                setVerifyEmail(res.email || formData.email);
                setMode('verify');
            } else if (mode === 'login') {
                const res = await login({
                    email: formData.email,
                    password: formData.password
                });
                if (res.requiresVerification) {
                    setVerifyEmail(res.email || formData.email);
                    setMode('verify');
                } else {
                    onClose();
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="modal-overlay" 
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {mode === 'verify' ? (
                        <VerificationModal 
                            email={verifyEmail} 
                            onVerified={() => {
                                onClose();
                                setMode('login'); // reset for next time
                            }}
                            onLogout={() => {
                                setMode('login');
                            }}
                        />
                    ) : (
                        <motion.div 
                            className="modal-container" 
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
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

                                <motion.button 
                                    type="submit" 
                                    className="auth-submit" 
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
                                </motion.button>
                            </form>

                            <div className="modal-footer">
                                {mode === 'login' ? (
                                    <p>Don't have an account? <span onClick={() => setMode('signup')}>Sign Up</span></p>
                                ) : (
                                    <p>Already have an account? <span onClick={() => setMode('login')}>Login</span></p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
