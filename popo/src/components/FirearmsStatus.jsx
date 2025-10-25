import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Shield,
  ScrollText,
  User,
  MapPin,
  CalendarDays,
  Filter,
  RotateCw,
  X,
  Check,
  Gavel,
  Crosshair,
  Hand,
  Box,
  Database,
  ShieldAlert,
} from 'lucide-react';
import { AlertCircle } from 'react-feather';
import axios from 'axios';
import '../styles/FirearmsStatus.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const FirearmsStatus = () => {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);
  const [selectedFirearm, setSelectedFirearm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

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
      }
    };
    fetchGunData();
  }, []);

  // Helper functions to get names from IDs
  const getTypeName = (typeId) => {
    if (!typeId) return 'Unknown Type';
    const type = gunTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getSubtypeName = (subtypeId) => {
    if (!subtypeId) return 'Unknown Subtype';
    const subtype = gunSubtypes.find((s) => s.id === subtypeId);
    return subtype ? subtype.name : 'Unknown Subtype';
  };

  const getModelName = (modelId) => {
    if (!modelId) return 'Unknown Model';
    const model = gunModels.find((m) => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  useEffect(() => {
    fetchFirearms();
  }, [refreshing, gunModels, currentUser]);

  const fetchFirearms = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      
      // Fetch firearms with proper authentication
      const response = await axios.get(`${API_BASE_URL}firearms/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      let firearmsList = Array.isArray(response.data) ? response.data : [];
      
      // Apply municipality filtering for administrators
      if (currentUser?.role === 'administrator' && currentUser?.municipality) {
        firearmsList = firearmsList.filter(firearm => {
          // Check if firearm belongs to owner created by current user
          // or matches the user's municipality
          const ownerMunicipality = extractMunicipalityFromAddress(firearm.owner?.residential_address);
          return ownerMunicipality && 
                 ownerMunicipality.toLowerCase() === currentUser.municipality.toLowerCase();
        });
      }

      const allFirearms = firearmsList.map((firearm) => ({
        ...firearm,
        owner: firearm.owner && typeof firearm.owner === 'object' ? firearm.owner : {},
        modelName: firearm.gun_model_details?.name || 'Unknown Model',
        typeName: getTypeName(firearm.gun_type),
        subtypeName: getSubtypeName(firearm.gun_subtype),
        caliber: firearm.ammunition_type,
        registered: true,
      }));

      // Sort by ID in descending order (Last In First Out)
      const sortedFirearms = allFirearms.sort((a, b) => (b.id || 0) - (a.id || 0));

      setFirearms(sortedFirearms);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error fetching firearms:', err);
      setError(err.response?.data?.message || 'Failed to fetch firearms');
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  const updateFirearmStatus = async (serialNumber, status) => {
    try {
      if (!status || status === 'Select status') {
        setError('Please select a valid status');
        return;
      }

      const token = localStorage.getItem('access_token');
      const backendStatus = status.toLowerCase();
      await axios.patch(`${API_BASE_URL}firearms/${serialNumber}/status/`, {
        firearm_status: backendStatus,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      setSuccessMessage(`Status updated successfully for ${serialNumber}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchFirearms();
      setShowModal(false);
    } catch (err) {
      console.error('Error updating firearm status:', err);
      setError(
        err.response?.data?.message || 'Failed to update firearm status'
      );
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    setSuccessMessage('');
  };

  const openModal = (firearm) => {
    setSelectedFirearm(firearm);
    setModalStatus(firearm.firearm_status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFirearm(null);
    setModalStatus('');
  };

  const getStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'active':
        return <CheckCircle className="status-icon active" size={14} />;
      case 'expired':
        return <XCircle className="status-icon expired" size={14} />;
      case 'pending':
        return <AlertTriangle className="status-icon pending" size={14} />;
      case 'revoked':
        return <XCircle className="status-icon revoked" size={14} />;
      case 'suspended':
        return <Archive className="status-icon suspended" size={14} />;
      case 'captured':
        return <Gavel className="status-icon captured" size={14} />;
      case 'confiscated':
        return <Gavel className="status-icon confiscated" size={14} />;
      case 'surrendered':
        return <Hand className="status-icon surrendered" size={14} />;
      case 'deposited':
        return <Box className="status-icon deposited" size={14} />;
      case 'abandoned':
        return <ShieldAlert className="status-icon abandoned" size={14} />;
      case 'forfeited':
        return <AlertCircle className="status-icon forfeited" size={14} />;
      default:
        return <Database className="status-icon" size={14} />;
    }
  };

  const filteredFirearms = firearms.filter((firearm) => {
    const matchesSearch =
      firearm.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firearm.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (firearm.owner &&
        firearm.owner_details?.full_legal_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      firearm.firearm_status?.toLowerCase() === statusFilter.toLowerCase();

    // Apply date range filter
    let matchesDateRange = true;
    if (dateFromFilter || dateToFilter) {
      if (!firearm.date_of_collection) {
        matchesDateRange = false;
      } else {
        const collectionDate = new Date(firearm.date_of_collection);
        collectionDate.setHours(0, 0, 0, 0);

        let matchesFrom = true;
        let matchesTo = true;

        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          matchesFrom = collectionDate >= fromDate;
        }

        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesTo = collectionDate <= toDate;
        }

        matchesDateRange = matchesFrom && matchesTo;
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const statusOptions = [
    'All',
    'Captured',
    'Confiscated',
    'Surrendered',
    'Deposited',
    'Abandoned',
    'Forfeited',
  ];

  if (loading) {
    return (
      <div className="firearms-status-container" style={{ maxWidth: '1600px' }}>
        <div className="loading-spinner">
          <Loader2 className="spinner-icon animate-spin" size={32} />
          <p>Loading firearms data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="firearms-status-container">
      {/* Modal */}
      {showModal && selectedFirearm && (
        <div className="fsm-overlay">
          <div className="fsm-container">
            <div className="fsm-header">
              <div className="fsm-header-content">
                <Crosshair size={20} className="fsm-icon" />
                <h3 className="fsm-title">Firearm Status Update</h3>
              </div>
              <button 
                onClick={closeModal} 
                className="fsm-close-btn"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="fsm-body">
              <div className="fsm-details-card">
                <div className="fsm-detail-item">
                  <Shield size={16} className="fsm-detail-icon" />
                  <div>
                    <p className="fsm-detail-label">Serial Number</p>
                    <p className="fsm-detail-value">{selectedFirearm.serial_number}</p>
                  </div>
                </div>
                
                <div className="fsm-detail-item">
                  <Database size={16} className="fsm-detail-icon" />
                  <div>
                    <p className="fsm-detail-label">Model</p>
                    <p className="fsm-detail-value">
                      {selectedFirearm.modelName} • {selectedFirearm.typeName} • {selectedFirearm.caliber}
                    </p>
                  </div>
                </div>
                
                <div className="fsm-detail-item">
                  <User size={16} className="fsm-detail-icon" />
                  <div>
                    <p className="fsm-detail-label">Registered Owner</p>
                    <p className="fsm-detail-value">
                      {selectedFirearm.owner_details?.full_legal_name || 'Unknown'}
                      {selectedFirearm.owner?.license_status && (
                        <span className={`fsm-license-status ${selectedFirearm.owner.license_status.toLowerCase()}`}>
                          {selectedFirearm.owner.license_status}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="fsm-detail-item">
                  <CalendarDays size={16} className="fsm-detail-icon" />
                  <div>
                    <p className="fsm-detail-label">Collection Date</p>
                    <p className="fsm-detail-value">
                      {new Date(selectedFirearm.date_of_collection).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="fsm-status-display">
                  <div className="fsm-current-status">
                    <p className="fsm-detail-label">Current Status</p>
                    <div className={`fsm-status-badge ${selectedFirearm.firearm_status.toLowerCase()}`}>
                      {getStatusIcon(selectedFirearm.firearm_status)}
                      <span>{selectedFirearm.firearm_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fsm-update-section">
                <h4 className="fsm-update-title">Update Status</h4>
                <p className="fsm-update-subtitle">Select the new status for this firearm</p>
                
                <div className="fsm-radio-group">
                  {['active', 'expired', 'pending', 'revoked', 'suspended', 'captured', 'confiscated', 'surrendered', 'deposited', 'abandoned', 'forfeited'].map((status) => (
                    <label key={status} className="fsm-radio-option">
                      <input
                        type="radio"
                        name="firearmStatus"
                        value={status}
                        checked={modalStatus === status}
                        onChange={() => setModalStatus(status)}
                        className="fsm-radio-input"
                      />
                      <span className="fsm-radio-custom"></span>
                      <span className="fsm-radio-label">
                        {getStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="fsm-footer">
              <button 
                onClick={closeModal} 
                className="fsm-secondary-btn"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateFirearmStatus(selectedFirearm.serial_number, modalStatus)}
                className="fsm-primary-btn"
                disabled={!modalStatus}
              >
                Confirm Status Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="firearms-header">
        <div className="header-title">
          <div className="header-icon-container">
            <Crosshair className="header-icon" size={28} />
          </div>
          <div>
            <h2>Firearms Status Management</h2>
            <p className="header-subtitle">
              View and update the status of firearms in the system
              {currentUser?.role === 'administrator' && currentUser?.municipality && (
                <span className="municipality-badge">
                  • {currentUser.municipality} Municipality
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RotateCw
            className={`refresh-icon ${refreshing ? 'animate-spin' : ''}`}
            size={18}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Status Messages */}
      <div className="status-messages-container">
        {error && (
          <div className="error-message">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="error-close">
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
      </div>

      <div className="firearms-controls">
        <div className="search-bar">
          <div className="search-icon-container">
            <Search className="search-icon" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by serial, model or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <div className="status-filter">
            <div className="filter-icon-container">
              <Filter className="filter-icon" size={18} />
            </div>
            <div className="relative">
              <button
                className="filter-dropdown-btn"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <span>{statusFilter}</span>
                <ChevronDown
                  className={`dropdown-icon ${showStatusDropdown ? 'rotate-180' : ''}`}
                  size={16}
                />
              </button>
              {showStatusDropdown && (
                <div className={`status-dropdown ${showStatusDropdown ? 'show' : ''}`}>
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      className={`dropdown-item ${statusFilter === option ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter(option);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="date-range-filters">
          <div className="date-input-group">
            <label className="date-label">From:</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label className="date-label">To:</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="date-input"
            />
          </div>
          {(dateFromFilter || dateToFilter) && (
            <button
              className="clear-date-btn"
              onClick={() => {
                setDateFromFilter('');
                setDateToFilter('');
              }}
              title="Clear date filters"
            >
              <X size={14} />
              Clear Dates
            </button>
          )}
        </div>
      </div>

      <div className="firearms-table-container">
        {filteredFirearms.length > 0 ? (
          <table className="firearms-table">
            <thead>
              <tr>
                <th className="th-firearm-details">
                  <div className="table-header-cell">
                    <Crosshair size={16} />
                    <span>Firearm Details</span>
                  </div>
                </th>
                <th className="th-owner">
                  <div className="table-header-cell">
                    <User size={16} />
                    <span>Owner</span>
                  </div>
                </th>
                <th className="th-status">
                  <div className="table-header-cell">
                    <ScrollText size={16} />
                    <span>Status</span>
                  </div>
                </th>
                <th className="th-date">
                  <div className="table-header-cell">
                    <CalendarDays size={16} />
                    <span>Date</span>
                  </div>
                </th>
                <th className="th-location">
                  <div className="table-header-cell">
                    <MapPin size={16} />
                    <span>Location</span>
                  </div>
                </th>
                <th className="th-actions">
                  <div className="table-header-cell">
                    <Edit size={16} />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFirearms.map((firearm) => (
                <tr key={firearm.serial_number}>
                  <td className="td-firearm-details">
                    <div className="firearm-details">
                      <div className="serial-number-row">
                        <div className="serial-number">
                          <Shield size={14} />
                          <strong>{firearm.serial_number}</strong>
                        </div>
                        <div
                          className={`registration-status ${firearm.registered ? 'registered' : 'unregistered'}`}
                        >
                          {firearm.registered ? (
                            <>
                              <CheckCircle size={12} />
                              <span>Registered</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Unregistered</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="model-type">
                        {firearm.modelName} • {firearm.typeName} •{' '}
                        {firearm.subtypeName} • {firearm.caliber}
                      </div>
                    </div>
                  </td>
                  <td className="td-owner">
                    <User size={14} className="text-gray-500" />
                    <span>{firearm.owner_details?.full_legal_name || 'Unknown'}</span>
                  </td>
                  <td className="td-status">
                    <div className={`status-badge ${firearm.firearm_status.toLowerCase()}`}>
                      {getStatusIcon(firearm.firearm_status)}
                      <span>{firearm.firearm_status}</span>
                    </div>
                  </td>
                  <td className="td-date">
                    <CalendarDays size={14} className="text-gray-500" />
                    <span>
                      {new Date(firearm.date_of_collection).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="td-location">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{firearm.registration_location || 'Not specified'}</span>
                  </td>
                  <td className="td-actions">
                    <button
                      className="view-btn"
                      onClick={() => openModal(firearm)}
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <h3>No firearms found</h3>
            <p>
              {currentUser?.role === 'administrator' && currentUser?.municipality 
                ? `No firearms found for ${currentUser.municipality} municipality matching your criteria`
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirearmsStatus;