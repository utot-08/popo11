import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, ShieldCheck, Search, FileText, 
  Fingerprint, Contact, MapPin, Calendar, 
  BadgeInfo, Crosshair, Gavel, ShieldHalf, 
  Archive, AlertTriangle, Shield, Mail,
  Phone, Home, Clock, CalendarDays, 
  Loader2, AlertCircle, ScrollText, 
  HardDriveDownload, FileSearch, UserCog,
  IdCard, ShieldQuestion, ShieldPlus, 
  ShieldMinus, ShieldOff, History, 
  FileDigit, FileKey2, FileClock
} from 'lucide-react';
import '../styles/OwnerProfile.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const OwnerProfile = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ownersData, setOwnersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOwner, setExpandedOwner] = useState(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}owners/`);
        setOwnersData(response.data);
      } catch (err) {
        console.error('Error fetching owners:', err);
        setError('Failed to load owner data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const toggleOwnerExpand = (ownerId) => {
    setExpandedOwner(expandedOwner === ownerId ? null : ownerId);
  };

  const filteredOwners = ownersData.filter(owner =>
    owner.full_legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (owner.id && owner.id.toString().includes(searchTerm.toLowerCase())) ||
    (owner.contact_number && owner.contact_number.includes(searchTerm)) ||
    (owner.firearms && owner.firearms.some(firearm => 
      firearm.serial_number.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}owners/report/`, {
        responseType: 'blob'
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      confiscated: { icon: <Gavel size={16} />, class: 'confiscated' },
      surrendered: { icon: <Shield size={16} />, class: 'surrendered' },
      deposit: { icon: <Archive size={16} />, class: 'deposit' },
      abandoned: { icon: <AlertTriangle size={16} />, class: 'abandoned' },
      active: { icon: <ShieldHalf size={16} />, class: 'active' }
    };

    const config = statusConfig[status] || { icon: null, class: '' };

    return (
      <div className={`status-badge ${config.class}`}>
        {config.icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const getLicenseStatusIcon = (status) => {
    const iconConfig = {
      active: <ShieldPlus size={16} className="icon-active" />,
      suspended: <ShieldMinus size={16} className="icon-suspended" />,
      revoked: <ShieldOff size={16} className="icon-revoked" />,
      pending: <ShieldQuestion size={16} className="icon-pending" />,
      expired: <FileClock size={16} className="icon-expired" />
    };
    return iconConfig[status.toLowerCase()] || <ShieldQuestion size={16} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
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

      <div className="firearms-header">
        <div className="header-title">
          <UserCog size={24} className="header-icon" />
          <h2>Registered Firearm Owners</h2>
          <span className="owners-count">
            <FileDigit size={18} />
            <span>{ownersData.length} owners registered</span>
          </span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search owners, IDs, contacts or serial numbers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="owner-profile-content">
        {filteredOwners.length > 0 ? (
          filteredOwners.map(owner => (
            <div key={owner.id} className={`owner-info-card ${expandedOwner === owner.id ? 'expanded' : ''}`}>
              <div 
                className="owner-info-header clickable"
                onClick={() => toggleOwnerExpand(owner.id)}
              >
                <div className="owner-main-info">
                  <IdCard size={24} className="owner-icon" />
                  <div className="owner-name-id">
                    <h3>{owner.full_legal_name}</h3>
                    <div className="owner-meta">
                      <span className="owner-id">
                        <Fingerprint size={14} />
                        <span>ID: {owner.id}</span>
                      </span>
                      <span className="owner-reg-date">
                        <History size={14} />
                        <span>Registered: {formatDate(owner.registration_date)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="owner-status-indicator">
                  {getLicenseStatusIcon(owner.license_status)}
                  <span className={`license-status ${owner.license_status.toLowerCase()}`}>
                    {owner.license_status}
                  </span>
                </div>
                <div className={`expand-icon ${expandedOwner === owner.id ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>

              {expandedOwner === owner.id && (
                <div className="owner-details-content">
                  <div className="owner-details-grid">
                    <div className="detail-item">
                      <Contact size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Primary Contact</span>
                        <span className="detail-value">{owner.contact_number || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MapPin size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Residential Address</span>
                        <span className="detail-value">{owner.residential_address || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Home size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Mailing Address</span>
                        <span className="detail-value">{owner.mailing_address || owner.residential_address || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <User size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Age</span>
                        <span className="detail-value">{owner.age || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="owner-firearms-section">
                    <div className="section-header">
                      <Crosshair size={20} />
                      <h3>Registered Firearms ({owner.firearms?.length || 0})</h3>
                    </div>

                    {owner.firearms && owner.firearms.length > 0 ? (
                      <div className="firearms-grid">
                        {owner.firearms.map((firearm, index) => (
                          <div key={index} className="firearm-box">
                            <div className="firearm-header">
                              <div className="firearm-type-model">
                                <div className="firearm-type">{firearm.gun_type}</div>
                                <div className="firearm-model">{firearm.gun_model}</div>
                              </div>
                              {getStatusBadge(firearm.firearm_status)}
                            </div>
                            <div className="firearm-details">
                              <div className="detail-row">
                                <span><FileSearch size={14} /> Serial:</span>
                                <span>{firearm.serial_number}</span>
                              </div>
                              <div className="detail-row">
                                <span><Crosshair size={14} /> Caliber:</span>
                                <span>{firearm.ammunition_type}</span>
                              </div>
                              <div className="detail-row">
                                <span><MapPin size={14} /> Location:</span>
                                <span>{firearm.registration_location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-firearms">
                        <p>No firearms registered for this owner</p>
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
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfile;