import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const performNuclearCheck = () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        console.log('NUCLEAR PrivateRoute: No token found');
        localStorage.clear();
        sessionStorage.clear();
        setIsChecking(false);
        return false;
      }

      if (!isAuthenticated && !isLoading) {
        console.log('NUCLEAR PrivateRoute: Token exists but not authenticated');
        localStorage.clear();
        sessionStorage.clear();
        setIsChecking(false);
        return false;
      }

      setIsChecking(false);
      return true;
    };

    performNuclearCheck();
  }, [isAuthenticated, isLoading]);

  if (isLoading || isChecking) {
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
        <div>Security Verification...</div>
      </div>
    );
  }

  // Check if token exists in localStorage
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.log('NUCLEAR PrivateRoute: Redirecting to login - no token');
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    console.log('NUCLEAR PrivateRoute: Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('NUCLEAR PrivateRoute: Redirecting to unauthorized - wrong role');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('NUCLEAR PrivateRoute: Access granted');
  return <Outlet />;
};