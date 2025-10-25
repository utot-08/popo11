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
  Radio,
  BookUser,
  Crosshair,
  CheckCircle,
  ChevronDown,
  UserCog,
  UserCheck,
  AlertTriangle,
  X,
  Bell,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import '../styles/Dashboard.css';
import { useAuth } from '../context/AuthContext';
import YourFirearms from '../components/YourFirearms';
import ClientMessages from '../components/ClientMessages';
import ClientProfile from '../components/ClientProfile';
import { fetchUserFirearmLicenses } from '../api/api';
import { getLicenseNotifications } from '../utils/licenseExpiryUtils';

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
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  // License expiry notification states
  const [licenses, setLicenses] = useState([]);
  const [licenseNotifications, setLicenseNotifications] = useState([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  useEffect(() => {
    if (user) {
      setShowNotification(true);
    }
  }, [user]);

  // Fetch user's firearm licenses and check for expiry notifications
  useEffect(() => {
    const fetchLicensesAndNotifications = async () => {
      if (!user) return;

      try {
        setLoadingLicenses(true);
        const userLicenses = await fetchUserFirearmLicenses();
        setLicenses(userLicenses);
        
        // Get notifications based on expiry dates
        const notifications = getLicenseNotifications(userLicenses);
        setLicenseNotifications(notifications);
      } catch (error) {
        console.error('Error fetching licenses:', error);
      } finally {
        setLoadingLicenses(false);
      }
    };

    fetchLicensesAndNotifications();
  }, [user]);

  // Refresh notifications when licenses change
  useEffect(() => {
    if (licenses.length > 0) {
      const notifications = getLicenseNotifications(licenses);
      setLicenseNotifications(notifications);
    }
  }, [licenses]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationDropdown && !event.target.closest('.notification-bell-container')) {
        setShowNotificationDropdown(false);
      }
      if (showUserDropdown && !event.target.closest('.user-profile')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown, showUserDropdown]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const handleLogout = () => {
    logout();
  };

  // Handle dismissing individual notifications
  const handleDismissNotification = (licenseId) => {
    setDismissedNotifications(prev => new Set(prev).add(licenseId));
  };

  // Filter out dismissed notifications
  const activeNotifications = licenseNotifications.filter(
    notification => !dismissedNotifications.has(notification.license.id)
  );

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="notification-icon critical" size={16} />;
      case 'warning':
        return <AlertTriangle className="notification-icon warning" size={16} />;
      case 'notice':
        return <Clock className="notification-icon notice" size={16} />;
      default:
        return <Shield className="notification-icon" size={16} />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserRoleDisplay = () => {
    switch (user?.role) {
      case 'administrator':
        return {
          icon: <UserCog className="role-icon admin" />,
          text: 'Administrator',
          rank: 'Administrator',
        };
      case 'police_officer':
        return {
          icon: <UserCheck className="role-icon police" />,
          text: 'Police Officer',
          rank: 'Police Officer',
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


  // Menu label mapping function to convert component names to display names
  const getMenuLabel = (menuName) => {
    const menuLabels = {
      'Dashboard': 'Dashboard',
      'Your Firearms': 'Your Firearms',
      'Messages': 'Messages',
      'Profile': 'Profile'
    };
    return menuLabels[menuName] || menuName;
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {showNotification && user && (
        <Notification
          message={`Welcome back, ${user.first_name}!`}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>{getMenuLabel(activeMenu)}</h1>
            <div className="breadcrumb">
              <span>{getMenuLabel(activeMenu)}</span>
            </div>
          </div>
          <div className="header-right">
            {/* Notification Bell */}
            <div className="notification-bell-container">
              <button 
                className={`notification-bell ${activeNotifications.some(n => n.type === 'critical') ? 'has-critical' : ''}`}
                onClick={toggleNotificationDropdown}
                title="Notifications"
              >
                <Bell size={20} />
                {activeNotifications.length > 0 && (
                  <span className="notification-badge">{activeNotifications.length}</span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h4>Notifications</h4>
                    <span className="notification-count">{activeNotifications.length}</span>
                  </div>
                  
                  <div className="notification-dropdown-content">
                    {activeNotifications.length > 0 ? (
                      activeNotifications.map((notification) => (
                        <div 
                          key={notification.license.id} 
                          className={`notification-item ${notification.type}`}
                        >
                          <div className="notification-item-header">
                            {getNotificationIcon(notification.type)}
                            <div className="notification-item-content">
                              <h5>{notification.title}</h5>
                              <p>{notification.message}</p>
                            </div>
                            <button
                              className="notification-dismiss"
                              onClick={() => handleDismissNotification(notification.license.id)}
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          
                          <div className="notification-item-details">
                            <div className="notification-detail-row">
                              <span className="detail-label">License:</span>
                              <span className="detail-value">{notification.license.license_number}</span>
                            </div>
                            <div className="notification-detail-row">
                              <span className="detail-label">Firearm:</span>
                              <span className="detail-value">{notification.license.firearm_details}</span>
                            </div>
                            <div className="notification-detail-row">
                              <span className="detail-label">Expires:</span>
                              <span className="detail-value">{formatDate(notification.license.expiry_date)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <Bell size={24} />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
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
                <span className="user-name">{user?.first_name || 'User'}</span>
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

                  <div className="dropdown-item" onClick={() => setActiveMenu('Profile')}>
                    Profile
                  </div>
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

        {activeMenu === 'Profile' && <ClientProfile onBack={() => setActiveMenu('Your Firearms')} />}
      </div>
    </div>
  );
};

export default ClientDashboard;