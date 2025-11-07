import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { FlashcardManagementPage } from './flashcards/FlashcardManagementPage';
import { CategoryManagementPage } from './categories/CategoryManagementPage';
import { LevelManagementPage } from './levels/LevelManagementPage';
import './AdminLayout.css';

/**
 * Main layout component for the admin panel
 * Provides sidebar navigation and logout functionality
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'DB' },
    { path: '/admin/flashcards', label: 'Flashcards', icon: 'FC' },
    { path: '/admin/categories', label: 'Categories', icon: 'CT' },
    { path: '/admin/levels', label: 'Levels', icon: 'LV' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Polish Admin</h1>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <p className="user-email">{user?.email}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop and overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main content */}
      <main className="admin-main">
        {/* Header with hamburger menu */}
        <header className="admin-header">
          <button
            className="hamburger-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>
          <h2 className="page-title">Admin Panel</h2>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Routes>
            <Route path="" element={<AdminDashboard />} />
            <Route path="flashcards" element={<FlashcardManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="levels" element={<LevelManagementPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
