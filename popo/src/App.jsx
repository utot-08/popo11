import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import BrowserNavigationBlocker from './components/BrowserNavigationBlocker';
import PageLoadAuthCheck from './components/PageLoadAuthCheck';
import OTPLogin from './components/OTPLogin';
import PoliceDashboard from './pages/Dashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './components/Unauthorized';
import Patrols from './components/Patrols'; 
import ChangePassword from "./components/ChangePassword";
import ChangePasswordSuccess from "./components/ChangePasswordSuccess";
import EmailVerificationSuccess from './components/EmailVerificationSuccess';
import BlotterList from './components/BlotterList';
import './styles/LoginForm.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <PageLoadAuthCheck />
        <BrowserNavigationBlocker />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <div className="login-page-container">
              <div className="login-glass-container scale-in">
                <OTPLogin />
              </div>
            </div>
          } />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/change-password-success" element={<ChangePasswordSuccess />} />
          <Route path="/verify-email/:token" element={<EmailVerificationSuccess />} />
          <Route path="/blotter" element={<BlotterList />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Default route - redirects based on role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Police Routes */}
          <Route element={<PrivateRoute allowedRoles={['police_officer']} />}>
            <Route path="/police/*" element={<PoliceDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={['administrator']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* Client Routes */}
          <Route element={<PrivateRoute allowedRoles={['client']} />}>
            <Route path="/client/*" element={<ClientDashboard />} />
          </Route>

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

// Role-based redirect component with proper authentication check
const RoleBasedRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'police_officer':
      return <Navigate to="/police" replace />;
    case 'administrator':
      return <Navigate to="/admin" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;