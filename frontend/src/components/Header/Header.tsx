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
import { motion, AnimatePresence } from "framer-motion";

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

  // Check if we were redirected here because we need to login
  useEffect(() => {
    if (location.state && (location.state as any).openLogin && !user) {
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      // Clear the state so it doesn't keep opening on every re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, user, navigate]);

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
          
          setIsNotificationsOpen(false);

          if (notif.type === 'chat_message') {
              navigate('/chat');
          } else if (notif.reportId) {
              navigate(`/pet/${notif.reportId}`);
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

  if (user && user.role === 'admin') {
    navLinks.push({ path: "/admin", label: "Admin", className: "admin-nav-link" });
  }

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
          <motion.img 
            src="/assets/logo.svg" 
            alt="Logo" 
            className="logo" 
            whileHover={{ rotate: 10, scale: 1.1 }}
          />
          <h1 className="site-title">
            <span className="header-lost">Lost</span>
            <span className="paws">Paws</span>
          </h1>
        </Link>
      </div>

      <motion.nav 
        className={`nav-links ${isMenuOpen ? "open" : ""}`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1
            }
          }
        }}
      >
        {navLinks.map((link) => (
          <motion.div
            key={link.path}
            className={link.className || ""}
            variants={{
              hidden: { opacity: 0, y: -10 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -2 }}
          >
            <Link
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={(e) => {
                setIsMenuOpen(false);
                if (link.path === "/report" && !user) {
                  e.preventDefault();
                  openLogin();
                }
              }}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeNav"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        ))}
      </motion.nav>

      <div className="header-actions">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/report" 
            className="report-button"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openLogin();
              }
            }}
          >
            {t('header.report_btn')}
          </Link>
        </motion.div>

        <motion.button 
            className="globe-button" 
            onClick={toggleLanguage} 
            aria-label="Language selection"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
          <FiGlobe />
          <span className="lang-code">{i18n.language.toUpperCase().substring(0, 2)}</span>
        </motion.button>

        <div className="auth-buttons" ref={dropdownRef}>
          {user ? (
            <>
                {/* Notifications Bell */}
                <div className="profile-container">
                    <motion.button 
                        className="profile-button notif-bell" 
                        onClick={toggleNotifications}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiBell />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </motion.button>
                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <motion.div 
                                className="profile-dropdown notifications-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="profile-container">
                  <motion.button 
                    className="profile-button" 
                    onClick={toggleProfile}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaUserCircle />
                  </motion.button>
                  <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div 
                            className="profile-dropdown"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                        <div className="dropdown-user-info">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                        <hr />
                        <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                            {t('header.my_profile')}
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'none' }}>
                            Admin Dashboard
                            </Link>
                        )}
                        <Link to="/my-reports" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                            {t('header.my_reports')}
                        </Link>
                        <Link to="/chat" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ color: 'var(--brand-navy)', textDecoration: 'none' }}>
                            {t('header.messages')}
                        </Link>
                        <hr />
                        <button className="dropdown-item" onClick={handleLogout}>
                            {t('header.logout')}
                        </button>                    
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </>
          ) : (
            <>
              <motion.button 
                className="login-button" 
                onClick={openLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('header.login')}
              </motion.button>
              <motion.button 
                className="signup-button" 
                onClick={openSignup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('header.signin')}
              </motion.button>
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
