import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NuclearAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const performNuclearAuthCheck = () => {
      const token = localStorage.getItem("access_token");
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
      
      console.log('Nuclear Auth Check:', {
        token: !!token,
        isAuthenticated,
        isLoading,
        currentPath: location.pathname,
        isPublicRoute
      });

      // If no token and trying to access protected route
      if (!token && !isPublicRoute) {
        console.log('NUCLEAR: No token, clearing everything and redirecting');
        // Nuclear cleanup
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear browser history completely
        window.history.replaceState(null, '', '/login');
        
        // Force immediate redirect
        navigate('/login', { replace: true });
        window.location.href = '/login';
        return;
      }

      // If token exists but user is not authenticated
      if (token && !isAuthenticated && !isLoading && !isPublicRoute) {
        console.log('NUCLEAR: Token exists but not authenticated, clearing everything');
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState(null, '', '/login');
        navigate('/login', { replace: true });
        window.location.href = '/login';
        return;
      }

      setIsChecking(false);
    };

    // Perform check immediately
    performNuclearAuthCheck();

    // Also perform check on every location change
    const interval = setInterval(performNuclearAuthCheck, 100);

    return () => clearInterval(interval);
  }, [location.pathname, isAuthenticated, isLoading, navigate]);

  // Override all browser navigation methods
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    const originalGo = window.history.go;
    const originalBack = window.history.back;
    const originalForward = window.history.forward;

    const checkAuthBeforeNavigation = () => {
      const token = localStorage.getItem("access_token");
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!token && !isPublicRoute) {
        console.log('NUCLEAR: Navigation blocked - no token');
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState(null, '', '/login');
        window.location.href = '/login';
        return false;
      }
      return true;
    };

    // Override pushState
    window.history.pushState = function(...args) {
      if (!checkAuthBeforeNavigation()) return;
      originalPushState.apply(this, args);
    };

    // Override replaceState
    window.history.replaceState = function(...args) {
      if (!checkAuthBeforeNavigation()) return;
      originalReplaceState.apply(this, args);
    };

    // Override go
    window.history.go = function(...args) {
      if (!checkAuthBeforeNavigation()) return;
      originalGo.apply(this, args);
    };

    // Override back
    window.history.back = function(...args) {
      if (!checkAuthBeforeNavigation()) return;
      originalBack.apply(this, args);
    };

    // Override forward
    window.history.forward = function(...args) {
      if (!checkAuthBeforeNavigation()) return;
      originalForward.apply(this, args);
    };

    // Cleanup
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.history.go = originalGo;
      window.history.back = originalBack;
      window.history.forward = originalForward;
    };
  }, []);

  // Block all unauthorized access attempts
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    const handlePopState = () => {
      const token = localStorage.getItem("access_token");
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!token && !isPublicRoute) {
        console.log('NUCLEAR: Popstate blocked - no token');
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState(null, '', '/login');
        window.location.href = '/login';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (isChecking || isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div>Security Check in Progress...</div>
      </div>
    );
  }

  return null;
};

export default NuclearAuthGuard;
