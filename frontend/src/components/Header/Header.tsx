import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe } from 'react-icons/fi'; // Import globe icon
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/maps', label: 'Maps' },
        { path: '/announcements', label: 'Announcements' },
        { path: '/contact', label: 'Contact Us' },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                        className="nav-link"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="header-right">
                <Link to="/report" className="report-button">Report Pets</Link>
                <button className="globe-button"><FiGlobe /></button>
                <button className="login-button">Log in</button>
                <button className="signup-button">Sign in</button>

                <div className="mobile-menu-icon" onClick={toggleMenu}>
                    <div className="menu-bar"></div>
                    <div className="menu-bar"></div>
                    <div className="menu-bar"></div>
                </div>
            </div>
        </header>
    );
}

export default Header;