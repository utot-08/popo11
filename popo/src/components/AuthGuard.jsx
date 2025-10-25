import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check authentication if not loading
    if (!isLoading) {
      const token = localStorage.getItem("access_token");
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
      
      // If no token and trying to access protected route
      if (!token && !isPublicRoute) {
        // Clear any cached data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('rememberedEmail');
        navigate('/login', { replace: true });
        return;
      }

      // If token exists but user is not authenticated (token might be invalid)
      if (token && !isAuthenticated && !isPublicRoute) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
