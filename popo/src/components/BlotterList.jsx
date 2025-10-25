// BlotterList.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  FileText,
  Calendar,
  User,
  Shield,
  MapPin,
  Search,
  Filter,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  X,
  Crosshair,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/BlotterList.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const BlotterList = () => {
  const { user } = useAuth();
  const [blotters, setBlotters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [selectedBlotter, setSelectedBlotter] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);
  const [gunDataLoading, setGunDataLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Helper functions to get gun data names
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

  // Fetch gun data
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
      } finally {
        setGunDataLoading(false);
      }
    };
    fetchGunData();
  }, []);

  // Fetch surrendered firearms (blotter entries) for the current administrator
  const fetchBlotters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!user) {
        console.error('No user logged in');
        setBlotters([]);
        return;
      }

      // Get all firearms - backend will scope them to the current user
      const firearmsResponse = await axios.get(`${API_BASE_URL}firearms/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Filter for surrendered status
      // Police officers (superadmin) can view all surrendered firearms
      // Administrators can only view firearms from their jurisdiction
      const surrenderedFirearms = firearmsResponse.data.filter(
        firearm => firearm.firearm_status === 'surrendered'
      );

      console.log('🔍 Surrendered firearms found:', surrenderedFirearms.length);
      console.log('👤 Current user role:', user.role);
      console.log('📊 Sample firearm data structure:', surrenderedFirearms[0]);

      // Process surrendered firearms - owner details are already included in the API response
      const blottersWithDetails = surrenderedFirearms.map((firearm) => {
        return {
          id: firearm.serial_number,
          firearm: {
            ...firearm,
            typeName: firearm.gun_type_details?.name || getTypeName(firearm.gun_type),
            subtypeName: firearm.gun_subtype_details?.name || getSubtypeName(firearm.gun_subtype),
            modelName: firearm.gun_model_details?.name || 'Unknown Model',
          },
          owner: firearm.owner_details, // Use owner details from API response
          date_surrendered: firearm.date_of_collection,
          status: 'active', // Default status for surrendered firearms
          created_at: firearm.created_at,
          registration_location: firearm.registration_location,
          status_comment: firearm.status_comment || '',
          firearm_id: firearm.id // Store firearm ID for sorting
        };
      });

      // Sort by firearm ID in descending order (Last In First Out)
      const sortedBlotters = blottersWithDetails.sort((a, b) => (b.firearm_id || 0) - (a.firearm_id || 0));

      setBlotters(sortedBlotters);
    } catch (error) {
      console.error('Error fetching blotters:', error);
      setBlotters([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new blotter entry (called from AddOwner)
  const addBlotterEntry = useCallback((firearmData, ownerData) => {
    console.log('🔧 addBlotterEntry called with:', { firearmData, ownerData });
    if (firearmData.firearm_status === 'surrendered') {
      const newBlotter = {
        id: firearmData.serial_number,
        firearm: {
          ...firearmData,
          typeName: firearmData.gun_type?.name || getTypeName(firearmData.gun_type),
          subtypeName: firearmData.gun_subtype?.name || getSubtypeName(firearmData.gun_subtype),
          modelName: firearmData.gun_model?.name || firearmData.gun_model_details?.name || 'Unknown Model',
        },
        owner: ownerData,
        date_surrendered: firearmData.date_of_collection,
        status: 'active',
        created_at: new Date().toISOString(),
        registration_location: firearmData.registration_location,
        status_comment: firearmData.status_comment || ''
      };

      setBlotters(prev => [newBlotter, ...prev]);
    }
  }, [gunTypes, gunSubtypes, gunModels]);

  useEffect(() => {
    if (user) {
      fetchBlotters();
    }
  }, [user]);

  // Export the addBlotterEntry function for use in AddOwner
  useEffect(() => {
    window.addBlotterEntry = addBlotterEntry;
    return () => {
      delete window.addBlotterEntry;
    };
  }, [addBlotterEntry]);

  // Filter blotters based on search and filters
  const filteredBlotters = blotters.filter(blotter => {
    const matchesSearch = searchTerm === '' || 
      (blotter.owner?.full_legal_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (blotter.firearm.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (blotter.firearm.modelName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (blotter.firearm.typeName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || blotter.status === statusFilter;
    
    // Apply date range filter
    let matchesDateRange = true;
    if (dateFromFilter || dateToFilter) {
      if (!blotter.date_surrendered) {
        matchesDateRange = false;
      } else {
        const surrenderDate = new Date(blotter.date_surrendered);
        surrenderDate.setHours(0, 0, 0, 0);

        let matchesFrom = true;
        let matchesTo = true;

        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          matchesFrom = surrenderDate >= fromDate;
        }

        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesTo = surrenderDate <= toDate;
        }

        matchesDateRange = matchesFrom && matchesTo;
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // View blotter details
  const viewBlotterDetails = (blotter) => {
    setSelectedBlotter(blotter);
    setViewMode('details');
  };

  // Close details view
  const closeDetails = () => {
    setSelectedBlotter(null);
    setViewMode('list');
  };

  // Export blotters to CSV
  const exportToCSV = () => {
    const headers = ['Serial Number', 'Owner Name', 'Firearm Type', 'Firearm Model', 'Date Surrendered', 'Status', 'Contact Number', 'Registration Location'];
      
    const csvData = filteredBlotters.map(blotter => [
      blotter.firearm.serial_number,
      blotter.owner?.full_legal_name || 'N/A',
      blotter.firearm.typeName,
      blotter.firearm.modelName,
      new Date(blotter.date_surrendered).toLocaleDateString(),
      blotter.status,
      blotter.owner?.contact_number || 'N/A',
      blotter.registration_location || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surrender-blotters-${user?.municipality || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format date for display
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
      <div className="blotter-loading">
        <Loader2 size={32} className="animate-spin" />
        <p>Loading surrender records...</p>
      </div>
    );
  }

  if (viewMode === 'details' && selectedBlotter) {
    return (
      <div className="blotter-details">
        <div className="details-header">
          <button onClick={closeDetails} className="back-button">
            ← Back to List
          </button>
          <h2>Surrender Blotter Details</h2>
        </div>

        <div className="details-content">
          {/* Image Section - Show if image exists */}
          {selectedBlotter.firearm.image_url && (
            <div className="details-section">
              <h3>Firearm Image</h3>
              <div className="details-image-container">
                <img 
                  src={selectedBlotter.firearm.image_url} 
                  alt={selectedBlotter.firearm.modelName}
                  className="details-firearm-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="no-image-placeholder" style={{ display: 'none' }}>
                  <ImageIcon size={48} />
                  <p>Image unavailable</p>
                </div>
              </div>
            </div>
          )}

          <div className="details-section">
            <h3>Firearm Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Serial Number:</span>
                <span className="detail-value">{selectedBlotter.firearm.serial_number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Model:</span>
                <span className="detail-value">{selectedBlotter.firearm.modelName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedBlotter.firearm.typeName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Subtype:</span>
                <span className="detail-value">{selectedBlotter.firearm.subtypeName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ammunition:</span>
                <span className="detail-value">{selectedBlotter.firearm.ammunition_type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Surrendered:</span>
                <span className="detail-value">
                  {formatDate(selectedBlotter.date_surrendered)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registration Location:</span>
                <span className="detail-value">{selectedBlotter.registration_location}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Owner Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{selectedBlotter.owner?.full_legal_name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Number:</span>
                <span className="detail-value">{selectedBlotter.owner?.contact_number || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{selectedBlotter.owner?.age || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedBlotter.owner?.formattedGender || selectedBlotter.owner?.gender || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedBlotter.owner?.residential_address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Surrender Details</h3>
            <div className="details-grid">
              <div className="detail-item full-width">
                <span className="detail-label">Status Comment:</span>
                <span className="detail-value">{selectedBlotter.status_comment || 'No comments'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Blotter Status:</span>
                <span className={`detail-value status-badge status-${selectedBlotter.status}`}>
                  {selectedBlotter.status === 'active' && <Clock size={12} />}
                  {selectedBlotter.status === 'processed' && <CheckCircle size={12} />}
                  {selectedBlotter.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blotter-list">
      <div className="blotter-header">
        <div className="header-title">
          <FileText size={32} />
          <div>
            <h1>Surrender Blotter</h1>
            <p>Records of surrendered firearms</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={exportToCSV} className="export-btn">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="blotter-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by serial number, owner name, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="processed">Processed</option>
              <option value="archived">Archived</option>
            </select>
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
      </div>

      <div className="blotter-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FileText size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{blotters.length}</span>
            <span className="stat-label">Total Records</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">
              {blotters.filter(b => b.status === 'active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon firearm">
            <Crosshair size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">
              {blotters.length}
            </span>
            <span className="stat-label">Surrendered</span>
          </div>
        </div>
      </div>

      <div className="blotter-table-container">
        {filteredBlotters.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No surrender records found</h3>
            <p>When firearms are registered with "surrendered" status, they will appear here.</p>
            {searchTerm || statusFilter !== 'all' || dateFromFilter || dateToFilter ? (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFromFilter('');
                  setDateToFilter('');
                }}
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : (
          <table className="blotter-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Owner Name</th>
                <th>Firearm Model</th>
                <th>Firearm Type</th>
                <th>Date Surrendered</th>
                <th>Image</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlotters.map((blotter) => (
                <tr key={blotter.id}>
                  <td>
                    <div className="serial-number">
                      <Shield size={14} />
                      {blotter.firearm.serial_number}
                    </div>
                  </td>
                  <td>
                    <div className="owner-info">
                      <User size={14} />
                      {blotter.owner?.full_legal_name || 'N/A'}
                    </div>
                  </td>
                  <td>{blotter.firearm.modelName}</td>
                  <td>{blotter.firearm.typeName}</td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {formatDate(blotter.date_surrendered)}
                    </div>
                  </td>
                  <td className="blotter-image-cell">
                    {blotter.firearm.image_url ? (
                      <button 
                        className="view-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(blotter.firearm.image_url);
                          setIsImageModalOpen(true);
                        }}
                        title="View firearm image"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    ) : (
                      <span className="no-image-indicator">
                        <ImageIcon size={14} />
                        No image
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${blotter.status}`}>
                      {blotter.status === 'active' && <Clock size={12} />}
                      {blotter.status === 'processed' && <CheckCircle size={12} />}
                      {blotter.status === 'archived' && <FileText size={12} />}
                      {blotter.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Export the addBlotterEntry function for use in AddOwner */}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="image-modal-overlay" onClick={() => setIsImageModalOpen(false)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>Firearm Image</h3>
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="image-modal-close"
              >
                &times;
              </button>
            </div>
            <div className="image-modal-body">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Surrendered Firearm" 
                  className="firearm-full-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="no-image-placeholder" style={{ display: selectedImage ? 'none' : 'flex' }}>
                <ImageIcon size={48} />
                <p>Image unavailable</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlotterList;