import React, { useState } from 'react';
import './VerificationModal.css';
import { authService } from '../../services/authService';

interface VerificationModalProps {
    email: string;
    onVerified: () => void;
    onLogout: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ email, onVerified, onLogout }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        if (isInvalid) setIsInvalid(false);
        if (error) setError('');

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setError('Please enter all 6 digits');
            setIsInvalid(true);
            return;
        }

        setIsLoading(true);
        setError('');
        setIsInvalid(false);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${(process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')}/auth/verify-email`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: verificationCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsInvalid(true);
                throw new Error(data.message || 'Verification failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            onVerified();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResendStatus('Sending...');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${(process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')}/auth/resend-verification`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to resend code');
            
            setResendStatus('Code resent successfully!');
            setTimeout(() => setResendStatus(''), 3000);
        } catch (err) {
            setResendStatus('Failed to resend code');
        }
    };

    return (
        <div className="verification-modal-overlay">
            <div className="verification-modal-content">
                <h2>Verify Your Email</h2>
                <p>We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below to activate your account.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className={`code-inputs ${isInvalid ? 'invalid' : ''}`}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                autoFocus={index === 0}
                                className={isInvalid ? 'error' : ''}
                            />
                        ))}
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {resendStatus && <p className="status-message">{resendStatus}</p>}

                    <button type="submit" className="verify-button" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="resend-container">
                    <span>Didn't receive the code?</span>
                    <button onClick={handleResend} disabled={isLoading} className="resend-button">Resend</button>
                </div>

                <div className="logout-container" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <button onClick={onLogout} className="resend-button" style={{ textDecoration: 'none', color: '#e74c3c' }}>Logout & Exit</button>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
