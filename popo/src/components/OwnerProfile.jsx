import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  ShieldCheck,
  Search,
  FileText,
  Fingerprint,
  Contact,
  MapPin,
  Calendar,
  BadgeInfo,
  Crosshair,
  Gavel,
  ShieldHalf,
  Archive,
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  Home,
  Clock,
  CalendarDays,
  Loader2,
  AlertCircle,
  ScrollText,
  HardDriveDownload,
  FileSearch,
  UserCog,
  IdCard,
  ShieldQuestion,
  ShieldPlus,
  ShieldMinus,
  ShieldOff,
  History,
  FileDigit,
  FileKey2,
  FileClock,
  BellPlus,
  ShieldAlert,
  Image,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  X,
  Eye,
  ExternalLink,
  ListChecks,
  Lock,
  Skull,
  Plus,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventBus from '../utils/eventBus';
import '../styles/OwnerProfile.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const OwnerProfile = () => {
  const { user } = useAuth();
  const [userMunicipality, setUserMunicipality] = useState('');
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);
  const [gunDataLoading, setGunDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ownersData, setOwnersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOwner, setExpandedOwner] = useState(null);
  const [firearmLicenses, setFirearmLicenses] = useState([]);
  const [licensesLoading, setLicensesLoading] = useState(false);
  const [selectedLicensePhoto, setSelectedLicensePhoto] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    licenseStatus: 'all',
    firearmStatus: 'all'
  });
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // New state for firearm modal
  const [selectedFirearm, setSelectedFirearm] = useState(null);
  const [showFirearmModal, setShowFirearmModal] = useState(false);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);

  // Calculate license statistics
  const calculateLicenseStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let activeCount = 0;
    let expiredCount = 0;
    let totalCount = firearmLicenses.length;
    
    firearmLicenses.forEach(license => {
      if (license.expiry_date) {
        const expiryDate = new Date(license.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        
        if (expiryDate >= today) {
          activeCount++;
        } else {
          expiredCount++;
        }
      }
    });
    
    return { activeCount, expiredCount, totalCount };
  };
  
  const { activeCount, expiredCount, totalCount } = calculateLicenseStats();

  const getTypeName = (typeId) => {
    const type = gunTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getSubtypeName = (subtypeId) => {
    const subtype = gunSubtypes.find(s => s.id === subtypeId);
    return subtype ? subtype.name : 'Unknown Subtype';
  };

  const getModelName = (modelId) => {
    const model = gunModels.find(m => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  const sendNotification = async (ownerId, notificationType) => {
    try {
      const token = localStorage.getItem('access_token');
      const owner = ownersData.find((o) => o.id === ownerId);
      if (!owner) return;

      const response = await axios.get(`${API_BASE_URL}users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = response.data;

      const clientUser = users.find(
        (user) =>
          `${user.first_name} ${user.last_name}`.trim().toLowerCase() ===
          owner.full_legal_name.trim().toLowerCase()
      );

      if (!clientUser) {
        alert('No matching client user found for this owner');
        return;
      }

      let message = '';
      if (notificationType === 'license_expiry') {
        message = `Your firearm license is expiring soon. Please renew your license to avoid penalties.`;
      } else {
        message = `Your firearm(s) are ready for release. Please visit the station to claim them.`;
      }

      await axios.post(
        `${API_BASE_URL}notifications/send/`,
        {
          user: clientUser.id,
          notification_type: notificationType,
          message: message,
          related_owner: owner.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

   useEffect(() => {
    if (user) {
      // Get municipality from user data
      setUserMunicipality(user.municipality || '');
    }
  }, [user]);
  
    useEffect(() => {
    if (user) {
      // If user is a municipality admin, get their municipality
      if (user.role === 'administrator') {
        setUserMunicipality(user.municipality || '');
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchGunData = async () => {
      try {
        const [typesRes, subtypesRes, modelsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}gun-types/`),
          axios.get(`${API_BASE_URL}gun-subtypes/`),
          axios.get(`${API_BASE_URL}gun-models/`),
        ]);
        setGunTypes(typesRes.data);
        setGunSubtypes(subtypesRes.data);
        setGunModels(modelsRes.data);
      } catch (err) {
        console.error('Error fetching gun data:', err);
      } finally {
        setGunDataLoading(false);
      }
    };
    fetchGunData();
  }, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const currentUser = JSON.parse(localStorage.getItem('user'));

      console.log('🔍 Current User:', currentUser);
      console.log('🏢 User Municipality:', currentUser?.municipality);
      console.log('👤 User Role:', currentUser?.role);

      const [ownersResponse, licensesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}owners/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_BASE_URL}firearm-licenses/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      console.log('📦 Raw owners data received:', ownersResponse.data);

      // Rely on backend scoping; use owners as-is
      let filteredOwners = ownersResponse.data;

      const enhancedOwners = filteredOwners.map((owner) => ({
        ...owner,
        formattedGender:
          owner.gender === 'male'
            ? 'Male'
            : owner.gender === 'female'
              ? 'Female'
              : owner.gender === 'other'
                ? 'Other'
                : 'Prefer not to say',
        firearms:
          owner.firearms?.map((firearm) => ({
            ...firearm,
            typeName: getTypeName(firearm.gun_type),
            subtypeName: getSubtypeName(firearm.gun_subtype),
            modelName: firearm.gun_model_details?.name || 'Unknown Model',
          })) || [],
      }));

      // Sort by ID in descending order (Last In First Out)
      const sortedOwners = enhancedOwners.sort((a, b) => b.id - a.id);

      setOwnersData(sortedOwners);
      setFirearmLicenses(
        licensesResponse.data.results || licensesResponse.data
      );

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      if (err.response && err.response.status === 401) {
        console.log('Authentication failed, please login again');
      }
    } finally {
      setLoading(false);
      setLicensesLoading(false);
    }
  };

  fetchData();
}, [gunTypes, gunSubtypes, gunModels]);

  useEffect(() => {
    const fetchFirearmLicenses = async () => {
      try {
        setLicensesLoading(true);
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_BASE_URL}firearm-licenses/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const licensesData = response.data.results || response.data;
        console.log('🔍 Firearm licenses fetched:', licensesData);
        console.log('🔍 Sample license owner data:', licensesData[0]?.owner);
        setFirearmLicenses(licensesData);
      } catch (err) {
        console.error('Error fetching firearm licenses:', err);
        if (err.response) {
          if (err.response.status === 401) {
            console.error('Authentication failed - please login again');
          } else if (err.response.status === 403) {
            console.error('You do not have permission to view licenses');
          }
        }
      } finally {
        setLicensesLoading(false);
      }
    };

    fetchFirearmLicenses();
  }, []);

  // Add effect to refresh licenses when component becomes visible (e.g., returning from registration)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Component is now visible, refresh licenses
        const fetchFirearmLicenses = async () => {
          try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}firearm-licenses/`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            setFirearmLicenses(response.data.results || response.data);
          } catch (err) {
            console.error('Error refreshing firearm licenses:', err);
          }
        };

        fetchFirearmLicenses();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on focus (when user returns to tab)
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Listen for user archive/restore events to refresh data
  useEffect(() => {
    const handleUserArchived = () => {
      console.log('User archived - refreshing owner data...');
      // Refresh both owners and licenses data
      const refreshData = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const [ownersResponse, licensesResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}owners/`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE_URL}firearm-licenses/`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const enhancedOwners = ownersResponse.data.map((owner) => ({
            ...owner,
            formattedGender:
              owner.gender === 'male'
                ? 'Male'
                : owner.gender === 'female'
                  ? 'Female'
                  : owner.gender === 'other'
                    ? 'Other'
                    : 'Prefer not to say',
            firearms:
              owner.firearms?.map((firearm) => ({
                ...firearm,
                typeName: getTypeName(firearm.gun_type),
                subtypeName: getSubtypeName(firearm.gun_subtype),
                modelName: firearm.gun_model_details?.name || 'Unknown Model',
              })) || [],
          }));

          // Sort by ID in descending order (Last In First Out)
          const sortedOwners = enhancedOwners.sort((a, b) => b.id - a.id);

          setOwnersData(sortedOwners);
          setFirearmLicenses(
            licensesResponse.data.results || licensesResponse.data
          );
        } catch (err) {
          console.error('Error refreshing data after user archive:', err);
        }
      };
      refreshData();
    };

    const handleUserRestored = () => {
      console.log('User restored - refreshing owner data...');
      // Same refresh logic as archive
      handleUserArchived();
    };

    // Subscribe to events
    eventBus.on('userArchived', handleUserArchived);
    eventBus.on('userRestored', handleUserRestored);

    // Cleanup listeners on unmount
    return () => {
      eventBus.off('userArchived', handleUserArchived);
      eventBus.off('userRestored', handleUserRestored);
    };
  }, [gunTypes, gunSubtypes, gunModels]);

  const getOwnerLicenses = (ownerName) => {
    return firearmLicenses.filter(
      (license) =>
        license.owner?.full_legal_name?.toLowerCase() ===
        ownerName.toLowerCase()
    );
  };

  // Function to manually refresh firearm licenses
  const refreshFirearmLicenses = async () => {
    try {
      setLicensesLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}firearm-licenses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const licensesData = response.data.results || response.data;
      console.log('🔄 Refreshed firearm licenses:', licensesData);
      setFirearmLicenses(licensesData);
    } catch (err) {
      console.error('Error refreshing firearm licenses:', err);
    } finally {
      setLicensesLoading(false);
    }
  };

  const toggleOwnerExpand = (ownerId) => {
    setExpandedOwner(expandedOwner === ownerId ? null : ownerId);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedOwners = (owners) => {
    if (!sortConfig.key) return owners;
    
    return [...owners].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Enhanced filtering function
  const getFilteredOwners = (owners) => {
    return owners.filter(owner => {
      // Apply search filter
      const matchesSearch = 
        owner.full_legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owner.id && owner.id.toString().includes(searchTerm.toLowerCase())) ||
        (owner.contact_number && owner.contact_number.includes(searchTerm)) ||
        (owner.firearms && owner.firearms.some((firearm) =>
          firearm.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      // Apply municipality filter for admins
      let matchesMunicipality = true;
      if (user?.role === 'administrator' && userMunicipality) {
        // Check multiple possible locations for municipality data
        const ownerMunicipality = owner.municipality || 
                                 extractMunicipalityFromAddress(owner.residential_address);
        
        matchesMunicipality = ownerMunicipality && 
                             ownerMunicipality.toLowerCase() === userMunicipality.toLowerCase();
      }
      
      // Apply other filters
      const matchesLicenseFilter = activeFilters.licenseStatus === 'all' || 
                                  owner.license_status === activeFilters.licenseStatus;
      
      const matchesFirearmFilter = activeFilters.firearmStatus === 'all' || 
                                  (owner.firearms && owner.firearms.some(
                                    firearm => firearm.firearm_status === activeFilters.firearmStatus
                                  ));
      
      // Apply date range filter
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        if (!owner.registration_date) {
          matchesDateRange = false;
        } else {
          const registrationDate = new Date(owner.registration_date);
          registrationDate.setHours(0, 0, 0, 0);

          let matchesFrom = true;
          let matchesTo = true;

          if (dateFromFilter) {
            const fromDate = new Date(dateFromFilter);
            fromDate.setHours(0, 0, 0, 0);
            matchesFrom = registrationDate >= fromDate;
          }

          if (dateToFilter) {
            const toDate = new Date(dateToFilter);
            toDate.setHours(23, 59, 59, 999);
            matchesTo = registrationDate <= toDate;
          }

          matchesDateRange = matchesFrom && matchesTo;
        }
      }
      
      return matchesSearch && matchesMunicipality && matchesLicenseFilter && matchesFirearmFilter && matchesDateRange;
    });
  };

  // Firearm modal functions
  const handleViewFirearmDetails = (firearm) => {
    setSelectedFirearm(firearm);
    setShowFirearmModal(true);
  };

  const closeFirearmModal = () => {
    setShowFirearmModal(false);
    setSelectedFirearm(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'captured':
        return 'status-captured';
      case 'confiscated':
        return 'status-confiscated';
      case 'surrendered':
        return 'status-surrendered';
      case 'deposited':
        return 'status-deposited';
      case 'abandoned':
        return 'status-abandoned';
      case 'forfeited':
        return 'status-forfeited';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'captured':
        return 'Captured';
      case 'confiscated':
        return 'Confiscated';
      case 'surrendered':
        return 'Surrendered';
      case 'deposited':
        return 'Deposited';
      case 'abandoned':
        return 'Abandoned';
      case 'forfeited':
        return 'Forfeited';
      default:
        return status;
    }
  };

const filteredOwners = ownersData.filter((owner) => {
  // Base search filter
  const matchesSearch = 
    owner.full_legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (owner.id && owner.id.toString().includes(searchTerm.toLowerCase())) ||
    (owner.contact_number && owner.contact_number.includes(searchTerm)) ||
    (owner.firearms && owner.firearms.some((firearm) =>
      firearm.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    ));

  // Backend already scopes administrators; do not filter further by creator/municipality here
  let matchesMunicipality = true;

  return matchesSearch && matchesMunicipality;
});

// Helper function to extract municipality from address string
const extractMunicipalityFromAddress = (address) => {
  if (!address || typeof address !== 'string') return null;
  
  // List of municipalities to check against
  const municipalities = [
    'Agoo', 'Aringay', 'Bacnotan', 'Bagulin', 'Balaoan', 'Bangar', 'Bauang', 
    'Burgos', 'Caba', 'Luna', 'Naguilian', 'Pugo', 'Rosario', 'San Gabriel', 
    'San Juan', 'Santo Tomas', 'Santol', 'Sudipen', 'Tubao'
  ];
  
  const cleanAddress = address.toLowerCase().trim();
  const sortedMunicipalities = [...municipalities].sort((a, b) => b.length - a.length);

  for (const municipality of sortedMunicipalities) {
    const lowerMun = municipality.toLowerCase();
    
    // Check for exact matches in different formats
    const matchPatterns = [
      `\\b${lowerMun}\\b`, // Word boundary match
      `^${lowerMun},`,     // Start with municipality
      `, ${lowerMun}$`,    // End with municipality
      `, ${lowerMun},`,    // Municipality in middle
      ` ${lowerMun}$`,     // Space then municipality at end
      `^${lowerMun}$`      // Exact match
    ];

     for (const pattern of matchPatterns) {
      const regex = new RegExp(pattern);
      if (regex.test(cleanAddress)) {
        return municipality; // Return with proper casing
      }
    }
  }
  
  // Check if address contains any municipality name
    const foundMunicipality = municipalities.find(municipality => 
      address.toLowerCase().includes(municipality.toLowerCase())
    );
    
  return foundMunicipality || null;
};

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}owners/report/`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'owners_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Report generation failed. Please try again.');
    }
  };

  const handleDeleteOwner = async (ownerId, ownerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${ownerName}" and all their firearms? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('access_token');
      
      // Find the owner by ID first to get the full_legal_name
      const owner = ownersData.find(o => o.id === ownerId);
      if (!owner) {
        alert('Owner not found');
        return;
      }

      // Delete the owner using the full_legal_name endpoint
      await axios.delete(`${API_BASE_URL}owners/${encodeURIComponent(owner.full_legal_name)}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the data
      window.location.reload();
      alert(`Owner "${ownerName}" and their firearms have been deleted successfully.`);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete owner. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      captured: {
        icon: <Gavel size={16} />,
        class: 'captured',
        color: '#4c5154',
      },
      confiscated: {
        icon: <Gavel size={16} />,
        class: 'confiscated',
        color: '#dc3545',
      },
      surrendered: {
        icon: <Shield size={16} />,
        class: 'surrendered',
        color: '#28a745',
      },
      deposited: {
        icon: <Archive size={16} />,
        class: 'deposited',
        color: '#17a2b8',
      },
      abandoned: {
        icon: <AlertTriangle size={16} />,
        class: 'abandoned',
        color: '#ffc107',
      },
      forfeited: {
        icon: <AlertCircle size={16} />,
        class: 'forfeited',
        color: '#6c757d',
      },
    };

    const config = statusConfig[status] || {
      icon: null,
      class: '',
      color: '#000',
    };

    return config;
  };

  const getLicenseStatusIcon = (status) => {
    if (!status) {
      return <ShieldQuestion size={16} className="icon-unknown" />;
    }

    const statusLower = String(status).toLowerCase();

    const iconConfig = {
      active: <ShieldPlus size={16} className="icon-active" />,
      suspended: <ShieldMinus size={16} className="icon-suspended" />,
      revoked: <ShieldOff size={16} className="icon-revoked" />,
      pending: <ShieldQuestion size={16} className="icon-pending" />,
      expired: <FileClock size={16} className="icon-expired" />,
      unknown: <ShieldQuestion size={16} className="icon-unknown" />,
    };

    return iconConfig[statusLower] || iconConfig.unknown;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading owner data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="firearms-container">
      <div className="police-evidence-banner">
        <ShieldCheck size={20} />
        <span>FIREARM OWNER PROFILE MANAGEMENT SYSTEM</span>
        <ShieldCheck size={20} />
      </div>

      {/* Header */}
      <div className="op-header">
        <div className="op-header-title">
          <UserCog size={28} className="op-header-icon" />
          <h2>Registered Firearm Owners</h2>
          <span className="op-owners-badge">
            <FileDigit size={16} />
            <span>{ownersData.length} owners registered</span>
          </span>
        </div>
        <div className="op-header-actions">
          <button className="op-export-btn" onClick={handleGenerateReport}>
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="op-controls-section">
        <div className="op-search-container">
          <Search className="op-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search owners, IDs, contacts or serial numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="op-search-input"
          />
          {searchTerm && (
            <button 
              className="op-clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="op-filters-row">
          <div className="op-filter-group">
            <Filter size={16} className="op-filter-icon" />
            <select 
              value={activeFilters.licenseStatus} 
              onChange={(e) => handleFilterChange('licenseStatus', e.target.value)}
              className="op-filter-select"
            >
              <option value="all">All License Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="revoked">Revoked</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="op-filter-group">
            <Filter size={16} className="op-filter-icon" />
            <select 
              value={activeFilters.firearmStatus} 
              onChange={(e) => handleFilterChange('firearmStatus', e.target.value)}
              className="op-filter-select"
            >
              <option value="all">All Firearm Statuses</option>
              <option value="active">Active</option>
              <option value="confiscated">Confiscated</option>
              <option value="surrendered">Surrendered</option>
              <option value="deposited">Deposited</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>

          <div className="op-date-range-group">
            <div className="op-date-input-wrapper">
              <label className="op-date-label">From:</label>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="op-date-input"
              />
            </div>
            <div className="op-date-input-wrapper">
              <label className="op-date-label">To:</label>
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="op-date-input"
              />
            </div>
            {(dateFromFilter || dateToFilter) && (
              <button
                className="op-clear-dates-btn"
                onClick={() => {
                  setDateFromFilter('');
                  setDateToFilter('');
                }}
                title="Clear date filters"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards - Updated with license counts */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon active">
            <ShieldCheck size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-number">
              {activeCount}
            </span>
            <span className="summary-label">Active Licenses</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon expired">
            <FileClock size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-number">
              {expiredCount}
            </span>
            <span className="summary-label">Expired Licenses</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon firearm">
            <Crosshair size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-number">
              {ownersData.reduce((total, owner) => total + (owner.firearms?.length || 0), 0)}
            </span>
            <span className="summary-label">Total Firearms</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon total">
            <FileDigit size={20} />
          </div>
          <div className="summary-content">
            <span className="summary-number">
              {totalCount}
            </span>
            <span className="summary-label">Total Licenses</span>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="sort-controls">
        <span>Sort by:</span>
        <button 
          className={sortConfig.key === 'full_legal_name' ? 'active' : ''}
          onClick={() => handleSort('full_legal_name')}
        >
          Name {sortConfig.key === 'full_legal_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={sortConfig.key === 'registration_date' ? 'active' : ''}
          onClick={() => handleSort('registration_date')}
        >
          Registration Date {sortConfig.key === 'registration_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={sortConfig.key === 'license_status' ? 'active' : ''}
          onClick={() => handleSort('license_status')}
        >
          License Status {sortConfig.key === 'license_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <div className="owner-profile-content">
        {filteredOwners.length > 0 ? (
          getSortedOwners(getFilteredOwners(filteredOwners)).map((owner) => (
            <div
              key={owner.id}
              className={`owner-info-card ${expandedOwner === owner.id ? 'expanded' : ''}`}
            >
<div className="owner-info-header clickable" onClick={() => toggleOwnerExpand(owner.id)}>
  <div className="owner-main-info">
    <div className="owner-avatar">
      {owner.full_legal_name.split(' ').map(n => n[0]).join('').toUpperCase()}
    </div>
    <div className="owner-name-id">
      <h3>{owner.full_legal_name}</h3>
      <div className="owner-meta">
        <span className="owner-id">
          <Fingerprint size={14} />
          <span>ID: {owner.id}</span>
        </span>
        {/* Add municipality badge */}
        {owner.municipality && (
          <span className="owner-municipality">
            <MapPin size={14} />
            <span>{owner.municipality}</span>
          </span>
        )}
        <span className="owner-reg-date">
          <History size={14} />
          <span>Registered: {formatDate(owner.registration_date)}</span>
        </span>
        <span className="owner-contact">
          <Phone size={14} />
          <span>{owner.contact_number || 'No contact'}</span>
        </span>
      </div>
    </div>
  </div>
                
                <div className="owner-status-indicator">
                  {getLicenseStatusIcon(owner.license_status)}
                  <span className={`license-status ${owner.license_status ? owner.license_status.toLowerCase() : 'unknown'}`}>
                    {owner.license_status || 'Unknown'}
                  </span>
                </div>
                
                <div className="firearm-count">
                  <Crosshair size={16} />
                  <span>{owner.firearms?.length || 0} firearms</span>
                </div>
                
                <div className="owner-actions">
                  <button
                    className="delete-owner-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOwner(owner.id, owner.full_legal_name);
                    }}
                    title={`Delete ${owner.full_legal_name} and all firearms`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className={`expand-icon ${expandedOwner === owner.id ? 'expanded' : ''}`}>
                  {expandedOwner === owner.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedOwner === owner.id && (
                <div className="owner-details-content">
                  <div className="owner-details-grid">
                    <div className="detail-item">
                      <Contact size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Primary Contact</span>
                        <span className="detail-value">
                          {owner.contact_number || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <MapPin size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">
                          Residential Address
                        </span>
                        <span className="detail-value">
                          {owner.residential_address || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <User size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Age</span>
                        <span className="detail-value">
                          {owner.age || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="op-firearms-section">
                    <div className="section-header">
                      <Crosshair size={20} />
                      <h3>
                        Registered Firearms ({owner.firearms?.length || 0})
                      </h3>
                    </div>

                    {owner.firearms && owner.firearms.length > 0 ? (
                      <div className="op-firearms-grid">
                        {owner.firearms.map((firearm, index) => (
                          <div key={index} className="op-firearm-box">
                            <div className="op-firearm-header">
                              <div className="op-firearm-type-model">
                                <div className="op-firearm-type">
                                  {firearm.typeName}
                                </div>
                                <div className="op-firearm-model">
                                  {firearm.modelName}
                                </div>
                              </div>
                              <div
                                className={`op-status-badge ${getStatusBadge(firearm.firearm_status).class}`}
                              >
                                {getStatusBadge(firearm.firearm_status).icon}
                                <span
                                  style={{
                                    color: getStatusBadge(
                                      firearm.firearm_status
                                    ).color,
                                  }}
                                >
                                  {firearm.firearm_status}
                                </span>
                              </div>
                            </div>
                            <div className="op-firearm-details">
                              <div className="op-firearm-detail-row">
                                <span>
                                  <FileSearch size={12} /> Serial:
                                </span>
                                <span>{firearm.serial_number}</span>
                              </div>
                              <div className="op-firearm-detail-row">
                                <span>
                                  <Crosshair size={12} /> Caliber:
                                </span>
                                <span>{firearm.ammunition_type}</span>
                              </div>
                              <div className="op-firearm-detail-row">
                                <span>
                                  <MapPin size={12} /> Location:
                                </span>
                                <span>{firearm.registration_location}</span>
                              </div>
                            </div>
                            {/* Add View Details button */}
                            <button
                              className="op-firearm-view-details-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewFirearmDetails(firearm);
                              }}
                            >
                              <Eye size={12} />
                              View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="op-no-firearms">
                        <p>No firearms registered for this owner</p>
                      </div>
                    )}
                  </div>

                  {/* Firearms License Section */}
                  <div className="op-licenses-section">
                    <div className="section-header">
                      <ShieldCheck size={20} />
                      <h3>Firearms Licenses</h3>
                      <button 
                        className="refresh-licenses-btn"
                        onClick={refreshFirearmLicenses}
                        disabled={licensesLoading}
                        title="Refresh licenses data"
                      >
                        {licensesLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Clock size={16} />
                        )}
                      </button>
                    </div>

                    {licensesLoading ? (
                      <div className="op-loading-licenses">
                        <Loader2 className="animate-spin" size={18} />
                        <span>Loading licenses...</span>
                      </div>
                    ) : (
                      <div className="op-licenses-grid">
                        {firearmLicenses
                          .filter((license) => {
                            const licenseOwnerName = license.owner?.full_legal_name?.toLowerCase();
                            const ownerName = owner.full_legal_name.toLowerCase();
                            const matches = licenseOwnerName === ownerName;
                            console.log(`🔍 License ${license.license_number}: "${licenseOwnerName}" === "${ownerName}" = ${matches}`);
                            return matches;
                          })
                          .map((license) => (
                            <div key={license.id} className="op-license-card">
                              <div className="op-license-header">
                                <div className="op-license-number">
                                  <FileKey2 size={14} />
                                  <span>
                                    {license.license_number}
                                  </span>
                                </div>
                                <div
                                  className={`op-license-status ${license.status.toLowerCase()}`}
                                >
                                  {getLicenseStatusIcon(license.status)}
                                  <span>{license.status}</span>
                                </div>
                              </div>

                              <div className="op-license-details">
                                <div className="op-detail-row">
                                  <span>
                                    <FileText size={12} /> Control #:
                                  </span>
                                  <span>{license.control_number}</span>
                                </div>
                                <div className="op-detail-row">
                                  <span>
                                    <Crosshair size={12} /> Firearm:
                                  </span>
                                  <span>
                                    {license.kind} {license.make}{' '}
                                    {license.model} {license.caliber}
                                  </span>
                                </div>
                                <div className="op-detail-row">
                                  <span>
                                    <Fingerprint size={12} /> Serial:
                                  </span>
                                  <span>{license.serial_number}</span>
                                </div>
                                <div className="op-detail-row">
                                  <span>
                                    <CalendarDays size={12} /> Issued:
                                  </span>
                                  <span>{formatDate(license.date_issued)}</span>
                                </div>
                                <div className="op-detail-row">
                                  <span>
                                    <Clock size={12} /> Expires:
                                  </span>
                                  <span>{formatDate(license.expiry_date)}</span>
                                </div>
                              </div>

                              {license.photo_url && (
                                <div className="op-license-photo-preview">
                                  <button
                                    className="op-view-photo-btn"
                                    onClick={() => {
                                      setSelectedLicensePhoto(
                                        license.photo_url
                                      );
                                      setIsPhotoModalOpen(true);
                                    }}
                                  >
                                    <Image size={14} />
                                    <span>View Photo</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    {firearmLicenses.filter(
                      (license) =>
                        license.owner?.full_legal_name?.toLowerCase() ===
                        owner.full_legal_name.toLowerCase()
                    ).length === 0 &&
                      !licensesLoading && (
                        <div className="op-no-licenses">
                          <ShieldQuestion size={18} />
                          <p>No firearms licenses found for this owner</p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <FileSearch size={32} />
            <p>No owners found matching your search criteria</p>
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm('');
                setActiveFilters({ licenseStatus: 'all', firearmStatus: 'all' });
                setDateFromFilter('');
                setDateToFilter('');
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* License Photo Modal */}
      {isPhotoModalOpen && (
        <div
          className="photo-modal-overlay"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="photo-modal-header">
              <h3>License Photo</h3>
              <button
                className="close-modal-btn"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="photo-modal-content">
              {selectedLicensePhoto ? (
                <img
                  src={selectedLicensePhoto}
                  alt="License Photo"
                  className="license-photo-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              ) : (
                <div className="no-photo-message">
                  <Image size={48} />
                  <p>No photo available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Firearm Details Modal */}
      {showFirearmModal && selectedFirearm && (
        <div className="firearm-modal-overlay" onClick={closeFirearmModal}>
          <div className="firearm-modal-content landscape-modal animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="firearm-modal-header">
              <div className="modal-title-group">
                <h3>{selectedFirearm.modelName}</h3>
                <p className="modal-subtitle">{selectedFirearm.typeName} • {selectedFirearm.subtypeName}</p>
              </div>
              <button className="firearm-modal-close" onClick={closeFirearmModal}>
                &times;
              </button>
            </div>
            
            <div className="firearm-modal-body landscape-body">
              {/* Image Column - Show if image exists */}
              {selectedFirearm.image_url && (
                <div className="modal-column image-column">
                  <div className="modal-section">
                    <h4 className="section-title">Firearm Image</h4>
                    <div 
                      className="firearm-image-container clickable-image"
                      onClick={() => setIsFullscreenImageOpen(true)}
                      title="Click to view fullscreen"
                    >
                      <img 
                        src={selectedFirearm.image_url} 
                        alt={`${selectedFirearm.modelName}`}
                        className="firearm-detail-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="no-image-placeholder" style={{ display: 'none' }}>
                        <Image size={48} />
                        <p>Image unavailable</p>
                      </div>
                      <div className="fullscreen-hint">
                        <Eye size={20} />
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-column">
                <div className="modal-section">
                  <h4 className="section-title">Identification</h4>
                  <div className="firearm-modal-detail">
                    <strong>Serial Number:</strong>
                    <span className="firearm-modal-detail-value highlight">
                      {selectedFirearm.serial_number}
                    </span>
                  </div>
                  <div className="firearm-modal-detail">
                    <strong>Model:</strong>
                    <span className="firearm-modal-detail-value">
                      {selectedFirearm.modelName}
                    </span>
                  </div>
                  <div className="firearm-modal-detail">
                    <strong>Caliber:</strong>
                    <span className="firearm-modal-detail-value">
                      {selectedFirearm.ammunition_type}
                    </span>
                  </div>
                  <div className="firearm-modal-detail">
                    <strong>Subtype:</strong>
                    <span className="firearm-modal-detail-value">
                      {selectedFirearm.subtypeName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-column">
                <div className="modal-section">
                  <h4 className="section-title">Status</h4>
                  <div className="firearm-modal-detail">
                    <strong>Current Status:</strong>
                    <span className={`firearm-modal-detail-value status-badge ${getStatusColor(selectedFirearm.firearm_status)}`}>
                      {getStatusText(selectedFirearm.firearm_status)}
                    </span>
                  </div>
                  <div className="firearm-modal-detail">
                    <strong>{getStatusText(selectedFirearm.firearm_status)} Date:</strong>
                    <span className="firearm-modal-detail-value date-value">
                      {formatDate(selectedFirearm.date_of_collection)}
                    </span>
                  </div>
                  <div className="firearm-modal-detail">
                    <strong>Registration Location:</strong>
                    <span className="firearm-modal-detail-value">
                      {selectedFirearm.registration_location || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="modal-section">
                  <h4 className="section-title">Notes</h4>
                  <div className="status-notes">
                    {selectedFirearm.status_comment || 'No additional notes provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {isFullscreenImageOpen && selectedFirearm && selectedFirearm.image_url && (
        <div className="fullscreen-modal-overlay" onClick={() => setIsFullscreenImageOpen(false)}>
          <div className="fullscreen-modal" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsFullscreenImageOpen(false)}
              className="fullscreen-close-btn"
              title="Close fullscreen"
            >
              <X size={24} />
            </button>
            <div className="fullscreen-image-wrapper">
              <img
                src={selectedFirearm.image_url}
                alt={`${selectedFirearm.modelName} - Fullscreen`}
                className="fullscreen-firearm-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="no-image-placeholder-fullscreen" style={{ display: 'none' }}>
                <Image size={96} />
                <p>Image unavailable</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerProfile;