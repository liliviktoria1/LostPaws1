import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'; // Іконки соціальних мереж

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Логотип і соціальні мережі */}
                <div className="footer-left">
                    <div className="logo-container">
                        {/* Використання абсолютного шляху до логотипу в папці public */}
                        <img src="/assets/logo2.svg" alt="LostPaws Logo" className="footer-logo" />
                        <span className="footer-title">
                            <span className="footer-lost">Lost</span>
                            <span className="paws">Paws</span>
                        </span>
                    </div>
                    <div className="social-icons">
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                            <FaTiktok className="social-icon" />
                        </a>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="social-icon" />
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="social-icon" />
                        </a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                            <FaYoutube className="social-icon" />
                        </a>
                    </div>
                </div>

                {/* Навігація */}
                <div className="footer-middle">
                    <nav className="footer-nav">
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/maps" className="footer-link">Maps</Link>
                        <Link to="/contact" className="footer-link">Contact Us</Link>
                        <Link to="/announcements" className="footer-link">Announcements</Link>
                    </nav>
                </div>

                {/* Технічна підтримка */}
                <div className="footer-right">
                    <h4 className="footer-support-title">Technical support</h4>
                    <p className="footer-support-text">+380 (50) xxx xx xx</p>
                    <p className="footer-support-text">lostpaws@gmail.com</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;