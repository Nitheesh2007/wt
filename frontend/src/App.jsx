import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import { Login, Register, Profile, ForgotPassword } from './pages/AuthPages';
import AdminDashboard from './pages/AdminDashboard';
import BookCatalog from './pages/BookCatalog';
import BookDetail from './pages/BookDetail';
import BookManagement from './pages/BookManagement';
import OCRScannerPage from './pages/OCRScannerPage';
import CirculationPage from './pages/CirculationPage';
import AIRecommendations from './pages/AIRecommendations';
import AIAnalyticsPage from './pages/AIAnalyticsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import StudentPortal from './pages/StudentPortal';
import { FacilitiesPage, BookRequestsPage, FinesManagement } from './pages/FacilitiesAndCommunity';
import {
  UserManagement,
  LibrarianManagement,
  SuppliersAndAcquisitions,
  ReportsPage,
  AuditLogsPage,
  SystemSettingsPage,
  SystemHealthPage
} from './pages/AdminOperations';

export default function App() {
  const { user, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(() => (user ? (role === 'STUDENT' ? 'student-dashboard' : 'admin-dashboard') : 'landing'));
  const [selectedBook, setSelectedBook] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} onSelectBook={setSelectedBook} />;
      case 'login':
        return <Login setActiveTab={setActiveTab} />;
      case 'register':
        return <Register setActiveTab={setActiveTab} />;
      case 'forgot-password':
        return <ForgotPassword setActiveTab={setActiveTab} />;
      case 'profile':
        return <Profile />;
      case 'admin-dashboard':
        return <AdminDashboard setActiveTab={setActiveTab} onSelectBook={setSelectedBook} />;
      case 'student-dashboard':
      case 'my-reading':
      case 'wishlist':
        return <StudentPortal onSelectBook={setSelectedBook} setActiveTab={setActiveTab} />;
      case 'catalog':
        return <BookCatalog onSelectBook={setSelectedBook} setActiveTab={setActiveTab} />;
      case 'book-detail':
        return (
          <BookDetail
            book={selectedBook}
            onBack={() => setActiveTab('catalog')}
            onSelectBook={setSelectedBook}
          />
        );
      case 'book-mgmt':
        return <BookManagement />;
      case 'ocr-scanner':
        return <OCRScannerPage setActiveTab={setActiveTab} onSelectBook={setSelectedBook} />;
      case 'circulation':
      case 'reservations':
        return <CirculationPage />;
      case 'requests':
        return <BookRequestsPage />;
      case 'fines':
        return <FinesManagement />;
      case 'recommendations':
        return <AIRecommendations onSelectBook={setSelectedBook} setActiveTab={setActiveTab} />;
      case 'ai-analytics':
        return <AIAnalyticsPage />;
      case 'assistant':
        return <AIAssistantPage onSelectBook={setSelectedBook} setActiveTab={setActiveTab} />;
      case 'facilities':
        return <FacilitiesPage />;
      case 'users':
        return <UserManagement />;
      case 'librarians':
        return <LibrarianManagement />;
      case 'suppliers':
        return <SuppliersAndAcquisitions />;
      case 'reports':
        return <ReportsPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SystemSettingsPage />;
      case 'health':
        return <SystemHealthPage />;
      default:
        return <LandingPage setActiveTab={setActiveTab} onSelectBook={setSelectedBook} />;
    }
  };

  return (
    <div className="app-container">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar
            isOpen={sidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <main className="main-content">
            <div className="page-wrapper">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
