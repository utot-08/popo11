import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Function to check and enforce authentication
    const enforceAuth = () => {
      const token = localStorage.getItem("access_token");
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
      
      // If no token and trying to access protected route
      if (!token && !isPublicRoute) {
        console.log('No token found, redirecting to login');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('rememberedEmail');
        navigate('/login', { replace: true });
        return false;
      }

      // If token exists but user is not authenticated
      if (token && !isAuthenticated && !isLoading && !isPublicRoute) {
        console.log('Token exists but user not authenticated, redirecting to login');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login', { replace: true });
        return false;
      }

      return true;
    };

    // Check authentication on every location change
    if (!isLoading) {
      enforceAuth();
    }
  }, [location.pathname, isAuthenticated, isLoading, navigate]);

  // Global navigation interceptor
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Override pushState
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      
      // Check authentication after navigation
      setTimeout(() => {
        const token = localStorage.getItem("access_token");
        const currentPath = window.location.pathname;
        const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        if (!token && !isPublicRoute) {
          console.log('Navigation intercepted: No token, redirecting to login');
          navigate('/login', { replace: true });
        }
      }, 0);
    };

    // Override replaceState
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      
      // Check authentication after navigation
      setTimeout(() => {
        const token = localStorage.getItem("access_token");
        const currentPath = window.location.pathname;
        const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        if (!token && !isPublicRoute) {
          console.log('Navigation intercepted: No token, redirecting to login');
          navigate('/login', { replace: true });
        }
      }, 0);
    };

    // Cleanup
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default NavigationGuard;
