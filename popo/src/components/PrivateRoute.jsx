import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className='flex items-center justify-center'><Loader /></div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log(user)
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};