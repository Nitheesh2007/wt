import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  MessageSquare,
  Repeat,
  CalendarCheck,
  DollarSign,
  ScanLine,
  Bookmark,
  TrendingUp,
  Users,
  ShieldCheck,
  Building2,
  FileText,
  Activity,
  Settings,
  Heart,
  Vote,
  Target,
  Home
} from 'lucide-react';

export default function Sidebar({ isOpen, activeTab, setActiveTab }) {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const getMenuItems = () => {
    if (!user) {
      return [
        { id: 'landing', label: t('navHome', 'Home / Showcase'), icon: Home },
        { id: 'catalog', label: t('navCatalog', 'Explore Catalog'), icon: BookOpen },
        { id: 'recommendations', label: t('navRecommendations', 'AI Recommendations'), icon: Sparkles },
        { id: 'assistant', label: t('navAssistant', 'AI Library Assistant'), icon: MessageSquare }
      ];
    }

    if (role === 'STUDENT') {
      return [
        { id: 'student-dashboard', label: t('navStudentDashboard', 'Dashboard'), icon: LayoutDashboard },
        { id: 'catalog', label: t('navCatalog', 'Book Catalog'), icon: BookOpen },
        { id: 'recommendations', label: t('navRecommendations', 'AI Recommendations'), icon: Sparkles },
        { id: 'assistant', label: t('navAssistant', 'AI Smart Assistant'), icon: MessageSquare },
        { id: 'my-reading', label: t('navMyReading', 'My Reading & Goals'), icon: Target },
        { id: 'wishlist', label: t('navWishlist', 'Wishlist & Bookmarks'), icon: Heart },
        { id: 'reservations', label: t('navReservations', 'My Reservations'), icon: CalendarCheck },
        { id: 'requests', label: t('navRequests', 'Book Requests & Votes'), icon: Vote },
        { id: 'facilities', label: t('navFacilities', 'Reserve Study Seat'), icon: Building2 },
        { id: 'profile', label: t('navProfile', 'My Profile'), icon: Users }
      ];
    }

    if (role === 'LIBRARIAN') {
      return [
        { id: 'admin-dashboard', label: t('navCirculationHub', 'Circulation Hub'), icon: LayoutDashboard },
        { id: 'catalog', label: t('navCatalog', 'Book Catalog'), icon: BookOpen },
        { id: 'book-mgmt', label: t('navBookMgmt', 'Book Management'), icon: Bookmark },
        { id: 'ocr-scanner', label: t('navOCRScanner', 'OCR Book Scanner'), icon: ScanLine },
        { id: 'circulation', label: t('navCirculation', 'Issue / Return / Renew'), icon: Repeat },
        { id: 'reservations', label: t('navReservationsQueue', 'Reservation Queue'), icon: CalendarCheck },
        { id: 'fines', label: t('navFines', 'Overdue Fines'), icon: DollarSign },
        { id: 'requests', label: t('navStudentRequests', 'Student Requests'), icon: Vote },
        { id: 'reports', label: t('navReports', 'Generate Reports'), icon: FileText },
        { id: 'profile', label: t('navStaffProfile', 'Staff Profile'), icon: Users }
      ];
    }

    // ADMIN
    return [
      { id: 'admin-dashboard', label: t('navAdminDashboard', 'Admin Dashboard'), icon: LayoutDashboard },
      { id: 'catalog', label: t('navCatalog', 'Book Catalog'), icon: BookOpen },
      { id: 'book-mgmt', label: t('navBookMgmt', 'Book Management'), icon: Bookmark },
      { id: 'ocr-scanner', label: t('navOCRScanner', 'OCR Book Registration'), icon: ScanLine },
      { id: 'circulation', label: t('navCirculation', 'Issue / Return / Renew'), icon: Repeat },
      { id: 'reservations', label: t('navReservationsQueue', 'Reservations Queue'), icon: CalendarCheck },
      { id: 'ai-analytics', label: t('navAIAnalytics', 'AI Demand & Inventory'), icon: TrendingUp },
      { id: 'assistant', label: t('navAssistant', 'AI Smart Assistant'), icon: MessageSquare },
      { id: 'users', label: t('navUsers', 'User Directory'), icon: Users },
      { id: 'librarians', label: t('navLibrarians', 'Librarian Staff'), icon: ShieldCheck },
      { id: 'suppliers', label: t('navSuppliers', 'Suppliers & Purchases'), icon: Building2 },
      { id: 'fines', label: t('navFines', 'Fines Management'), icon: DollarSign },
      { id: 'requests', label: t('navRequests', 'Book Requests'), icon: Vote },
      { id: 'facilities', label: t('navFacilities', 'Facility Booking'), icon: Building2 },
      { id: 'reports', label: t('navReports', 'Reports & PDF Export'), icon: FileText },
      { id: 'audit-logs', label: t('navAuditLogs', 'System Audit Logs'), icon: Activity },
      { id: 'settings', label: t('navSettings', 'Library Settings'), icon: Settings },
      { id: 'health', label: t('navHealth', 'System Health & Mongo'), icon: Activity },
      { id: 'profile', label: t('navProfile', 'My Profile & Picture'), icon: Users }
    ];
  };

  const menuItems = getMenuItems();

  const getSectionHeader = () => {
    if (role === 'ADMIN') return t('adminSection', 'Administration');
    if (role === 'LIBRARIAN') return t('librarianSection', 'Librarian Staff');
    if (role === 'STUDENT') return t('studentSection', 'Student Workspace');
    return t('navigationSection', 'Navigation');
  };

  return (
    <aside
      style={{
        width: isOpen ? '260px' : '0',
        minWidth: isOpen ? '260px' : '0',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        height: 'calc(100vh - 68px)',
        position: 'sticky',
        top: '68px',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'all 250ms ease',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90
      }}
    >
      <div style={{ padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: 'var(--text-muted)',
            padding: '0.5rem 0.75rem',
            letterSpacing: '0.06em'
          }}
        >
          {getSectionHeader()}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' : 'transparent',
                boxShadow: isActive ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#fff' : 'inherit', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)' }}>
        {user && (
          <div
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              background: activeTab === 'profile' ? 'rgba(79, 70, 229, 0.12)' : 'transparent',
              transition: 'background 0.15s ease',
              borderBottom: '1px solid var(--border-color)'
            }}
            title={t('navProfile', 'My Profile')}
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
                flexShrink: 0
              }}
            />
            <div style={{ overflow: 'hidden', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.studentId || user.department || t(user.role, user.role)}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('brandName', 'Library Management')}</div>
          <div>{t('academicProjectNote', 'Smart Library Management System')}</div>
        </div>
      </div>
    </aside>
  );
}
