import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PageLoadAuthCheck = () => {
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once on initial load
    if (hasChecked) return;

    const checkAuthOnLoad = () => {
      const token = localStorage.getItem("access_token");
      
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      console.log('Page Load Auth Check:', {
        token: !!token,
        currentPath,
        isPublicRoute
      });
      
      // Only redirect if no token and trying to access protected route
      if (!token && !isPublicRoute) {
        console.log('Page load check failed, redirecting to login');
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login', { replace: true });
      }
      
      setHasChecked(true);
    };

    // Run check immediately
    checkAuthOnLoad();
  }, [navigate, hasChecked]);

  // Only check on visibility change if we haven't checked yet
  useEffect(() => {
    if (!hasChecked) return;

    const handleVisibilityChange = () => {
      if (document.hidden) return;
      
      const token = localStorage.getItem("access_token");
      
      // Only check if no token and not on public route
      if (!token) {
        const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        if (!isPublicRoute) {
          console.log('Visibility change check failed, redirecting to login');
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [navigate, hasChecked]);

  return null;
};

export default PageLoadAuthCheck;
