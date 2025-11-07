import { useNavigate } from 'react-router-dom';
import { useLevels } from '../../hooks/useLevels';
import { useAdminFlashcards } from '../../hooks/admin/useAdminFlashcards';
import { useAdminCategories } from '../../hooks/admin/useAdminCategories';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { RecentActivity, mockActivities } from '../common/RecentActivity';
import './AdminDashboard.css';

/**
 * Admin dashboard showing overview statistics
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: levels, loading: levelsLoading } = useLevels();
  const { flashcards: allFlashcards, loading: cardsLoading } = useAdminFlashcards({
    level: null,
    category: null,
    mode: null
  });

  // Fetch categories for A1 and A2 levels (both have categories)
  const { categories: a1Categories, loading: a1CategoriesLoading } = useAdminCategories('A1');
  const { categories: a2Categories, loading: a2CategoriesLoading } = useAdminCategories('A2');

  const loading = levelsLoading || cardsLoading || a1CategoriesLoading || a2CategoriesLoading;
  const totalCategories = (a1Categories?.length || 0) + (a2Categories?.length || 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-levels">LV</div>
          <div className="stat-content">
            <h3 className="stat-label">Levels</h3>
            <p className="stat-value">{levels?.length || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-flashcards">FC</div>
          <div className="stat-content">
            <h3 className="stat-label">Flashcards</h3>
            <p className="stat-value">{allFlashcards?.length || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-categories">CT</div>
          <div className="stat-content">
            <h3 className="stat-label">Categories</h3>
            <p className="stat-value">{totalCategories}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <ul className="quick-links">
          <li>
            <button
              className="quick-link"
              onClick={() => navigate('/admin/flashcards')}
              type="button"
            >
              Manage Flashcards
            </button>
          </li>
          <li>
            <button
              className="quick-link"
              onClick={() => navigate('/admin/categories')}
              type="button"
            >
              Manage Categories
            </button>
          </li>
          <li>
            <button
              className="quick-link"
              onClick={() => navigate('/admin/levels')}
              type="button"
            >
              Manage Levels
            </button>
          </li>
        </ul>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <span className="section-subtitle">Last 5 changes</span>
        </div>
        <RecentActivity
          activities={mockActivities}
          maxItems={5}
          onViewAll={() => navigate('/admin/activity')}
        />
      </div>
    </div>
  );
}
