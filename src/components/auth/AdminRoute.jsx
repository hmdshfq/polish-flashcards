import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Protected route component for admin-only pages
 * Redirects non-admin users to the login page
 */
export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
