import { useState, useEffect } from 'react';
import {
  Home,
  LineChart,
  Users,
  User,
  ListChecks,
  FileText,
  Mail,
  Inbox,
  Sun,
  Moon,
  Shield,
  Search,
  Bell,
  Radio,
  BookUser,
  Crosshair,
  CheckCircle,
  ChevronDown,
  UserCog,
  UserCheck,
} from 'lucide-react';
import '../styles/Dashboard.css';
import { useAuth } from '../context/AuthContext';
import YourFirearms from '../components/YourFirearms';
import ClientMessages from '../components/ClientMessages';

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="notification-popup-center">
      <div className="notification-content">
        <CheckCircle className="notification-icon" />
        <span>{message}</span>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Your Firearms');
  const [timeRange, setTimeRange] = useState('Week');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user) {
      setShowNotification(true);
    }
  }, [user]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
  };

  const getUserRoleDisplay = () => {
    switch (user?.role) {
      case 'admin':
        return {
          icon: <UserCog className="role-icon admin" />,
          text: 'Administrator',
          rank: 'Administrator',
        };
      case 'police':
        return {
          icon: <UserCheck className="role-icon police" />,
          text: 'Police Officer',
          rank: 'Sergeant',
        };
      default:
        return {
          icon: <User className="role-icon client" />,
          text: 'Client',
          rank: 'Client',
        };
    }
  };

  const roleDisplay = getUserRoleDisplay();

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {showNotification && user && (
        <Notification
          message={`Welcome back, ${user.username}!`}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Sidebar */}
      {/* <div className="sidebar">
        <div className="logo-section">
          <div className="pnp-logo-container">
            <img
              src="/src/assets/pnp-logo.png"
              alt="PNP Logo"
              className="pnp-logo"
            />
          </div>
          <h2>PNP Firearms Portal</h2>
        </div>

        <div className="menu-section">
          <ul className="menu-list">
            <li
              className={activeMenu === 'Dashboard' ? 'active' : ''}
              onClick={() => setActiveMenu('Dashboard')}
            >
              <Home className="menu-icon" />
              <span className="menu-text">Dashboard</span>
            </li>
            <li className="menu-category">CLIENT</li>
            <li
              className={activeMenu === 'Your Firearms' ? 'active' : ''}
              onClick={() => setActiveMenu('Your Firearms')}
            >
              <ListChecks className="menu-icon" />
              <span className="menu-text">Your Firearms</span>
            </li>
            <li className="menu-category">SUPPORT</li>
            <li
              className={activeMenu === 'Messages' ? 'active' : ''}
              onClick={() => setActiveMenu('Messages')}
            >
              <Mail className="menu-icon" />
              <span className="menu-text">Messages</span>
            </li>
          </ul>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>{activeMenu}</h1>
            <div className="breadcrumb">
              {/* <span>Home</span>
              <span>/</span> */}
              {/* <span>{activeMenu}</span> */}
            </div>
          </div>
          <div className="header-right">
            <button className="mode-toggle" onClick={toggleDarkMode}>
              {darkMode ? <Sun /> : <Moon />}
            </button>
            <div className="user-profile" onClick={toggleUserDropdown}>
              {user ? (
                <div className="user-avatar">
                  {user.first_name?.charAt(0)}
                  {user.last_name?.charAt(0)}
                </div>
              ) : (
                <div className="user-avatar">U</div>
              )}
              <div className="user-info">
                <span className="user-name">{user?.username || 'User'}</span>
                <span className="user-rank">{roleDisplay.rank}</span>
              </div>
              <ChevronDown
                className={`dropdown-icon ${showUserDropdown ? 'open' : ''}`}
              />
              {showUserDropdown && (
                <div className="user-dropdown">
                  {/* User info section */}
                  <div className="dropdown-user-info">
                    <div className="user-fullname">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="user-email">
                      {user?.email || 'No email provided'}
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item">Profile</div>
                  <div className="dropdown-item">Settings</div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-role">
                    {roleDisplay.icon}
                    <span>{roleDisplay.text}</span>
                  </div>

                  <div className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conditional rendering based on activeMenu */}
        {activeMenu === 'Dashboard' && (
          <div className="dashboard-content">
            {/* Dashboard content would go here */}
          </div>
        )}

        {activeMenu === 'Your Firearms' && <YourFirearms />}

        {activeMenu === 'Messages' && <ClientMessages />}
      </div>
    </div>
  );
};

export default ClientDashboard;