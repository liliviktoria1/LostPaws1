import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe } from 'react-icons/fi'; // Import globe icon
import { FaUserCircle } from 'react-icons/fa'; // Import profile icon
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/maps', label: 'Maps' },
        { path: '/announcements', label: 'Announcements' },
        { path: '/contact', label: 'Contact Us' },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const openLogin = () => {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo-container">
                    <img src="/assets/logo.svg" alt="LostPaws Logo" className="logo" />
                    <span className="site-title">
                        <span className="header-lost">Lost</span>
                        <span className="paws">Paws</span>
                    </span>
                </Link>
            </div>

            <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                {navLinks.map((link) => (
                    <Link 
                        key={link.path} 
                        to={link.path} 
                        className={`nav-link ${window.location.pathname === link.path ? 'active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="header-actions">
                <Link to="/report" className="report-button">Report Pets</Link>
                
                <div className="header-icons">
                    <button className="globe-button"><FiGlobe /></button>
                    
                    {user ? (
                        <div className="profile-container">
                            <button className="profile-button" onClick={toggleProfile}>
                                <FaUserCircle />
                            </button>
                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-user-info">
                                        <strong>{user.name}</strong>
                                        <span>{user.email}</span>
                                    </div>
                                    <hr />
                                    <button className="dropdown-item" onClick={handleLogout}>Log out</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="profile-button" onClick={openLogin}>
                            <FaUserCircle />
                        </button>
                    )}
                </div>

                <div className="mobile-menu-icon" onClick={toggleMenu}>
                    <div className="menu-bar"></div>
                    <div className="menu-bar"></div>
                    <div className="menu-bar"></div>
                </div>
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                initialMode={authModalMode}
            />
        </header>
    );
}

export default Header;