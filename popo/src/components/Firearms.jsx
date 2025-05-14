import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Crosshair, Search, Download, Shield, 
  Archive, AlertTriangle, Gavel, ShieldHalf,
  Loader2, AlertCircle
} from 'lucide-react';
import '../styles/Firearms.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const Firearms = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [firearmsData, setFirearmsData] = useState({
    all: [],
    confiscated: [],
    surrendered: [],
    deposit: [],
    abandoned: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchFirearms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch owners data which contains firearms
        const response = await axios.get(`${API_BASE_URL}owners/`);
        const ownersData = response.data;
        
        // Extract and flatten all firearms from owners
        const allFirearms = ownersData.flatMap(owner => 
          owner.firearms.map(firearm => ({
            ...firearm,
            owner: {  // Include owner details with each firearm
              id: owner.id,
              full_legal_name: owner.full_legal_name,
              contact_number: owner.contact_number,
              license_status: owner.license_status,
              residential_address: owner.residential_address
            }
          }))
        );
        
        // Categorize firearms by status
        const categorizedData = {
          all: allFirearms,
          confiscated: allFirearms.filter(f => f.firearm_status === 'confiscated'),
          surrendered: allFirearms.filter(f => f.firearm_status === 'surrendered'),
          deposit: allFirearms.filter(f => f.firearm_status === 'deposit'),
          abandoned: allFirearms.filter(f => f.firearm_status === 'abandoned')
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

  const filteredFirearms = firearmsData[activeTab].filter(firearm => 
    firearm.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    firearm.gun_model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = async () => {
    try {
      // This would be your export endpoint if implemented
      const response = await axios.get(`${API_BASE_URL}firearms/export/`, {
        responseType: 'blob' // For file downloads
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
    switch(status) {
      case 'confiscated':
        return <Gavel size={18} className="status-icon confiscated" />;
      case 'surrendered':
        return <ShieldHalf size={18} className="status-icon surrendered" />;
      case 'deposit':
        return <Archive size={18} className="status-icon deposit" />;
      case 'abandoned':
        return <AlertTriangle size={18} className="status-icon abandoned" />;
      default:
        return <Crosshair size={18} className="status-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      confiscated: 'confiscated',
      surrendered: 'surrendered',
      deposit: 'deposit',
      abandoned: 'abandoned'
    };
    
    const statusText = {
      confiscated: 'Confiscated',
      surrendered: 'Surrendered',
      deposit: 'Deposit',
      abandoned: 'Abandoned'
    };

    return (
      <div className={`status-badge ${statusClasses[status]}`}>
        {getStatusIcon(status)}
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
      day: 'numeric'
    });
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
        <Shield size={20} />
        <span>POLICE EVIDENCE MANAGEMENT SYSTEM</span>
        <Shield size={20} />
      </div>

      <div className="firearms-header">
        <div className="header-title">
          <Crosshair size={24} className="header-icon" />
          <h2>Firearms Inventory</h2>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search firearms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="firearms-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Crosshair size={16} />
          <span>All Firearms</span>
          <span className="tab-count">{firearmsData.all.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'confiscated' ? 'active' : ''}`}
          onClick={() => setActiveTab('confiscated')}
        >
          <Gavel size={16} />
          <span>Confiscated</span>
          <span className="tab-count">{firearmsData.confiscated.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'surrendered' ? 'active' : ''}`}
          onClick={() => setActiveTab('surrendered')}
        >
          <ShieldHalf size={16} />
          <span>Surrendered</span>
          <span className="tab-count">{firearmsData.surrendered.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          <Archive size={16} />
          <span>Deposit</span>
          <span className="tab-count">{firearmsData.deposit.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'abandoned' ? 'active' : ''}`}
          onClick={() => setActiveTab('abandoned')}
        >
          <AlertTriangle size={16} />
          <span>Abandoned</span>
          <span className="tab-count">{firearmsData.abandoned.length}</span>
        </button>
      </div>

      <div className="firearms-grid">
        {filteredFirearms.length > 0 ? (
          filteredFirearms.map((firearm) => (
            <div key={firearm.serial_number} className="firearm-box">
              <div className="firearm-evidence-tag">EVIDENCE #{firearm.serial_number}</div>
              <div className="firearm-header">
                <div className="firearm-type">{firearm.gun_type}</div>
                {activeTab === 'all' && getStatusBadge(firearm.firearm_status)}
              </div>
              <div className="firearm-model">{firearm.gun_model}</div>
              <div className="firearm-caliber">{firearm.ammunition_type}</div>
              
              <div className="firearm-details">
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{formatDate(firearm.date_of_collection)}</span>
                </div>
                <div className="detail-row">
                  <span>Location:</span>
                  <span>{firearm.registration_location}</span>
                </div>
                <div className="detail-row">
                  <span>Owner:</span>
                  <span>{firearm.owner?.full_legal_name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <Search size={32} />
            <p>No firearms found matching your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Firearms;