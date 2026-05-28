import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGlobe, FiBell, FiTrash2 } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../Auth/AuthModal";
import VerificationModal from "../Auth/VerificationModal";
import { notificationService, AppNotification } from "../../services/notificationService";
import { useTranslation } from "react-i18next";
import "./Header.css";

function Header() {
  const { t, i18n } = useTranslation();
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
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.isVerified === false) {
      setIsVerificationModalOpen(true);
    } else {
      setIsVerificationModalOpen(false);
    }
  }, [user]);

  const [prevUnreadCount, setPrevUnreadCount] = useState<number>(0);

  useEffect(() => {
      let interval: any;
      if (user) {
          fetchNotifications();
          interval = setInterval(fetchNotifications, 10000); // Check every 10s for better responsiveness
      }
      return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
      try {
          const data = await notificationService.getNotifications();
          const currentUnread = data.filter(n => !n.isRead).length;

          // Sound alert if new notification arrived
          if (currentUnread > prevUnreadCount) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
              audio.volume = 0.4;
              audio.play().catch(() => {}); // Browsers might block autoplay
          }
          
          setPrevUnreadCount(currentUnread);
          setNotifications(data);
      } catch (error) {
          console.error('Failed to fetch notifications', error);
      }
  };

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

  const handleNotificationClick = async (notif: AppNotification) => {
      try {
          if (!notif.isRead) {
              await notificationService.markAsRead(notif.id);
              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
              setPrevUnreadCount(prev => Math.max(0, prev - 1));
          }
          if (notif.reportId) {
              navigate(`/pet/${notif.reportId}`);
              setIsNotificationsOpen(false);
          }
      } catch (error) {
          console.error('Failed to mark notification read', error);
      }
  };

  const handleMarkAllAsRead = async () => {
      try {
          await notificationService.markAllAsRead();
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setPrevUnreadCount(0);
      } catch (error) {
          console.error('Failed to mark all as read', error);
      }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      try {
          await notificationService.deleteNotification(id);
          const deletedWasUnread = !notifications.find(n => n.id === id)?.isRead;
          setNotifications(prev => prev.filter(n => n.id !== id));
          if (deletedWasUnread) setPrevUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
          console.error('Failed to delete notification', error);
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    { path: "/", label: t('header.home') },
    { path: "/maps", label: t('header.maps') },
    { path: "/announcements", label: t('header.announcements') },
    { path: "/report", label: t('header.report_btn'), className: "mobile-nav-only" },
    { path: "/success-stories", label: t('header.success_stories') },
    { path: "/contact", label: t('header.contact') },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ua' : 'en';
    i18n.changeLanguage(nextLang);
  };

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
    setIsMenuOpen(false);
  };

  const openSignup = () => {
    setAuthModalMode("signup");
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    setIsVerificationModalOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo-container" onClick={() => setIsMenuOpen(false)}>
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
            className={`nav-link ${location.pathname === link.path ? "active" : ""} ${link.className || ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link to="/report" className="report-button">
          {t('header.report_btn')}
        </Link>

        <button className="globe-button" onClick={toggleLanguage} aria-label="Language selection">
          <FiGlobe />
          <span className="lang-code">{i18n.language.toUpperCase().substring(0, 2)}</span>
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
                            <div className="dropdown-user-info notif-dropdown-header">
                                <strong>{t('header.notifications')}</strong>
                                {notifications.length > 0 && (
                                    <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
                                        {t('header.mark_all_read')}
                                    </button>
                                )}
                            </div>
                            <hr />
                            {notifications.length > 0 ? (
                                <ul className="notif-list">
                                    {notifications.slice(0, 10).map(n => (
                                        <li key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleNotificationClick(n)}>
                                            <div className="notif-content">
                                                <p>{n.message}</p>
                                                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <button className="delete-notif-btn" onClick={(e) => handleDeleteNotification(e, n.id)} title="Delete notification">
                                                <FiTrash2 />
                                            </button>
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
                      <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                        {t('header.my_profile')}
                      </Link>
                      <Link to="/my-reports" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                        {t('header.my_reports')}
                      </Link>
                      <Link to="/chat" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                        {t('header.messages')}
                      </Link>
                      <hr />
                      <button className="dropdown-item" onClick={handleLogout}>
                        {t('header.logout')}
                      </button>                    </div>
                  )}
                </div>
            </>
          ) : (
            <>
              <button className="login-button" onClick={openLogin}>
                {t('header.login')}
              </button>
              <button className="signup-button" onClick={openSignup}>
                {t('header.signin')}
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

      {isVerificationModalOpen && user && (
        <VerificationModal 
          email={user.email} 
          onVerified={() => {
            setIsVerificationModalOpen(false);
            window.location.reload(); // Refresh to update user state globally
          }}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}

export default Header;
