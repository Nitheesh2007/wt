import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { adminAPI } from '../../services/api';
import { Sun, Moon, Bell, LogOut, User, Check, BookOpen, Menu, Sparkles, Languages } from 'lucide-react';

export default function Navbar({ onToggleSidebar, activeTab, setActiveTab }) {
  const { user, logout, role } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t, isTamil } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await adminAPI.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail on network
    }
  };

  const markAllRead = async () => {
    try {
      await adminAPI.markAllNotifsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      style={{
        height: '68px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            color: 'var(--text-primary)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center'
          }}
          title={t('toggleNav', 'Toggle Navigation')}
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {t('brandName', 'Library Management')}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>
              {t('brandSubtitle', 'Smart Knowledge & Circulation Portal')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Assistant quick button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setActiveTab('assistant')}
          style={{ gap: '6px', borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          <Sparkles size={15} />
          <span>{t('askAIAssistant', 'Ask AI Assistant')}</span>
        </button>

        {/* Tamil / English Language Switcher */}
        <button
          id="language-toggle-btn"
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 12px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: isTamil ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-secondary)',
            color: isTamil ? '#818cf8' : 'var(--text-primary)',
            border: isTamil ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          title={isTamil ? "Switch to English" : "தமிழுக்கு மாற்றுக (Switch to Tamil)"}
        >
          <Languages size={17} style={{ color: isTamil ? '#818cf8' : 'inherit' }} />
          <span>{isTamil ? 'தமிழ்' : 'English'}</span>
          <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', background: isTamil ? 'var(--primary)' : 'var(--border-color)', color: '#fff' }}>
            {lang.toUpperCase()}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            transition: 'all var(--transition-fast)'
          }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#4f46e5' }} />}
        </button>

        {/* Notification Bell */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                position: 'relative'
              }}
              title={t('notifications', 'Notifications')}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--danger)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-primary)'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '340px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 1000,
                  padding: '1rem',
                  animation: 'scaleUp 150ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('notifications', 'Notifications')} ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {t('markAllRead', 'Mark all as read')}
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {t('noNewNotifications', 'No new notifications')}
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: n.isRead ? 'transparent' : 'var(--bg-secondary)',
                          borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)',
                          fontSize: '0.825rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '2px' }}>{n.message}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile / Login */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
            <div
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                background: activeTab === 'profile' ? 'rgba(79, 70, 229, 0.12)' : 'transparent'
              }}
              title={isTamil ? "சுயவிவரத்தை நிர்வகிக்க கிளிக் செய்யவும்" : "Click to manage your profile & photo"}
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                alt={user.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  border: '2px solid var(--primary)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {t(user.role, user.role)}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              style={{
                padding: '7px',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={t('signOut', 'Sign Out')}
            >
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('login')}>
              {t('signIn', 'Sign In')}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('register')}>
              {t('joinLibrary', 'Join Library')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
