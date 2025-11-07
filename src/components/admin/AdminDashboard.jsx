import { useLevels } from '../../hooks/useLevels';
import { useFlashcards } from '../../hooks/useFlashcards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './AdminDashboard.css';

/**
 * Admin dashboard showing overview statistics
 */
export function AdminDashboard() {
  const { data: levels, loading: levelsLoading } = useLevels();
  const { data: allFlashcards, loading: cardsLoading } = useFlashcards(null, null, null);

  const loading = levelsLoading || cardsLoading;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3 className="stat-label">Levels</h3>
            <p className="stat-value">{levels?.length || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3 className="stat-label">Flashcards</h3>
            <p className="stat-value">{allFlashcards?.length || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-label">Categories</h3>
            <p className="stat-value">Coming soon</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Links</h2>
        <ul className="quick-links">
          <li>
            <a href="/admin/flashcards" className="quick-link">
              Manage Flashcards
            </a>
          </li>
          <li>
            <a href="/admin/categories" className="quick-link">
              Manage Categories
            </a>
          </li>
          <li>
            <a href="/admin/levels" className="quick-link">
              Manage Levels
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
