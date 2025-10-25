import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BrowserNavigationBlocker = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId] = useState(() => Date.now().toString());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;
    
    // Store session ID in sessionStorage
    sessionStorage.setItem('auth_session_id', sessionId);
    
    // Store current authenticated state
    if (isAuthenticated) {
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('auth_timestamp', Date.now().toString());
    } else {
      // Only clear session if we're not on a public route
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!isPublicRoute) {
        sessionStorage.removeItem('is_authenticated');
        sessionStorage.removeItem('auth_timestamp');
      }
    }
    
    setIsInitialized(true);
  }, [isAuthenticated, sessionId, isInitialized]);

  useEffect(() => {
    // Only set up navigation blocking once
    if (!isInitialized) return;

    // Disable browser navigation without causing refreshes
    const disableNavigation = () => {
      // Push current state to prevent back navigation
      window.history.pushState(null, '', window.location.href);
      
      // Handle popstate events
      const handlePopState = (event) => {
        console.log('Navigation blocked - popstate event');
        
        // Check authentication without forcing refresh
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          console.log('No token found, redirecting to login');
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
        } else {
          // Push state again to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    };

    const cleanup = disableNavigation();
    return cleanup;
  }, [isInitialized, navigate]);

  useEffect(() => {
    // Check authentication on page visibility change (less aggressive)
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      
      const token = localStorage.getItem("access_token");
      
      // Only check if no token and not on public route
      if (!token) {
        const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        if (!isPublicRoute) {
          console.log('No token found on visibility change, redirecting to login');
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [navigate]);

  // Only check on focus events - simplified
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        if (!isPublicRoute) {
          console.log('No token on focus, redirecting to login');
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [navigate]);

  return null;
};

export default BrowserNavigationBlocker;
