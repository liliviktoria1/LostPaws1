import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo-container">
                    {/* Використання абсолютного шляху до логотипу в папці public */}
                    <img src="/assets/logo.svg" alt="LostPaws Logo" className="logo" />
                    <span className="site-title">
                        <span className="header-lost">Lost</span>
                        <span className="paws">Paws</span>
                    </span>
                </div>
                {/* Стандартне меню */}
                <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/maps" className="nav-link">Maps</Link>
                    <Link to="/announcements" className="nav-link">Announcements</Link>
                    <Link to="/contact" className="nav-link">Contact Us</Link>
                </nav>
            </div>
            <div className="header-right">
                <Link to="/report" className="report-button">Report Pets</Link>
                <button className="login-button">Log in</button>
                <button className="signup-button">Sign in</button>

                {/* Бургер-іконка */}
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