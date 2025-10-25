import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, User, ShieldCheck, FileText, Fingerprint, Contact, 
  MapPin, Calendar, Crosshair, Mail, Phone, Home, 
  Clock, ScrollText, IdCard, Shield, Image,
  MoreHorizontal, Edit, Camera, Plus, Check, X,
  MessageCircle, Share2, ThumbsUp, Bookmark, ChevronRight,
  AlertCircle, CheckCircle, Clock as ClockIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ClientProfile.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const ClientProfile = ({ onBack }) => {
  const { user } = useAuth();
  const [ownerData, setOwnerData] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [coverPhoto] = useState('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  const [profilePhoto] = useState('https://randomuser.me/api/portraits/men/1.jpg');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication token missing');
        }

        // Fetch owner by matching user's first and last name to owner's full_legal_name
        const fullName = `${user.first_name} ${user.last_name}`.trim();
        const ownerResponse = await axios.get(`${API_BASE_URL}owners/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: fullName }
        });

        if (ownerResponse.data && ownerResponse.data.length > 0) {
          // Find the best match (exact match if possible)
          const owner = ownerResponse.data.find(o => 
            o.full_legal_name.trim().toLowerCase() === fullName.toLowerCase()
          ) || ownerResponse.data[0];
          
          setOwnerData(owner);
          
          // Fetch licenses for this owner
          try {
            const licenseResponse = await axios.get(`${API_BASE_URL}firearm-licenses/`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { 
                owner: owner.id,
                search: fullName
              }
            });
            setLicenses(licenseResponse.data.results || licenseResponse.data);
          } catch (err) {
            console.error('Error fetching licenses:', err);
            setLicenses([]);
          }
        } else {
          // No profile found for this user
          setOwnerData(null);
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', text: 'Active', icon: CheckCircle },
      expired: { class: 'status-expired', text: 'Expired', icon: AlertCircle },
      revoked: { class: 'status-revoked', text: 'Revoked', icon: X },
      pending: { class: 'status-pending', text: 'Pending', icon: ClockIcon }
    };
    return statusConfig[status] || { class: 'status-default', text: 'Unknown', icon: AlertCircle };
  };

  const handleCreateProfile = () => {
    // Redirect to profile creation page or show a form
    alert('Redirect to profile creation page');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-content">
          <AlertCircle size={48} className="error-icon" />
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          {user && (
            <div className="user-debug-info">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              <p><strong>Email:</strong> {user.email || 'Not available'}</p>
            </div>
          )}
          <div className="error-actions">
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = 'mailto:support@firearmsportal.com'}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="profile-not-found">
        <div className="not-found-content">
          <User size={64} className="not-found-icon" />
          <h2>Profile Not Found</h2>
          <p>We couldn't find a firearms profile associated with your account.</p>
          {user && (
            <div className="user-debug-info">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            </div>
          )}
          <div className="not-found-actions">
            <button className="btn-primary" onClick={handleCreateProfile}>
              Create Profile
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = 'mailto:support@firearmsportal.com'}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header with Back Button */}
      <div className="profile-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-info">
          <h1 className="profile-name">{ownerData.full_legal_name || `${user.first_name} ${user.last_name}`}</h1>
          <p className="profile-title">Firearm Owner</p>
          
          <div className="profile-stats">
            <div className="stat-item">
              <ShieldCheck size={20} />
              <div>
                <span className="stat-number">{licenses.length}</span>
                <span className="stat-label">Licenses</span>
              </div>
            </div>
            <div className="stat-item">
              <Crosshair size={20} />
              <div>
                <span className="stat-number">{ownerData.firearms ? ownerData.firearms.length : 0}</span>
                <span className="stat-label">Firearms</span>
              </div>
            </div>
            <div className="stat-item">
              <Calendar size={20} />
              <div>
                <span className="stat-number">{formatDate(ownerData.created_at).split(',')[1]}</span>
                <span className="stat-label">Member Since</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={18} />
          <span>Overview</span>
        </button>
        <button 
          className={`tab ${activeTab === 'licenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('licenses')}
        >
          <ShieldCheck size={18} />
          <span>Licenses</span>
        </button>
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <FileText size={18} />
          <span>About</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="tab-content"
          >
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="overview-grid">
                  {/* Personal Info Card */}
                  <div className="info-card">
                    <div className="card-header">
                      <User size={20} />
                      <h3>Personal Information</h3>
                    </div>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">Full Name</span>
                        <span className="info-value">{ownerData.full_legal_name || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Gender</span>
                        <span className="info-value">
                          {ownerData.gender === 'male' ? 'Male' : 
                           ownerData.gender === 'female' ? 'Female' : 
                           ownerData.gender === 'other' ? 'Other' : 'Prefer not to say'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{ownerData.age || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Contact</span>
                        <span className="info-value">{ownerData.contact_number || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Address</span>
                        <span className="info-value">{ownerData.residential_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* License Status Card */}
                  <div className="info-card">
                    <div className="card-header">
                      <ShieldCheck size={20} />
                      <h3>License Status</h3>
                    </div>
                    {licenses.length > 0 ? (
                      <div className="license-list">
                        {licenses.slice(0, 3).map(license => {
                          const statusInfo = getStatusBadge(license.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <div key={license.id} className="license-item">
                              <div className="license-info">
                                <StatusIcon size={16} className={`status-icon ${statusInfo.class}`} />
                                <div>
                                  <span className="license-number">#{license.license_number}</span>
                                  <span className={`status-badge ${statusInfo.class}`}>
                                    {statusInfo.text}
                                  </span>
                                </div>
                              </div>
                              <div className="license-details">
                                <span className="license-firearm">{license.kind} {license.make}</span>
                                <span className="license-expiry">Expires: {formatDate(license.expiry_date)}</span>
                              </div>
                            </div>
                          );
                        })}
                        {licenses.length > 3 && (
                          <button className="view-all-btn">
                            View All Licenses
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="no-licenses">
                        <ShieldCheck size={32} />
                        <p>No licenses found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'licenses' && (
              <div className="licenses-content">
                <div className="content-header">
                  <h2>My Licenses</h2>
                  <div className="license-count">
                    <ShieldCheck size={20} />
                    <span>{licenses.length} License{licenses.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                {licenses.length > 0 ? (
                  <div className="licenses-grid">
                    {licenses.map(license => {
                      const statusInfo = getStatusBadge(license.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <motion.div 
                          key={license.id} 
                          className="license-card"
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="license-card-header">
                            <div className="license-title">
                              <ShieldCheck size={20} />
                              <h4>License #{license.license_number}</h4>
                            </div>
                            <span className={`status-badge ${statusInfo.class}`}>
                              <StatusIcon size={14} />
                              {statusInfo.text}
                            </span>
                          </div>
                          
                          <div className="license-details">
                            <div className="detail-row">
                              <span className="detail-label">Control Number</span>
                              <span className="detail-value">{license.control_number}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Firearm</span>
                              <span className="detail-value">{license.kind} {license.make} {license.model}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Caliber</span>
                              <span className="detail-value">{license.caliber}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Issued</span>
                              <span className="detail-value">{formatDate(license.date_issued)}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Expires</span>
                              <span className="detail-value">{formatDate(license.expiry_date)}</span>
                            </div>
                          </div>
                          
                          {license.photo_url && (
                            <button 
                              className="view-photo-btn"
                              onClick={() => setSelectedPhoto(license.photo_url)}
                            >
                              <Image size={16} />
                              <span>View License Photo</span>
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <ShieldCheck size={64} />
                    <h3>No Licenses Found</h3>
                    <p>You don't have any firearm licenses registered yet.</p>
                    <div className="empty-state-info">
                      <p>Contact your local firearms office to register your licenses.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-content">
                <div className="about-section">
                  <h2>About</h2>
                  <div className="about-grid">
                    <div className="about-card">
                      <h3>Personal Details</h3>
                      <div className="about-list">
                        <div className="about-item">
                          <span className="about-label">Full Legal Name</span>
                          <span className="about-value">{ownerData.full_legal_name || 'N/A'}</span>
                        </div>
                        <div className="about-item">
                          <span className="about-label">Gender</span>
                          <span className="about-value">
                            {ownerData.gender === 'male' ? 'Male' : 
                             ownerData.gender === 'female' ? 'Female' : 
                             ownerData.gender === 'other' ? 'Other' : 'Prefer not to say'}
                          </span>
                        </div>
                        <div className="about-item">
                          <span className="about-label">Age</span>
                          <span className="about-value">{ownerData.age || 'N/A'}</span>
                        </div>
                        <div className="about-item">
                          <span className="about-label">Contact Number</span>
                          <span className="about-value">{ownerData.contact_number || 'N/A'}</span>
                        </div>
                        <div className="about-item">
                          <span className="about-label">Residential Address</span>
                          <span className="about-value">{ownerData.residential_address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="about-card">
                      <h3>Account Information</h3>
                      <div className="about-list">
                        <div className="about-item">
                          <span className="about-label">Member Since</span>
                          <span className="about-value">{formatDate(ownerData.created_at)}</span>
                        </div>
                        <div className="about-item">
                          <span className="about-label">Total Licenses</span>
                          <span className="about-value">{licenses.length}</span>
                        </div>
                        <div className="about-item">
                          <span className="about-label">Active Licenses</span>
                          <span className="about-value">{licenses.filter(l => l.status === 'active').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            className="photo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              className="photo-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="photo-modal-header">
                <h3>License Photo</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="photo-modal-content">
                <img
                  src={selectedPhoto}
                  alt="License Photo"
                  className="license-photo-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientProfile;