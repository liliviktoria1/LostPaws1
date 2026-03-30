import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGlobe } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../Auth/AuthModal";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/maps", label: "Maps" },
    { path: "/announcements", label: "Announcements" },
    { path: "/contact", label: "Contact Us" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const openLogin = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthModalMode("signup");
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
          <img src="/assets/logo.svg" alt="Logo" className="logo" />
          <h1 className="site-title">
            <span className="header-lost">Lost</span>
            <span className="paws">Paws</span>
          </h1>
        </Link>
      </div>

      <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link to="/report" className="report-button">
          Report Pets
        </Link>

        <button className="globe-button" aria-label="Language selection">
          <FiGlobe />
        </button>

        <div className="auth-buttons">
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
                  <button className="dropdown-item" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="login-button" onClick={openLogin}>
                Log in
              </button>
              <button className="signup-button" onClick={openSignup}>
                Sign in
              </button>
            </>
          )}
        </div>

        <div className={`mobile-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
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