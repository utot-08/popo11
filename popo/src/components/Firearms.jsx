import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Crosshair,
  Search,
  Download,
  Shield,
  Archive,
  AlertTriangle,
  Gavel,
  ShieldHalf,
  Loader2,
  AlertCircle,
  Target,
  XCircle,
  HandHeart,
  Warehouse,
  AlertOctagon,
  Ban,
  X,
  Image as ImageIcon,
  Eye,
  Maximize2,
  Zap,
  Box,
  Calendar,
  MapPin,
  User,
  Settings,
} from 'lucide-react';
import { useMemo } from 'react';
import eventBus from '../utils/eventBus';
import '../styles/Firearms.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const Firearms = ({ initialFilter = 'all' }) => {
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [selectedPreview, setSelectedPreview] = useState({ image: null, notes: null });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [firearmsData, setFirearmsData] = useState([
    ('captured', 'Captured'),
    ('confiscated', 'Confiscated'),
    ('surrendered', 'Surrendered'),
    ('deposited', 'Deposited'),
    ('abandoned', 'Abandoned'),
    ('forfeited', 'Forfeited'),
  ]);

  const [statusCounts, setStatusCounts] = useState({
    captured: 0,
    confiscated: 0,
    surrendered: 0,
    deposited: 0,
    abandoned: 0,
    forfeited: 0,
  });

  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);

   useEffect(() => {
    if (initialFilter && initialFilter !== activeTab) {
      setActiveTab(initialFilter);
    }
  }, [initialFilter]);

  // Add this useEffect to fetch gun data
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
      } catch (error) {
        console.error('Error fetching gun data:', error);
      }
    };
    fetchGunData();
  }, []);

  // Add these helper functions to get names from IDs
  const getTypeName = (typeId) => {
    const type = gunTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getSubtypeName = (subtypeId) => {
    const subtype = gunSubtypes.find((s) => s.id === subtypeId);
    return subtype ? subtype.name : 'Unknown Subtype';
  };

  const getModelName = (modelId) => {
    const model = gunModels.find((m) => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  useEffect(() => {
    const updateCounts = () => {
      const counts = {
        captured: 0,
        confiscated: 0,
        surrendered: 0,
        deposited: 0,
        abandoned: 0,
        forfeited: 0,
      };

      Object.values(firearmsData)
        .flat()
        .forEach((firearm) => {
          if (firearm.firearm_status === 'captured') counts.captured++;
          if (firearm.firearm_status === 'confiscated') counts.confiscated++;
          if (firearm.firearm_status === 'surrendered') counts.surrendered++;
          if (firearm.firearm_status === 'deposited') counts.deposited++;
          if (firearm.firearm_status === 'abandoned') counts.abandoned++;
          if (firearm.firearm_status === 'forfeited') counts.forfeited++;
        });

      setStatusCounts(counts);
    };

    updateCounts();
  }, [firearmsData]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const updateStatusCounts = () => {
    const allFirearms = Object.values(firearmsData).flat();
    const statusCounts = {
      captured: allFirearms.filter(
        (firearm) => firearm.firearm_status === 'captured'
      ).length,
      confiscated: allFirearms.filter(
        (firearm) => firearm.firearm_status === 'confiscated'
      ).length,
      surrendered: allFirearms.filter(
        (firearm) => firearm.firearm_status === 'surrendered'
      ).length,
      deposited: allFirearms.filter(
        (firearm) => firearm.firearm_status === 'deposited'
      ).length,
      abandoned: allFirearms.filter(
        (firearm) => firearm.firearm_status === 'abandoned'
      ).length,
      forfeited: allFirearms.filter(
        (firearm) => firearm.firearm_status === 'forfeited'
      ).length,
    };
    setStatusCounts(statusCounts);
  };

  useEffect(() => {
    if (activeTab === 'all') {
      updateStatusCounts();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchFirearms = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}firearms/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const firearmsList = Array.isArray(response.data) ? response.data : [];

      // Normalize data and ensure fields exist
      const allFirearms = firearmsList.map((firearm) => ({
        ...firearm,
        status_comment: firearm.status_comment || '',
        owner: firearm.owner && typeof firearm.owner === 'object' ? firearm.owner : {},
      }));

      // Sort by ID in descending order (Last In First Out)
      const sortedFirearms = allFirearms.sort((a, b) => b.id - a.id);

      // Categorize firearms by status
      const categorizedData = {
        captured: sortedFirearms.filter((f) => f.firearm_status === 'captured'),
        confiscated: sortedFirearms.filter((f) => f.firearm_status === 'confiscated'),
        surrendered: sortedFirearms.filter((f) => f.firearm_status === 'surrendered'),
        deposited: sortedFirearms.filter((f) => f.firearm_status === 'deposited'),
        abandoned: sortedFirearms.filter((f) => f.firearm_status === 'abandoned'),
        forfeited: sortedFirearms.filter((f) => f.firearm_status === 'forfeited'),
      };

      setFirearmsData(categorizedData);
      } catch (err) {
        console.error('Error fetching firearms:', err);
        setError('Failed to load firearms data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFirearms();
  }, []);

  // Listen for user archive/restore events to refresh firearms
  useEffect(() => {
    const handleUserArchived = () => {
      console.log('User archived - refreshing firearms...');
      window.location.reload(); // Simple refresh for now
    };

    const handleUserRestored = () => {
      console.log('User restored - refreshing firearms...');
      window.location.reload(); // Simple refresh for now
    };

    // Subscribe to events
    eventBus.on('userArchived', handleUserArchived);
    eventBus.on('userRestored', handleUserRestored);

    // Cleanup listeners on unmount
    return () => {
      eventBus.off('userArchived', handleUserArchived);
      eventBus.off('userRestored', handleUserRestored);
    };
  }, []);

  const filteredFirearms = useMemo(() => {
    const baseFilter = (firearm) => {
      if (!firearm) return false;
      
      // Search filter
      const matchesSearch = 
        firearm.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        firearm.gun_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        firearm.gun_type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filter
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
      
      return matchesSearch && matchesDateRange;
    };

    return activeTab === 'all'
      ? Object.values(firearmsData).flat().filter(baseFilter)
      : firearmsData[activeTab] 
        ? firearmsData[activeTab].filter(baseFilter)
        : [];
  }, [firearmsData, activeTab, searchTerm, dateFromFilter, dateToFilter]);

  const handleExport = async () => {
    try {
      // This would be your export endpoint if implemented
      const response = await axios.get(`${API_BASE_URL}firearms/export/`, {
        responseType: 'blob', // For file downloads
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'firearms_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'captured':
        return <Target size={10} className="status-icon captured" />;
      case 'confiscated':
        return <XCircle size={10} className="status-icon confiscated" />;
      case 'surrendered':
        return <HandHeart size={10} className="status-icon surrendered" />;
      case 'deposited':
        return <Warehouse size={10} className="status-icon deposited" />;
      case 'abandoned':
        return <AlertOctagon size={10} className="status-icon abandoned" />;
      case 'forfeited':
        return <Ban size={10} className="status-icon forfeited" />;
      default:
        return <Crosshair size={10} className="status-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      captured: 'captured',
      confiscated: 'confiscated',
      surrendered: 'surrendered',
      deposited: 'deposited',
      abandoned: 'abandoned',
      forfeited: 'forfeited',
    };

    const statusText = {
      captured: 'Captured',
      confiscated: 'Confiscated',
      surrendered: 'Surrendered',
      deposited: 'Deposited',
      abandoned: 'Abandoned',
      forfeited: 'Forfeited',
    };

    return (
      <div className={`status-badge ${statusClasses[status]}`}>
        <span>{statusText[status]}</span>
      </div>
    );
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

  // Helper function to get first name only
  const getFirstName = (fullName) => {
    if (!fullName || fullName === 'Unknown') return 'Unknown';
    return fullName.split(' ')[0];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading firearms data...</p>
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
      {/* Header */}
      <div className="firearms-header">
        <div className="firearms-header-title">
          <Crosshair size={28} className="firearms-header-icon" />
          <h2>Registered Firearms</h2>
        </div>
        <div className="firearms-header-actions">
          <button className="firearms-btn firearms-btn-secondary">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="firearms-status-cards">
        <div className="firearms-status-card">
          <div className="firearms-status-card-header">
            <span className="firearms-status-card-title">Total Firearms</span>
            <span className="firearms-status-card-count">
              {statusCounts.captured +
                statusCounts.confiscated +
                statusCounts.surrendered +
                statusCounts.deposited +
                statusCounts.abandoned +
                statusCounts.forfeited}
            </span>
          </div>
        </div>
        <div className="firearms-status-card">
          <div className="firearms-status-card-header">
            <span className="firearms-status-card-title">Captured</span>
            <span className="firearms-status-card-count">{statusCounts.captured}</span>
          </div>
          <span className="firearms-status-card-badge firearms-badge-captured">Captured</span>
        </div>
        <div className="firearms-status-card">
          <div className="firearms-status-card-header">
            <span className="firearms-status-card-title">Confiscated</span>
            <span className="firearms-status-card-count">{statusCounts.confiscated}</span>
          </div>
          <span className="firearms-status-card-badge firearms-badge-confiscated">Confiscated</span>
        </div>
        <div className="firearms-status-card">
          <div className="firearms-status-card-header">
            <span className="firearms-status-card-title">Surrendered</span>
            <span className="firearms-status-card-count">{statusCounts.surrendered}</span>
          </div>
          <span className="firearms-status-card-badge firearms-badge-surrendered">Surrendered</span>
        </div>
      </div>

      {/* Search and Date Filter Controls */}
      <div className="firearms-controls">
        <div className="firearms-search">
          <Search className="firearms-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by serial number, model, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="firearms-date-filters">
          <div className="firearms-date-input-group">
            <label className="firearms-date-label">From:</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="firearms-date-input"
            />
          </div>
          <div className="firearms-date-input-group">
            <label className="firearms-date-label">To:</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="firearms-date-input"
            />
          </div>
          {(dateFromFilter || dateToFilter) && (
            <button
              className="firearms-clear-date-btn"
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



      {/* Filter Tabs */}
      <div className="firearms-tabs">
        <button
          className={`firearms-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Crosshair size={16} />
          <span>All Firearms</span>
          <span className="firearms-tab-count">
            {statusCounts.captured +
              statusCounts.confiscated +
              statusCounts.surrendered +
              statusCounts.deposited +
              statusCounts.abandoned +
              statusCounts.forfeited}
          </span>
        </button>
        <button
          className={`firearms-tab-btn ${activeTab === 'captured' ? 'active' : ''}`}
          onClick={() => setActiveTab('captured')}
        >
          <Target size={16} />
          <span>Captured</span>
          <span className="firearms-tab-count">{statusCounts.captured}</span>
        </button>
        <button
          className={`firearms-tab-btn ${activeTab === 'confiscated' ? 'active' : ''}`}
          onClick={() => setActiveTab('confiscated')}
        >
          <XCircle size={16} />
          <span>Confiscated</span>
          <span className="firearms-tab-count">{statusCounts.confiscated}</span>
        </button>
        <button
          className={`firearms-tab-btn ${activeTab === 'surrendered' ? 'active' : ''}`}
          onClick={() => setActiveTab('surrendered')}
        >
          <HandHeart size={16} />
          <span>Surrendered</span>
          <span className="firearms-tab-count">{statusCounts.surrendered}</span>
        </button>
        <button
          className={`firearms-tab-btn ${activeTab === 'deposited' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposited')}
        >
          <Warehouse size={16} />
          <span>Deposited</span>
          <span className="firearms-tab-count">{statusCounts.deposited}</span>
        </button>
        <button
          className={`firearms-tab-btn ${activeTab === 'abandoned' ? 'active' : ''}`}
          onClick={() => setActiveTab('abandoned')}
        >
          <AlertOctagon size={16} />
          <span>Abandoned</span>
          <span className="firearms-tab-count">{statusCounts.abandoned}</span>
        </button>
        <button
          className={`firearms-tab-btn ${activeTab === 'forfeited' ? 'active' : ''}`}
          onClick={() => setActiveTab('forfeited')}
        >
          <Ban size={16} />
          <span>Forfeited</span>
          <span className="firearms-tab-count">{statusCounts.forfeited}</span>
        </button>
      </div>

      {/* Firearms Table */}
      <div className="firearms-table-container">
        {filteredFirearms.length > 0 ? (
          <table className="firearms-table">
            <thead>
              <tr>
                <th>
                  <div className="header-with-icon">
                    <Crosshair size={16} />
                    <span>Firearm Type</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <Archive size={16} />
                    <span>Model</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <Target size={16} />
                    <span>Caliber</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <Shield size={16} />
                    <span>Serial Number</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <AlertCircle size={16} />
                    <span>Status</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <Download size={16} />
                    <span>Date Collected</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <Warehouse size={16} />
                    <span>Location</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <HandHeart size={16} />
                    <span>Owner</span>
                  </div>
                </th>
                <th>
                  <div className="header-with-icon">
                    <Settings size={16} />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFirearms.map((firearm, index) => (
                <tr key={index} className="firearms-table-row">
                  <td>
                    <div className="firearms-type-cell">
                      <div className="firearms-type-name">
                        {getTypeName(firearm.gun_type)}
                      </div>
                      <div className="firearms-subtype-name">
                        {getSubtypeName(firearm.gun_subtype)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="firearms-model-cell">
                      {firearm.gun_model_details?.name || 'Unknown Model'}
                    </div>
                  </td>
                  <td>
                    <div className="firearms-caliber-cell">
                      {firearm.ammunition_type}
                    </div>
                  </td>
                  <td>
                    <div className="firearms-serial-cell">
                      {firearm.serial_number}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(firearm.firearm_status)}
                  </td>
                  <td>
                    <div className="firearms-date-cell">
                      {formatDate(firearm.date_of_collection)}
                    </div>
                  </td>
                  <td>
                    <div className="firearms-location-cell">
                      {firearm.registration_location}
                    </div>
                  </td>
                  <td>
                    <div className="firearms-owner-cell">
                      {getFirstName(firearm.owner_details?.full_legal_name)}
                    </div>
                  </td>
                  <td>
                    <div className="firearms-action-buttons">
                      <button 
                        className="firearms-action-btn firearms-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPreview({
                            image: firearm.image_url || null,
                            notes: firearm.status_comment || 'No status notes available'
                          });
                          setIsPreviewModalOpen(true);
                        }}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="firearms-no-results">
            <div className="firearms-no-results-content">
              <AlertCircle size={48} />
              <p>No firearms found matching your search criteria</p>
              <button 
                className="firearms-btn firearms-btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setDateFromFilter('');
                  setDateToFilter('');
                  setActiveTab('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal - Combined Image & Notes */}
      {isPreviewModalOpen && (
        <div className="preview-modal-overlay" onClick={() => setIsPreviewModalOpen(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>Firearm Preview</h3>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="preview-modal-close"
              >
                &times;
              </button>
            </div>
            <div className="preview-modal-body">
              {/* Image Section */}
              <div className="preview-image-section">
                <div className="preview-section-header">
                  <h4>Firearm Image</h4>
                  {selectedPreview.image && (
                    <button
                      className="fullscreen-btn"
                      onClick={() => setIsFullscreenImageOpen(true)}
                      title="View fullscreen"
                    >
                      <Maximize2 size={16} />
                      Fullscreen
                    </button>
                  )}
                </div>
                <div className="preview-image-container">
                  {selectedPreview.image ? (
                    <img 
                      src={selectedPreview.image} 
                      alt="Firearm" 
                      className="preview-firearm-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <ImageIcon size={48} />
                      <p>No image available</p>
                    </div>
                  )}
                  <div className="no-image-placeholder" style={{ display: selectedPreview.image ? 'none' : 'flex' }}>
                    <ImageIcon size={48} />
                    <p>Image unavailable</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="preview-notes-section">
                <h4>Status Notes</h4>
                <div className="preview-notes-content">
                  {selectedPreview.notes}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPreview.notes);
                    alert('Notes copied to clipboard!');
                  }}
                  className="copy-notes-btn"
                >
                  Copy Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {isFullscreenImageOpen && (
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
              {selectedPreview.image ? (
                <img 
                  src={selectedPreview.image} 
                  alt="Firearm Fullscreen" 
                  className="fullscreen-firearm-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="no-image-placeholder-fullscreen">
                  <ImageIcon size={96} />
                  <p>Image unavailable</p>
                </div>
              )}
              <div className="no-image-placeholder-fullscreen" style={{ display: selectedPreview.image ? 'none' : 'flex' }}>
                <ImageIcon size={96} />
                <p>Image unavailable</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Firearms;
