import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading, isLoggedIn, logout } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="font-serif text-2xl text-maroon mb-2">Access Denied</p>
          <p className="text-gray-500 text-sm mb-6">Admin privileges required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="px-6 py-2.5 border border-maroon text-maroon text-sm uppercase tracking-wider hover:bg-maroon hover:text-white transition-colors">
              Go Home
            </Link>
            <button type="button" onClick={logout} className="px-6 py-2.5 bg-maroon text-white text-sm uppercase tracking-wider hover:bg-maroon-dark transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
