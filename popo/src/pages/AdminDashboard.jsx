import { useState, useEffect } from 'react';
import {
  Home,
  LineChart,
  Users,
  Calendar,
  User,
  ListChecks,
  FileText,
  Table,
  Mail,
  Inbox,
  Sun,
  Moon,
  Shield,
  Car,
  Phone,
  MapPin,
  ChevronDown,
  Search,
  Bell,
  Radio,
  BookUser,
  Crosshair,
  CheckCircle,
  UserCog,
  UserCheck,
  UserPlus,
  Gavel,
  ShieldHalf,
  Archive,
  AlertTriangle,
  BadgeInfo,
  Fingerprint,
  Contact,
  ShieldCheck,
  FileSearch,
} from 'lucide-react';
import '../styles/Dashboard.css';
import AddOwner from '../components/AddOwner';
import Firearms from '../components/Firearms';
import { useAuth } from '../context/AuthContext';
import OwnerProfile from '../components/OwnerProfile';
import FirearmsStatus from '../components/FirearmsStatus';
import UserList from '../components/UserList';
import Analytics from '../components/Analytics';
import Patrols from '../components/Patrols';
import Reports from '../components/Reports';
import Personnel from '../components/Personnel';
import Messages from '../components/Messages';
import InboxComponent from '../components/Inbox';
import Dispatch from '../components/Dispatch';
import axios from 'axios';

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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [timeRange, setTimeRange] = useState('Week');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [metrics, setMetrics] = useState({
    total_clients: 0,
    total_firearms: 0,
    total_police_officers: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/metrics/')
        console.log(response.data)
        setMetrics({
          ...response.data,
          loading: false,
          error: null
        });
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || 'Failed to fetch dashboard metrics'
        }));
      }
    };

    fetchMetrics();
  }, []); // Empty dependency array means this runs once on mount

  if (metrics.loading) {
    return <div>Loading dashboard metrics...</div>;
  }

  if (metrics.error) {
    return <div className="error">{metrics.error}</div>;
  }

  // useEffect(() => {
  //   if (user) {
  //     setShowNotification(true);
  //   }
  // }, [user]);

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
      <div className="sidebar custom-scrollbar">
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
            <li className="menu-category">OPERATIONS</li>
            <li
              className={activeMenu === 'Analytics' ? 'active' : ''}
              onClick={() => setActiveMenu('Analytics')}
            >
              <LineChart className="menu-icon" />
              <span className="menu-text">Analytics</span>
            </li>
            <li
              className={activeMenu === 'Patrols' ? 'active' : ''}
              onClick={() => setActiveMenu('Patrols')}
            >
              <Car className="menu-icon" />
              <span className="menu-text">Patrols</span>
            </li>
            <li
              className={activeMenu === 'Personnel' ? 'active' : ''}
              onClick={() => setActiveMenu('Personnel')}
            >
              <Users className="menu-icon" />
              <span className="menu-text">Personnel</span>
            </li>
            <li className="menu-category">ADMINISTRATION</li>
            <li
              className={activeMenu === 'AddUser' ? 'active' : ''}
              onClick={() => setActiveMenu('AddUser')}
            >
              <UserPlus className="menu-icon" />
              <span className="menu-text">Add Owner</span>
            </li>
            <li
              className={activeMenu === 'Firearms' ? 'active' : ''}
              onClick={() => setActiveMenu('Firearms')}
            >
              <Crosshair className="menu-icon" />
              <span className="menu-text">Firearms</span>
            </li>
            <li
              className={activeMenu === 'Profile' ? 'active' : ''}
              onClick={() => setActiveMenu('Profile')}
            >
              <User className="menu-icon" />
              <span className="menu-text">Owner Profile</span>
            </li>
            <li
              className={activeMenu === 'FirearmsStatus' ? 'active' : ''}
              onClick={() => setActiveMenu('FirearmsStatus')}
            >
              <ListChecks className="menu-icon" />
              <span className="menu-text">Firearms Status</span>
            </li>
            <li
              className={activeMenu === 'UserList' ? 'active' : ''}
              onClick={() => setActiveMenu('UserList')}
            >
              <BookUser className="menu-icon" />
              <span className="menu-text">User List</span>
            </li>
            <li
              className={activeMenu === 'Reports' ? 'active' : ''}
              onClick={() => setActiveMenu('Reports')}
            >
              <FileText className="menu-icon" />
              <span className="menu-text">Reports</span>
            </li>
            <li className="menu-category">SUPPORT</li>
            <li
              className={activeMenu === 'Messages' ? 'active' : ''}
              onClick={() => setActiveMenu('Messages')}
            >
              <Mail className="menu-icon" />
              <span className="menu-text">Messages</span>
            </li>
            <li
              className={activeMenu === 'Inbox' ? 'active' : ''}
              onClick={() => setActiveMenu('Inbox')}
            >
              <Inbox className="menu-icon" />
              <span className="menu-text">Inbox</span>
            </li>
            <li
              className={activeMenu === 'Dispatch' ? 'active' : ''}
              onClick={() => setActiveMenu('Dispatch')}
            >
              <Radio className="menu-icon" />
              <span className="menu-text">Dispatch</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>{activeMenu}</h1>
            <div className="breadcrumb">
              <span>Home</span>
              <span>/</span>
              <span>{activeMenu}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <Search className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="notification-btn">
              <Bell />
              <span className="notification-badge">3</span>
            </button>
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

        {/* Dashboard Content */}
        {activeMenu === 'Dashboard' && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText />
                </div>
                <div className="stat-content">
                  <div className="stat-header">
                    <h3>Total Owners</h3>
                  </div>
                  <div className="stat-value">{metrics.total_clients}</div>
                  <div className="stat-footer">This month</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <ListChecks />
                </div>
                <div className="stat-content">
                  <div className="stat-header">
                    <h3>Firearms</h3>
                  </div>
                    <div className="stat-value">{metrics.total_firearms}</div>
                  <div className="stat-footer">This month</div>
                </div>
              </div>

            
              <div className="stat-card">
                <div className="stat-icon">
                  <Users />
                </div>
                <div className="stat-content">
                  <div className="stat-header">
                    <h3>Personnel</h3>
                  </div>
                  <div className="stat-value">{metrics.total_police_officers}</div>
                  <div className="stat-footer">Currently Active</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            {/* <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Incident Reports</h3>
                  <div className="time-range">
                    <span
                      className={timeRange === 'Day' ? 'active' : ''}
                      onClick={() => setTimeRange('Day')}
                    >
                      Day
                    </span>
                    <span
                      className={timeRange === 'Week' ? 'active' : ''}
                      onClick={() => setTimeRange('Week')}
                    >
                      Week
                    </span>
                    <span
                      className={timeRange === 'Month' ? 'active' : ''}
                      onClick={() => setTimeRange('Month')}
                    >
                      Month
                    </span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    {[60, 80, 45, 70, 90, 50, 75].map((height, index) => (
                      <div
                        key={index}
                        className="chart-bar"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Crime by Category</h3>
                </div>
                <div className="pie-chart-placeholder">
                  <div className="pie-chart">
                    <div className="pie-segment theft"></div>
                    <div className="pie-segment assault"></div>
                    <div className="pie-segment burglary"></div>
                    <div className="pie-segment traffic"></div>
                    <div className="pie-center"></div>
                  </div>
                  <div className="pie-legend">
                    <div>
                      <span className="legend-color theft"></span>Confiscated
                      (25%)
                    </div>
                    <div>
                      <span className="legend-color assault"></span>Surrendered
                      (25%)
                    </div>
                    <div>
                      <span className="legend-color burglary"></span>Deposit
                      (25%)
                    </div>
                    <div>
                      <span className="legend-color traffic"></span>Abandon
                      (25%)
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Recent Activity */}
            {/* <div className="recent-activity">
              <div className="activity-header">
                <h3>Recent Dispatch Calls</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Units</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="time-cell">14:32</td>
                    <td>Main St & 5th Ave</td>
                    <td>
                      <span className="incident-type disturbance">
                        Disturbance
                      </span>
                    </td>
                    <td>
                      <span className="status active">Active</span>
                    </td>
                    <td>Unit 12, Unit 45</td>
                    <td>
                      <button className="action-btn">Details</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="time-cell">13:45</td>
                    <td>2500 Elm St</td>
                    <td>
                      <span className="incident-type burglary">Burglary</span>
                    </td>
                    <td>
                      <span className="status pending">Pending</span>
                    </td>
                    <td>Unit 33</td>
                    <td>
                      <button className="action-btn">Details</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="time-cell">12:18</td>
                    <td>Highway 101</td>
                    <td>
                      <span className="incident-type traffic">
                        Traffic Collision
                      </span>
                    </td>
                    <td>
                      <span className="status resolved">Resolved</span>
                    </td>
                    <td>Unit 7, Unit 19</td>
                    <td>
                      <button className="action-btn">Details</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="time-cell">11:05</td>
                    <td>City Park</td>
                    <td>
                      <span className="incident-type suspicious">
                        Suspicious Activity
                      </span>
                    </td>
                    <td>
                      <span className="status resolved">Resolved</span>
                    </td>
                    <td>Unit 22</td>
                    <td>
                      <button className="action-btn">Details</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}
          </div>
        )}

        {/* Add Owner Content */}
        {activeMenu === 'AddUser' && <AddOwner />}

        {/* Firearms Content */}
        {activeMenu === 'Firearms' && <Firearms />}

        {/* Owner Profile Content */}
        {activeMenu === 'Profile' && <OwnerProfile />}

        {/* Firearms Status Content */}
        {activeMenu === 'FirearmsStatus' && <FirearmsStatus />}

        {/* User List Content */}
        {activeMenu === 'UserList' && <UserList />}

        {/* Analytics Content */}
        {activeMenu === 'Analytics' && <Analytics />}

        {/* Patrols Content */}
        {activeMenu === 'Patrols' && <Patrols />}

        {/* Reports Content */}
        {activeMenu === 'Reports' && <Reports />}

        {/* Personnel Content */}
        {activeMenu === 'Personnel' && <Personnel />}

        {/* Messages Content */}
        {activeMenu === 'Messages' && <Messages />}

        {/* Inbox Content */}
        {activeMenu === 'Inbox' && <InboxComponent />}

        {/* Dispatch Content */}
        {activeMenu === 'Dispatch' && <Dispatch />}
      </div>
    </div>
  );
};

export default AdminDashboard;
