import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Edit,
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
import axios from 'axios';
import '../styles/FirearmsStatus.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const FirearmsStatus = () => {
  const selectRef = useRef(null);
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchFirearms();
  }, [refreshing]);

  const fetchFirearms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch owners data which contains firearms
      const response = await axios.get(`${API_BASE_URL}owners/`);
      const ownersData = response.data;

      // Extract and flatten all firearms from owners
      const allFirearms = ownersData.flatMap((owner) =>
        owner.firearms.map((firearm) => ({
          ...firearm,
          owner: {
            // Include owner details with each firearm
            id: owner.id,
            full_legal_name: owner.full_legal_name,
            contact_number: owner.contact_number,
            license_status: owner.license_status,
            residential_address: owner.residential_address,
          },
          // Add any additional fields needed for display
          model: firearm.gun_model,
          type: firearm.gun_type,
          caliber: firearm.ammunition_type,
          registered: true, // Assuming all are registered since they're in the system
        }))
      );

      setFirearms(allFirearms);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error fetching firearms:', err);
      setError(err.response?.data?.message || 'Failed to fetch firearms');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateFirearmStatus = async (serialNumber, status) => {
    try {
      // Check if a valid status was selected
      if (!status || status === 'Select status') {
        setError('Please select a valid status');
        return;
      }

      // Convert status to lowercase to match backend exactly
      const backendStatus = status.toLowerCase();
      await axios.patch(`${API_BASE_URL}firearms/${serialNumber}/status/`, {
        firearm_status: backendStatus,
      });
      setSuccessMessage(`Status updated successfully for ${serialNumber}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchFirearms();
    } catch (err) {
      console.error('Error updating firearm status:', err);
      setError(
        err.response?.data?.message || 'Failed to update firearm status'
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    setSuccessMessage('');
  };

  const startEditing = (firearm) => {
    setEditingId(firearm.serial_number);
    setNewStatus("Select status"); // Initialize with default option
    setTimeout(() => {
      if (selectRef.current) {
        selectRef.current.focus();
      }
    }, 10);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewStatus('');
  };

  const saveStatusChange = (serialNumber) => {
    if (newStatus) {
      updateFirearmStatus(serialNumber, newStatus);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confiscated':
        return <Gavel className="status-icon confiscated" size={18} />;
      case 'Surrendered':
        return <Hand className="status-icon surrendered" size={18} />;
      case 'Deposit':
        return <Box className="status-icon deposit" size={18} />;
      case 'Abandoned': // Changed from 'Abandon'
        return <ShieldAlert className="status-icon abandoned" size={18} />;
      default:
        return <Database className="status-icon" size={18} />;
    }
  };

  const filteredFirearms = firearms.filter((firearm) => {
    const matchesSearch =
      firearm.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firearm.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (firearm.owner &&
        firearm.owner.full_legal_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Deposit' && firearm.firearm_status === 'deposit') ||
      (statusFilter === 'Confiscated' &&
        firearm.firearm_status === 'confiscated') ||
      (statusFilter === 'Surrendered' &&
        firearm.firearm_status === 'surrendered') ||
      (statusFilter === 'Abandoned' && firearm.firearm_status === 'abandoned');

    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Confiscated', 'Surrendered', 'Deposit', 'Abandoned'];

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
      <div className="firearms-header">
        <div className="header-title">
          <div className="header-icon-container">
            <Crosshair className="header-icon" size={28} />
          </div>
          <div>
            <h2>Firearms Status Management</h2>
            <p className="header-subtitle">
              View and update the status of firearms in the system
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
                <div className="status-dropdown">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      className={`dropdown-item ${statusFilter === option ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter(option);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {option === 'All' ? (
                          <Database size={16} />
                        ) : (
                          getStatusIcon(option)
                        )}
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="firearms-table-container">
        {filteredFirearms.length > 0 ? (
          <table className="firearms-table">
            <thead>
              <tr>
                <th>
                  <div className="table-header-cell">
                    <Crosshair size={16} />
                    <span>Firearm Details</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <User size={16} />
                    <span>Owner</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <ScrollText size={16} />
                    <span>Status</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <CalendarDays size={16} />
                    <span>Date</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <MapPin size={16} />
                    <span>Location</span>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFirearms.map((firearm) => (
                <tr
                  key={firearm.serial_number}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td>
                    <div className="firearm-details">
                      <div className="serial-number">
                        <Shield size={14} />
                        <strong>{firearm.serial_number}</strong>
                      </div>
                      <div className="model-type">
                        {firearm.model} • {firearm.type} • {firearm.caliber}
                      </div>
                      <div
                        className={`registration-status ${firearm.registered ? 'registered' : 'unregistered'}`}
                      >
                        {firearm.registered ? (
                          <>
                            <CheckCircle size={14} />
                            <span>Registered</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>Unregistered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="owner-cell">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <span>{firearm.owner?.full_legal_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    {editingId === firearm.serial_number ? (
                      <select
                        ref={selectRef}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="status-select"
                      >
                        <option value="Select status">Select status</option>
                        <option value="Confiscated">Confiscated</option>
                        <option value="Deposit">Deposit</option>
                        <option value="Surrendered">Surrendered</option>
                        <option value="Abandoned">Abandoned</option>
                      </select>
                    ) : (
                      <div
                        className={`status-badge ${firearm.firearm_status.toLowerCase()}`}
                      >
                        {getStatusIcon(firearm.firearm_status)}
                        <span>{firearm.firearm_status}</span>
                      </div>
                    )}
                  </td>
                  <td className="date-cell">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-500" />
                      <span>
                        {new Date(
                          firearm.date_of_collection
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="location-cell">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />
                      <span>
                        {firearm.registration_location || 'Not specified'}
                      </span>
                    </div>
                  </td>
                  <td className="actions-cell">
                    {editingId === firearm.serial_number ? (
                      <div className="edit-actions">
                        <button
                          className="save-btn"
                          onClick={() =>
                            saveStatusChange(firearm.serial_number)
                          }
                        >
                          <Check size={16} />
                          <span>Save</span>
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>
                          <X size={16} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => startEditing(firearm)}
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <h3>No firearms found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirearmsStatus;
