import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Database,
  FileText,
  Calendar,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Archive,
  Trash2,
  Eye,
  Settings,
  Shield,
  Zap,
  Cloud,
  Server,
  FileCheck,
  AlertTriangle,
  Info,
  X,
  Plus,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  User
} from 'lucide-react';
import api from '../api/axios';
import '../styles/BackupRestore.css';

const BackupRestore = () => {
  const [activeTab, setActiveTab] = useState('backup');
  const [backupHistory, setBackupHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: preparing, 1: processing, 2: finalizing
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [backupOptions, setBackupOptions] = useState({
    type: 'complete',
    includeDatabase: true,
    includeMedia: true,
    includeDjangoFiles: true
  });
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'delete', 'success', 'error', 'info'
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    data: null
  });

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const openModal = (type, title, message, onConfirm, data = null, confirmText = 'Confirm', cancelText = 'Cancel') => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      data
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleModalConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm(modal.data);
    }
    closeModal();
  };



  const fetchBackupHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/backup/history/');
      setBackupHistory(response.data);
    } catch (error) {
      console.error('Error fetching backup history:', error);
      
      let errorMessage = 'Failed to fetch backup history';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Permission denied. Only administrators and police officers can view backup history.';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.error || 'Server error while fetching backup history';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      setLoadingStep(0); // Preparing
      setMessage({ type: '', text: '' });

      // Simulate preparing step
      setTimeout(() => setLoadingStep(1), 500); // Processing

      const response = await api.post('/api/backup/create/', {
        include_media: backupOptions.includeMedia,
        include_database: backupOptions.includeDatabase
      }, {
        responseType: 'blob',
        timeout: 300000 // 5 minute timeout
      });

      // Move to finalizing step
      setLoadingStep(2); // Finalizing

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      openModal(
        'success',
        'Data Saved Successfully',
        'Complete backup has been created and downloaded successfully!',
        null,
        null,
        'OK'
      );

      // Refresh backup history
      fetchBackupHistory();
    } catch (error) {
      console.error('Error creating backup:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Log the actual error response data
      if (error.response?.data) {
        console.error('Server error response:', error.response.data);
        if (typeof error.response.data === 'string') {
          console.error('Error response text:', error.response.data);
        }
      }
      
      let errorMessage = 'Failed to create backup';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Permission denied. Only administrators and police officers can create backups.';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.error || 'Server error during backup creation';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Backup operation timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      openModal(
        'error',
        'Save Failed',
        errorMessage,
        null,
        null,
        'OK'
      );
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setMessage({
          type: 'info',
          text: `Selected file: ${file.name}`
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Please select a valid ZIP backup file'
        });
      }
    }
  };

  const handleDelete = async (backupId, backupName) => {
    openModal(
      'delete',
      'Delete Saved Copy',
      `Are you sure you want to delete "${backupName}"? This action cannot be undone and will permanently remove this saved copy from the system.`,
      performDelete,
      { backupId, backupName },
      'Delete',
      'Cancel'
    );
  };

  const performDelete = async (data) => {
    try {
      setLoading(true);
      await api.delete(`/api/backup/delete/${data.backupId}/`);
      
      // Show success modal
      openModal(
        'success',
        'Saved Copy Deleted',
        `"${data.backupName}" has been successfully deleted from the system.`,
        null,
        null,
        'OK'
      );

      // Refresh backup history
      fetchBackupHistory();

    } catch (error) {
      console.error('Error deleting backup:', error);
      openModal(
        'error',
        'Delete Failed',
        error.response?.data?.error || 'Failed to delete saved copy. Please try again.',
        null,
        null,
        'OK'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (backupId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/backup/download/${backupId}/`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'backup.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      openModal(
        'success',
        'Download Complete',
        'Your saved copy has been successfully downloaded to your device.',
        null,
        null,
        'OK'
      );

    } catch (error) {
      console.error('Error downloading backup:', error);
      openModal(
        'error',
        'Download Failed',
        error.response?.data?.error || 'Failed to download saved copy. Please try again.',
        null,
        null,
        'OK'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Please select a backup file first'
      });
      return;
    }

    // Show confirmation modal before restore
    openModal(
      'delete',
      'Confirm Data Restore',
      `Are you absolutely sure you want to restore your data from "${selectedFile.name}"? This will completely replace all current information including user accounts, firearm records, and system settings. This action cannot be undone!`,
      performRestore,
      selectedFile,
      'Yes, Restore My Data',
      'Cancel'
    );
  };

  const performRestore = async (file) => {
    try {
      setLoading(true);
      setLoadingStep(0); // Preparing
      setMessage({ type: '', text: '' });

      // Simulate preparing step
      setTimeout(() => setLoadingStep(1), 500); // Processing

      const formData = new FormData();
      formData.append('backup_file', file);

      const response = await api.post('/api/backup/restore/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000 // 5 minute timeout for restore operations
      });

      // Move to finalizing step
      setLoadingStep(2); // Finalizing

      // Show success modal with detailed information
      openModal(
        'success',
        'Restore Complete',
        `Your data has been successfully restored from "${file.name}". All information has been replaced with the saved data. You may need to refresh the page to see the changes.`,
        null,
        null,
        'OK'
      );

      setSelectedFile(null);
      document.getElementById('restore-file-input').value = '';
      
      // Refresh backup history after successful restore
      setTimeout(() => {
        fetchBackupHistory();
      }, 2000);

    } catch (error) {
      console.error('Error restoring backup:', error);
      
      let errorMessage = 'Failed to restore backup';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Invalid backup file';
        } else if (error.response.status === 403) {
          errorMessage = 'Permission denied. Only administrators and police officers can restore backups.';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.error || 'Server error during restore';
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to restore backup';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Restore operation timed out. Please try again with a smaller backup file.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      openModal(
        'error',
        'Restore Failed',
        errorMessage,
        null,
        null,
        'OK'
      );
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const BackupTab = () => (
    <div className="backup-tab">
      {/* Backup History */}
      <div className="backup-history">
        <div className="section-header">
          <h3>Your Saved Copies</h3>
          <button 
            className="refresh-button"
            onClick={fetchBackupHistory}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>

        <div className="history-list">
          {loading ? (
            <div className="loading-state">
              <RefreshCw className="spinning" />
              <span>Loading your saved copies...</span>
            </div>
          ) : backupHistory.length > 0 ? (
            backupHistory.map((backup, index) => (
              <div key={index} className="history-item">
                <div className="item-icon">
                  <FileCheck />
                </div>
                <div className="item-info">
                  <div className="item-name">{backup.filename}</div>
                  <div className="item-details">
                    <span className="file-size">{backup.file_size_display}</span>
                    <span className="file-date">{formatDate(backup.created_at)}</span>
                    <span className="file-user">{backup.created_by_display}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="action-btn download"
                    onClick={() => handleDownload(backup.id)}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className="action-btn restore"
                    onClick={() => {
                      setSelectedFile({ name: backup.filename, size: backup.file_size });
                      setActiveTab('restore');
                    }}
                    title="Use to restore"
                  >
                    <Upload size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(backup.id, backup.filename)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Archive />
              <h4>No saved copies yet</h4>
              <p>Create your first backup to get started</p>
              <button className="create-button" onClick={handleBackup}>
                <Plus />
                Create First Backup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RestoreTab = () => (
    <div className="restore-tab">
      {/* Warning Section */}
      <div className="warning-section">
        <div className="warning-header">
          <AlertTriangle />
          <h3>Important Warning</h3>
        </div>
        <div className="warning-content">
          <p>Restoring will <strong>completely replace</strong> all your current data including:</p>
          <ul>
            <li>All user accounts and profiles</li>
            <li>Firearm registrations and records</li>
            <li>System settings and configurations</li>
            <li>All uploaded photos and documents</li>
          </ul>
          <p className="warning-note">
            <strong>This action cannot be undone.</strong> We recommend saving your current data first.
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <div className="upload-header">
          <h3>Choose Backup File</h3>
          <p>Select a previously saved file to restore from</p>
        </div>
        
        <div className="file-upload">
          <input
            id="restore-file-input"
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="restore-file-input" className="upload-label">
            <Upload />
            <div className="upload-text">
              <span className="upload-title">Choose File</span>
              <span className="upload-subtitle">or drag and drop here</span>
            </div>
            <div className="upload-hint">
              <Info size={14} />
              <span>Only ZIP files are supported</span>
            </div>
          </label>
        </div>

        {selectedFile && (
          <div className="selected-file">
            <div className="file-info">
              <FileCheck />
              <div className="file-details">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-meta">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>ZIP Archive</span>
                </div>
              </div>
            </div>
            <button 
              className="remove-file"
              onClick={() => {
                setSelectedFile(null);
                document.getElementById('restore-file-input').value = '';
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="restore-actions">
          <button 
            className="restore-button"
            onClick={handleRestore}
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <RefreshCw className="spinning" />
                <span>Restoring...</span>
              </>
            ) : (
              <>
                <Shield />
                <span>Restore Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h4>Helpful Tips</h4>
        <div className="tips-list">
          <div className="tip-item">
            <CheckCircle />
            <span>Make sure you have a recent backup before restoring</span>
          </div>
          <div className="tip-item">
            <CheckCircle />
            <span>Close other applications during restore</span>
          </div>
          <div className="tip-item">
            <CheckCircle />
            <span>Don't interrupt the restore process</span>
          </div>
          <div className="tip-item">
            <CheckCircle />
            <span>Test the system after restore is complete</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="backup-restore-container">
      {/* Enhanced Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <Database />
          </div>
          <div className="header-text">
            <h1>Data Backup & Restore</h1>
            <p>Keep your information safe and secure with automated backups</p>
          </div>
        </div>
        <div className="header-status">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>System Ready</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`status-message ${message.type}`}>
          <div className="message-icon">
            {message.type === 'success' ? (
              <CheckCircle />
            ) : message.type === 'error' ? (
              <AlertCircle />
            ) : (
              <Info />
            )}
          </div>
          <span className="message-text">{message.text}</span>
          <button 
            className="message-close"
            onClick={() => setMessage({ type: '', text: '' })}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card primary">
            <div className="card-icon">
              <Cloud />
            </div>
            <div className="card-content">
              <h3>Save Your Data</h3>
              <p>Create a backup of all your information</p>
              <button 
                className="action-button primary"
                onClick={handleBackup}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="spinning" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Zap />
                    <span>Save Everything</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="action-card secondary">
            <div className="card-icon">
              <Shield />
            </div>
            <div className="card-content">
              <h3>Restore Data</h3>
              <p>Bring back your data from a backup</p>
              <button 
                className="action-button secondary"
                onClick={() => setActiveTab('restore')}
              >
                <Upload />
                <span>Restore Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-icon">
              <Archive />
            </div>
            <div className="stat-info">
              <div className="stat-number">{backupHistory.length}</div>
              <div className="stat-label">Saved Copies</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <HardDrive />
            </div>
            <div className="stat-info">
              <div className="stat-number">
                {backupHistory.length > 0 
                  ? formatFileSize(backupHistory.reduce((sum, backup) => sum + backup.file_size, 0))
                  : '0 MB'
                }
              </div>
              <div className="stat-label">Storage Used</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-info">
              <div className="stat-number">
                {backupHistory.length > 0 
                  ? formatDate(backupHistory[0].created_at).split(',')[0]
                  : 'Never'
                }
              </div>
              <div className="stat-label">Last Saved</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Cloud />
            <span>Manage Backups</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'restore' ? 'active' : ''}`}
            onClick={() => setActiveTab('restore')}
          >
            <Shield />
            <span>Restore Data</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'backup' && <BackupTab />}
          {activeTab === 'restore' && <RestoreTab />}
        </div>
      </div>

      {/* Modal Component */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className={`modal-icon ${modal.type}`}>
                {modal.type === 'delete' && <AlertTriangle size={24} />}
                {modal.type === 'success' && <CheckCircle size={24} />}
                {modal.type === 'error' && <AlertCircle size={24} />}
                {modal.type === 'info' && <Info size={24} />}
              </div>
              <h3 className="modal-title">{modal.title}</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-message">{modal.message}</p>
            </div>
            
            <div className="modal-footer">
              {modal.type === 'delete' && (
                <button className="modal-btn cancel" onClick={closeModal}>
                  {modal.cancelText}
                </button>
              )}
              <button 
                className={`modal-btn ${modal.type === 'delete' ? 'danger' : modal.type === 'success' ? 'success' : 'primary'}`}
                onClick={handleModalConfirm}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner-large">
              <RefreshCw className="spinning" />
            </div>
            <div className="loading-text">
              <h3>Processing Your Request</h3>
              <p>Please wait while we process your data...</p>
            </div>
            <div className="loading-steps">
              <div className={`loading-step ${loadingStep >= 0 ? 'active' : ''}`}>
                <div className="step-dot"></div>
                <span>Preparing</span>
              </div>
              <div className={`loading-step ${loadingStep >= 1 ? 'active' : ''}`}>
                <div className="step-dot"></div>
                <span>Processing</span>
              </div>
              <div className={`loading-step ${loadingStep >= 2 ? 'active' : ''}`}>
                <div className="step-dot"></div>
                <span>Finalizing</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestore;
