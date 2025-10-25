import { useState, useEffect } from 'react';
import {
  Home,
  LineChart as LineChartIcon,
  TrendingUp,
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
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { Spinner } from 'react-bootstrap';
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
import GunManager from '../components/GunManager';
import FirearmLicenseRegistration from '../components/FirearmLicenseRegistration';
import FirearmLicenseManagement from '../components/FirearmLicenseManagement';
import BlotterList from '../components/BlotterList';
import GlobalSearch from '../components/GlobalSearch';
import Help from '../components/Help';
import HelpButton from '../components/HelpButton';
import api from '../api/axios';

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

// Move all components outside of AdminDashboard component to avoid hook order issues
const renderCustomizedLabel = ({ value, percent }) => {
  return `${value} (${percent}%)`;
};

const Graph = ({ metrics }) => {
  const data = [
    {
      name: 'Owners',
      value: metrics.total_clients,
    },
    {
      name: 'Firearms',
      value: metrics.total_firearms,
    },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <BarChart
        width={800}
        height={600}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="category" dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

// Move chart components outside of AdminDashboard component to avoid hook order issues
const StatusPieChart = ({ statusCounts, onStatusClick }) => {
  const COLORS = [
    '#f06595',
    '#cc5de8',
    '#51cf66',
    '#339af0',
    '#ff922b',
    '#f03e3e',
  ];

  const data = [
    { name: 'Captured', value: statusCounts?.captured || 0, key: 'captured' },
    { name: 'Confiscated', value: statusCounts?.confiscated || 0, key: 'confiscated' },
    { name: 'Surrendered', value: statusCounts?.surrendered || 0, key: 'surrendered' },
    { name: 'Deposited', value: statusCounts?.deposited || 0, key: 'deposited' },
    { name: 'Abandoned', value: statusCounts?.abandoned || 0, key: 'abandoned' },
    { name: 'Forfeited', value: statusCounts?.forfeited || 0, key: 'forfeited' },
  ].filter(item => item.value > 0); // Only show segments with data

  // Custom label renderer to prevent overlapping and show status names
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    if (percent < 0.08) return null; // Don't show labels for segments less than 8%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={renderCustomizedLabel}
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                onClick={() => onStatusClick && onStatusClick(entry.key)}
                style={{ 
                  cursor: onStatusClick ? 'pointer' : 'default',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} firearms`, name]}
            labelFormatter={(label) => `Status: ${label}`}
            labelStyle={{ color: '#374151', fontWeight: '600' }}
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              fontSize: '14px'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '30px',
              fontSize: '14px',
              fontWeight: '500'
            }}
            iconType="circle"
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Analytics Components
const MonthlyTrendChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="firearmsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="ownersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="firearms"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#firearmsGradient)"
            name="Firearms"
          />
          <Area
            type="monotone"
            dataKey="owners"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#ownersGradient)"
            name="Owners"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


const MunicipalityStatsChart = ({ data, userRole, selectedMunicipality }) => {
  // For administrators and police officers with selected municipality, show detailed breakdown charts
  if ((userRole === 'administrator' || (userRole === 'police_officer' && selectedMunicipality)) && 
      data && data.length > 0 && data[0].firearms_by_status) {
    const munData = data[0];
    
    // Prepare data for status breakdown
    const statusData = Object.entries(munData.firearms_by_status).map(([status, count]) => ({
      name: status,
      count: count
    }));

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [value, 'Firearms']}
            />
            <Legend />
            <Bar dataKey="count" fill="#8b5cf6" name="Firearms" radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // For police officers and clients, show the original chart
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="firearms" 
            fill="#3b82f6" 
            name="Firearms"
            radius={[2, 2, 0, 0]}
          />
          <Line 
            type="monotone" 
            dataKey="owners" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Owners"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Fixed Chart Wrapper Component
const FixedChart = ({ children, title, subtitle }) => {
  return (
    <div className="analytics-card">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">{title}</h4>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [timeRange, setTimeRange] = useState('Monthly');
  // Date range filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useDateRange, setUseDateRange] = useState(false);
  // Municipality filtering - automatic for administrators/clients, manual for police officers
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [navigateToFirearms, setNavigateToFirearms] = useState(false);
  const [firearmsFilter, setFirearmsFilter] = useState('all');
  const [metrics, setMetrics] = useState({
    total_clients: 0,
    total_firearms: 0,
    total_police_officers: 0,
    total_municipalities: 0,
    status_counts: {
      captured: 0,
      confiscated: 0,
      surrendered: 0,
      deposited: 0,
      abandoned: 0,
      forfeited: 0,
    },
    loading: true,
    error: null,
  });

  // Additional analytics state
  const [analyticsData, setAnalyticsData] = useState({
    monthlyTrends: [],
    firearmTypes: [],
    municipalityStats: [],
    loading: false,
  });

  // Real-time update state
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Add function to handle real-time updates
  const refreshDashboardData = async () => {
    try {
      // Refresh metrics
      const metricsParams = {};
      if (user?.role === 'police_officer' && selectedMunicipality) {
        metricsParams.municipality = selectedMunicipality.id;
      }
      
      // Use date range if enabled, otherwise use time range preset
      if (useDateRange && startDate && endDate) {
        metricsParams.start_date = startDate;
        metricsParams.end_date = endDate;
      } else {
        metricsParams.time_range = timeRange.toLowerCase();
      }

      const metricsResponse = await api.get('/api/dashboard/metrics/', { params: metricsParams });
      
      // Refresh chart data
      const chartParams = {};
      if (user?.role === 'police_officer' && selectedMunicipality) {
        chartParams.municipality = selectedMunicipality.id;
      }
      
      // Use date range if enabled, otherwise use time range preset
      if (useDateRange && startDate && endDate) {
        chartParams.start_date = startDate;
        chartParams.end_date = endDate;
      } else {
        chartParams.time_range = timeRange.toLowerCase();
      }

      const chartResponse = await api.get('/api/dashboard/chart-data/', { params: chartParams });

      // Update state
      setMetrics({
        total_clients: metricsResponse.data.total_clients || 0,
        total_firearms: metricsResponse.data.total_firearms || 0,
        total_police_officers: metricsResponse.data.total_police_officers || 0,
        status_counts: {
          captured: metricsResponse.data.status_counts?.captured || 0,
          confiscated: metricsResponse.data.status_counts?.confiscated || 0,
          surrendered: metricsResponse.data.status_counts?.surrendered || 0,
          deposited: metricsResponse.data.status_counts?.deposited || 0,
          abandoned: metricsResponse.data.status_counts?.abandoned || 0,
          forfeited: metricsResponse.data.status_counts?.forfeited || 0,
        },
        loading: false,
        error: null,
      });

      setAnalyticsData({
        monthlyTrends: chartResponse.data.monthly_trends || [],
        firearmTypes: chartResponse.data.firearm_types || [],
        municipalityStats: chartResponse.data.municipality_stats || [],
        loading: false,
      });

      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  // Add function to handle time range changes
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // Disable date range when switching to time range presets
    setUseDateRange(false);
  };

  // Add function to handle date range changes
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setUseDateRange(true);
    }
  };

  // Clear date range filter
  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setUseDateRange(false);
  };

  // Add function to handle status card clicks
  const handleStatusCardClick = (status) => {
    setFirearmsFilter(status);
    setNavigateToFirearms(true);
    setActiveMenu('Firearms');
  };

  // Fetch municipalities for police officers
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (user?.role === 'police_officer') {
        try {
          const response = await api.get('/api/users/?role=administrator');
          const municipalityData = response.data
            .filter(user => user.municipality)
            .map(user => ({
              id: user.id,
              first_name: user.first_name,
              municipality: user.municipality
            }));
          setMunicipalities(municipalityData);
        } catch (error) {
          console.error('Error fetching municipalities:', error);
        }
      }
    };

    fetchMunicipalities();
  }, [user?.role]);

  // Reset navigation state when menu changes
  useEffect(() => {
    if (activeMenu !== 'Firearms') {
      setNavigateToFirearms(false);
      setFirearmsFilter('all');
    }
  }, [activeMenu]);

  // Fetch chart data from API
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setAnalyticsData(prev => ({ ...prev, loading: true }));
        
        const params = {};
        if (user?.role === 'police_officer' && selectedMunicipality) {
          params.municipality = selectedMunicipality.id;
        }
        
        // Use date range if enabled, otherwise use time range preset
        if (useDateRange && startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        } else {
          params.time_range = timeRange.toLowerCase();
        }
        
        const response = await api.get('/api/dashboard/chart-data/', { params });
        setAnalyticsData({
          monthlyTrends: response.data.monthly_trends || [],
          firearmTypes: response.data.firearm_types || [],
          municipalityStats: response.data.municipality_stats || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setAnalyticsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchChartData();
  }, [selectedMunicipality, timeRange, useDateRange, startDate, endDate]);

  // Real-time updates with polling
  useEffect(() => {
    let intervalId;
    
    // Set up polling every 30 seconds when dashboard is active
    if (activeMenu === 'Dashboard') {
      intervalId = setInterval(() => {
        refreshDashboardData();
      }, 30000); // 30 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeMenu, selectedMunicipality, timeRange, useDateRange, startDate, endDate]);

  // Refresh data when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (activeMenu === 'Dashboard' && document.hasFocus()) {
        refreshDashboardData();
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (activeMenu === 'Dashboard') {
        refreshDashboardData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeMenu, selectedMunicipality, timeRange, useDateRange, startDate, endDate]);




  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    try {
      localStorage.setItem('admin_active_menu', menu);
    } catch (_) {}
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Menu label mapping function to convert component names to display names
  const getMenuLabel = (menuName) => {
    const menuLabels = {
      'Dashboard': 'Dashboard',
      'AddUser': 'Register',
      'LicenseRegistration': 'License Management',
      'LicenseManagement': 'Registered License',
      'Profile': 'Owner Profile',
      'Firearms': 'Registered Firearms',
      'BlotterList': 'Blotter List',
      'FirearmsStatus': 'Firearms Status',
      'Reports': 'Reports',
      'UserList': 'User Management',
      'GunManager': 'Gun Management',
      'Analytics': 'Analytics',
      'Patrols': 'Patrols',
      'Personnel': 'Personnel',
      'Messages': 'Messages',
      'Inbox': 'Inbox',
      'Dispatch': 'Dispatch',
      'Help': 'Help'
    };
    return menuLabels[menuName] || menuName;
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchMetrics = async () => {
      try {
        const params = {};
        if (user?.role === 'police_officer' && selectedMunicipality) {
          params.municipality = selectedMunicipality.id;
        }
        
        // Use date range if enabled, otherwise use time range preset
        if (useDateRange && startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        } else {
          params.time_range = timeRange.toLowerCase();
        }

        const response = await api.get(
          '/api/dashboard/metrics/',
          { 
            params,
            signal: controller.signal 
          }
        );

        if (isMounted) {
          setMetrics({
            total_clients: response.data.total_clients || 0,
            total_firearms: response.data.total_firearms || 0,
            total_police_officers: response.data.total_police_officers || 0,
            status_counts: {
              captured: response.data.status_counts?.captured || 0,
              confiscated: response.data.status_counts?.confiscated || 0,
              surrendered: response.data.status_counts?.surrendered || 0,
              deposited: response.data.status_counts?.deposited || 0,
              abandoned: response.data.status_counts?.abandoned || 0,
              forfeited: response.data.status_counts?.forfeited || 0,
            },
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          if (!axios.isCancel(error)) {
            setMetrics((prev) => ({
              ...prev,
              loading: false,
              error:
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch dashboard metrics',
            }));
          }
        }
      }
    };

    fetchMetrics();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedMunicipality, timeRange, useDateRange, startDate, endDate]);

  // Restore last requested menu (e.g., after Add Owner)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_active_menu');
      if (saved && saved !== activeMenu) {
        setActiveMenu(saved);
        // Clear it so future loads don't force this
        localStorage.removeItem('admin_active_menu');
      }
    } catch (_) {}
  }, []);

  if (metrics.loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <Spinner size={32} />
        </div>
        <div className="loading-text">Loading dashboard metrics...</div>
      </div>
    );
  }

  if (metrics.error) {
    return <div className="error">{metrics.error}</div>;
  }

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
          text: 'Municipality',
          rank: 'Local Municipality',
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

  // Handle search result clicks
  const handleSearchResultClick = (result) => {
    switch (result.type) {
      case 'firearm':
        setActiveMenu('Firearms');
        // If it's a suggestion, use the suggestion text as filter
        if (result.data?.suggestion) {
          // Check if it's a status suggestion
          if (result.data?.firearm_status) {
            setFirearmsFilter(result.data.firearm_status);
          } else {
            // For other firearm suggestions, use 'all' and let the search handle it
            setFirearmsFilter('all');
          }
        } else {
          setFirearmsFilter(result.data.firearm_status);
        }
        setNavigateToFirearms(true);
        break;
      case 'owner':
        setActiveMenu('Profile');
        break;
      case 'user':
        setActiveMenu('UserList');
        break;
      case 'license':
        setActiveMenu('LicenseManagement');
        break;
      case 'audit_log':
        setActiveMenu('AuditLogs');
        break;
      case 'search':
        // For recent searches, perform the search
        if (result.data?.suggestion) {
          setActiveMenu('Firearms');
          setFirearmsFilter('all');
          setNavigateToFirearms(true);
        }
        break;
      default:
        console.log('Unknown search result type:', result.type);
    }
  };


  // Render status cards with click functionality
  const renderStatusCards = () => (
    <div className="admin-statuses-section">
      <h3 className="admin-section-title">Firearm Statuses</h3>
      <div className="admin-status-grid">
        {/* Status cards (same as Dashboard.jsx) */}
        <div 
          className="admin-status-card admin-status-card--captured clickable-status-card"
          onClick={() => handleStatusCardClick('captured')}
          title="Click to view captured firearms"
        >
          <div className="admin-status-icon">
            <Gavel size={20} />
          </div>
          <div className="admin-status-body">
            <div className="admin-status-label">Captured</div>
            <div className="admin-status-value">
              {metrics.status_counts?.captured || 0}
            </div>
          </div>
          <div className="status-card-arrow">→</div>
        </div>

        {/* Other status cards... */}
        <div 
          className="admin-status-card admin-status-card--confiscated clickable-status-card"
          onClick={() => handleStatusCardClick('confiscated')}
          title="Click to view confiscated firearms"
        >
          <div className="admin-status-icon">
            <Gavel size={20} />
          </div>
          <div className="admin-status-body">
            <div className="admin-status-label">Confiscated</div>
            <div className="admin-status-value">
              {metrics.status_counts?.confiscated || 0}
            </div>
          </div>
          <div className="status-card-arrow">→</div>
        </div>

        <div 
          className="admin-status-card admin-status-card--surrendered clickable-status-card"
          onClick={() => handleStatusCardClick('surrendered')}
          title="Click to view surrendered firearms"
        >
          <div className="admin-status-icon">
            <ShieldHalf size={20} />
          </div>
          <div className="admin-status-body">
            <div className="admin-status-label">Surrendered</div>
            <div className="admin-status-value">
              {metrics.status_counts?.surrendered || 0}
            </div>
          </div>
          <div className="status-card-arrow">→</div>
        </div>

        <div 
          className="admin-status-card admin-status-card--deposited clickable-status-card"
          onClick={() => handleStatusCardClick('deposited')}
          title="Click to view deposited firearms"
        >
          <div className="admin-status-icon">
            <Archive size={20} />
          </div>
          <div className="admin-status-body">
            <div className="admin-status-label">Deposited</div>
            <div className="admin-status-value">
              {metrics.status_counts?.deposited || 0}
            </div>
          </div>
          <div className="status-card-arrow">→</div>
        </div>

        <div 
          className="admin-status-card admin-status-card--abandoned clickable-status-card"
          onClick={() => handleStatusCardClick('abandoned')}
          title="Click to view abandoned firearms"
        >
          <div className="admin-status-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="admin-status-body">
            <div className="admin-status-label">Abandoned</div>
            <div className="admin-status-value">
              {metrics.status_counts?.abandoned || 0}
            </div>
          </div>
          <div className="status-card-arrow">→</div>
        </div>

        <div 
          className="admin-status-card admin-status-card--forfeited clickable-status-card"
          onClick={() => handleStatusCardClick('forfeited')}
          title="Click to view forfeited firearms"
        >
          <div className="admin-status-icon">
            <AlertCircle size={20} />
          </div>
          <div className="admin-status-body">
            <div className="admin-status-label">Forfeited</div>
            <div className="admin-status-value">
              {metrics.status_counts?.forfeited || 0}
            </div>
          </div>
          <div className="status-card-arrow">→</div>
        </div>
      </div>
    </div>
  );


  // Render enhanced analytics section
  const renderAnalyticsSection = () => {
    if (analyticsData.loading) {
      return (
        <div className="analytics-section">
          <div className="analytics-header">
            <h3 className="analytics-title">
              <LineChartIcon size={20} />
              Analytics Dashboard
            </h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spinner />
          </div>
        </div>
      );
    }

    // Chart configurations
    const chartConfigs = {
      'monthly-trends': {
        title: 'Monthly Trends',
        subtitle: 'Firearms and Owners Registration',
        component: <MonthlyTrendChart data={analyticsData.monthlyTrends} />
      },
      'status-distribution': {
        title: 'Status Distribution',
        subtitle: 'Firearms by Current Status',
        component: <StatusPieChart 
          statusCounts={metrics.status_counts} 
          onStatusClick={handleStatusCardClick}
        />
      },
      'municipality-stats': {
        title: user?.role === 'client' ? 'Personal Statistics' : 
               user?.role === 'police_officer' ? 
                 (selectedMunicipality ? 'Firearms Status Breakdown' : 'All Municipalities Statistics') :
               'Firearms Status Breakdown',
        subtitle: user?.role === 'client' ? 'Your Records Overview' : 
                  user?.role === 'police_officer' ? 
                    (selectedMunicipality ? `Firearms by Status in ${selectedMunicipality.municipality}` : 'Performance Across All Locations') :
                  'Firearms by Status in Your Municipality',
        component: <MunicipalityStatsChart data={analyticsData.municipalityStats} userRole={user?.role} selectedMunicipality={selectedMunicipality} />
      }
    };

    return (
      <div className="analytics-section">
        <div className="analytics-header">
          <h3 className="analytics-title">
            <LineChartIcon size={20} />
            Analytics Dashboard
          </h3>
          <div className="chart-filters">
            <div className="chart-actions">
              <button 
                className={`chart-action-btn ${!useDateRange && timeRange === 'Monthly' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('Monthly')}
              >
                Monthly
              </button>
              <button 
                className={`chart-action-btn ${!useDateRange && timeRange === 'Quarterly' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('Quarterly')}
              >
                Quarterly
              </button>
              <button 
                className={`chart-action-btn ${!useDateRange && timeRange === 'Yearly' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('Yearly')}
              >
                Yearly
              </button>
            </div>
            <div className="date-range-filter">
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
                  className="date-input"
                  placeholder="Start Date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
                  className="date-input"
                  placeholder="End Date"
                  min={startDate}
                />
                {useDateRange && (
                  <button 
                    className="clear-date-btn"
                    onClick={clearDateRange}
                    title="Clear date range"
                  >
                    ✕
                  </button>
                )}
              </div>
              {useDateRange && startDate && endDate && (
                <small className="date-range-label">
                  Custom Range: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </small>
              )}
            </div>
          </div>
        </div>
        
        <div className="analytics-grid">
          <FixedChart
            title={chartConfigs['monthly-trends'].title}
            subtitle={chartConfigs['monthly-trends'].subtitle}
          >
            {chartConfigs['monthly-trends'].component}
          </FixedChart>
          
          <FixedChart
            title={chartConfigs['status-distribution'].title}
            subtitle={chartConfigs['status-distribution'].subtitle}
          >
            {chartConfigs['status-distribution'].component}
          </FixedChart>
          
          <FixedChart
            title={chartConfigs['municipality-stats'].title}
            subtitle={chartConfigs['municipality-stats'].subtitle}
          >
            {chartConfigs['municipality-stats'].component}
          </FixedChart>
        </div>
      </div>
    );
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {showNotification && user && (
        <Notification
          message={`Welcome back, ${user.first_name}!`}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar custom-scrollbar ${isMobile ? 'mobile-sidebar' : ''} ${sidebarOpen ? 'mobile-sidebar-open' : ''}`}
      >
        <div className="logo-section">
          <div className="pnp-logo-container">
            <img
              src="/src/assets/rcsu-logo.png"
              alt="PNP Logo"
              className="pnp-logo"
            />
          </div>
          <h2>RCSU Firearms and Ammunition Monitoring Management System</h2>
        </div>

        <div className="menu-section">
          <ul className="menu-list">
            <li
              className={activeMenu === 'Dashboard' ? 'active' : ''}
              onClick={() => handleMenuClick('Dashboard')}
            >
              <Home className="menu-icon" />
              <span className="menu-text">Dashboard</span>
            </li>

            <li className="menu-category">ADMINISTRATION</li>

            <li
              className={activeMenu === 'AddUser' ? 'active' : ''}
              onClick={() => handleMenuClick('AddUser')}
            >
              <UserPlus className="menu-icon" />
              <span className="menu-text">Register</span>
            </li>

            {/* License Dropdown */}
            <div className="menu-dropdown-container">
              <div
                className="menu-dropdown-header"
                onClick={() =>
                  setActiveMenu((prev) =>
                    prev === 'LicenseRegistration' ||
                    prev === 'LicenseManagement'
                      ? ''
                      : 'LicenseRegistration'
                  )
                }
              >
                <div className="menu-dropdown-title">
                  <FileText className="menu-icon" />
                  <span>License</span>
                </div>
                <ChevronDown
                  className={`menu-dropdown-arrow ${
                    activeMenu === 'LicenseRegistration' ||
                    activeMenu === 'LicenseManagement'
                      ? 'open'
                      : ''
                  }`}
                  size={16}
                />
              </div>

              <div
                className={`menu-dropdown-content ${
                  activeMenu === 'LicenseRegistration' ||
                  activeMenu === 'LicenseManagement'
                    ? 'open'
                    : ''
                }`}
              >
                <div
                  className={`menu-dropdown-item ${
                    activeMenu === 'LicenseRegistration' ? 'active' : ''
                  }`}
                  onClick={() => handleMenuClick('LicenseRegistration')}
                >
                  <span>License Management</span>
                </div>
                <div
                  className={`menu-dropdown-item ${
                    activeMenu === 'LicenseManagement' ? 'active' : ''
                  }`}
                  onClick={() => handleMenuClick('LicenseManagement')}
                >
                  <span>Registered License</span>
                </div>
              </div>
            </div>

            <li
              className={activeMenu === 'Profile' ? 'active' : ''}
              onClick={() => handleMenuClick('Profile')}
            >
              <User className="menu-icon" />
              <span className="menu-text">Owner Profile</span>
            </li>
            <li
              className={activeMenu === 'Firearms' ? 'active' : ''}
              onClick={() => handleMenuClick('Firearms')}
            >
              <Crosshair className="menu-icon" />
              <span className="menu-text">Registered Firearms</span>
            </li>
            <li
              className={activeMenu === 'BlotterList' ? 'active' : ''}
              onClick={() => handleMenuClick('BlotterList')}
            >
              <BookOpen className="menu-icon" />
              <span className="menu-text">Blotter List</span>
            </li>
            <li
              className={activeMenu === 'FirearmsStatus' ? 'active' : ''}
              onClick={() => handleMenuClick('FirearmsStatus')}
            >
              <ListChecks className="menu-icon" />
              <span className="menu-text">Firearms Status</span>
            </li>
            <li
              className={activeMenu === 'Reports' ? 'active' : ''}
              onClick={() => handleMenuClick('Reports')}
            >
              <FileText className="menu-icon" />
              <span className="menu-text">Reports</span>
            </li>
            <li className="menu-category">UTILITIES</li>

            <li
              className={activeMenu === 'UserList' ? 'active' : ''}
              onClick={() => handleMenuClick('UserList')}
            >
              <BookUser className="menu-icon" />
              <span className="menu-text">User Management</span>
            </li>
            <li
              className={activeMenu === 'GunManager' ? 'active' : ''}
              onClick={() => handleMenuClick('GunManager')}
            >
              <Crosshair className="menu-icon" />
              <span className="menu-text">Gun Management</span>
            </li>
            <li
              className={activeMenu === 'Help' ? 'active' : ''}
              onClick={() => handleMenuClick('Help')}
            >
              <BookOpen className="menu-icon" />
              <span className="menu-text">Help</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            {isMobile && (
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
            )}
            <h1>{getMenuLabel(activeMenu)}</h1>
            <div className="breadcrumb">
              <span>Home</span>
              <span>/</span>
              <span>{getMenuLabel(activeMenu)}</span>
              {activeMenu === 'Dashboard' && (
                <span className="realtime-indicator">
                  <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                  <span className="status-text">
                    {isOnline ? 'Live' : 'Offline'} • Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="header-right">
            {/* Help and Global Search */}
            <div className="header-search" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <HelpButton />
              <GlobalSearch onResultClick={handleSearchResultClick} />
            </div>
            
            {/* Municipality dropdown - only for police officers */}
            {user?.role === 'police_officer' && (
              <div className="municipality-dropdown">
                <select
                  value={selectedMunicipality?.id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const municipality = municipalities.find(m => m.id === parseInt(selectedId));
                    setSelectedMunicipality(municipality || null);
                  }}
                >
                  <option value="">All Municipalities</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.first_name} ({municipality.municipality})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
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
          <div className="admin-dashboard-content">
            {renderStatusCards()}
            {renderAnalyticsSection()}
          </div>
        )}

        {/* Other menu content */}
        {activeMenu === 'AddUser' && <AddOwner />}
        {activeMenu === 'Firearms' && (
          <Firearms 
            initialFilter={navigateToFirearms ? firearmsFilter : 'all'}
          />
        )}
        {activeMenu === 'Profile' && <OwnerProfile />}
        {activeMenu === 'FirearmsStatus' && <FirearmsStatus />}
        {activeMenu === 'UserList' && <UserList />}
        {activeMenu === 'Analytics' && <Analytics />}
        {activeMenu === 'Patrols' && <Patrols />}
        {activeMenu === 'Reports' && <Reports />}
        {activeMenu === 'Messages' && <Messages />}
        {activeMenu === 'Inbox' && <InboxComponent />}
        {activeMenu === 'Dispatch' && <Dispatch />}
        {activeMenu === 'GunManager' && <GunManager />}
        {activeMenu === 'LicenseRegistration' && <FirearmLicenseRegistration />}
        {activeMenu === 'LicenseManagement' && <FirearmLicenseManagement />}
        {activeMenu === 'BlotterList' && <BlotterList />}
        {activeMenu === 'Help' && <Help />}
      </div>
    </div>
  );
};

export default AdminDashboard;