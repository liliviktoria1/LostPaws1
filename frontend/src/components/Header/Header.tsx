import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGlobe, FiBell } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../Auth/AuthModal";
import { notificationService, AppNotification } from "../../services/notificationService";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  useEffect(() => {
      let interval: any;
      if (user) {
          fetchNotifications();
          interval = setInterval(fetchNotifications, 30000); // Check every 30s
      }
      return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsProfileOpen(false);
              setIsNotificationsOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
      try {
          const data = await notificationService.getNotifications();
          setNotifications(data);
      } catch (error) {
          console.error('Failed to fetch notifications', error);
      }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
      try {
          if (!notif.isRead) {
              await notificationService.markAsRead(notif.id);
              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
          }
          if (notif.reportId) {
              navigate(`/pet/${notif.reportId}`);
              setIsNotificationsOpen(false);
          }
      } catch (error) {
          console.error('Failed to mark notification read', error);
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/maps", label: "Maps" },
    { path: "/announcements", label: "Announcements" },
    { path: "/contact", label: "Contact Us" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => {
      setIsProfileOpen(!isProfileOpen);
      setIsNotificationsOpen(false);
  };
  const toggleNotifications = () => {
      setIsNotificationsOpen(!isNotificationsOpen);
      setIsProfileOpen(false);
  };

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

        <div className="auth-buttons" ref={dropdownRef}>
          {user ? (
            <>
                {/* Notifications Bell */}
                <div className="profile-container">
                    <button className="profile-button notif-bell" onClick={toggleNotifications}>
                        <FiBell />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>
                    {isNotificationsOpen && (
                        <div className="profile-dropdown notifications-dropdown">
                            <div className="dropdown-user-info">
                                <strong>Notifications</strong>
                            </div>
                            <hr />
                            {notifications.length > 0 ? (
                                <ul className="notif-list">
                                    {notifications.slice(0, 5).map(n => (
                                        <li key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleNotificationClick(n)}>
                                            <p>{n.message}</p>
                                            <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-notifs">No new notifications</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
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
                      <Link to="/my-reports" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                        My Reports
                      </Link>
                      <hr />
                      <button className="dropdown-item" onClick={handleLogout}>
                        Log out
                      </button>                    </div>
                  )}
                </div>
            </>
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