// AuditLogs.jsx
import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  FileText,
  Shield,
  Crosshair,
  Edit,
  Trash2,
  UserPlus,
  UserCheck,
  Eye,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import '../styles/AuditLogs.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const logsPerPage = 10;

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // Get authorization headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, userFilter, actionFilter, dateFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        setError('Please log in to view audit logs');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}audit-logs/`, {
        headers: getAuthHeaders()
      });

      // Handle both response formats (array or object with results)
      const logsData = response.data.results || response.data;
      setLogs(logsData);
      
      // Extract unique actions from logs
      const uniqueActions = [...new Set(logsData.map(log => log.action))];
      setActions(uniqueActions);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Permission denied. Only administrators can view audit logs.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to load audit logs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}users/`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        (log.user?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (log.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user?.id === parseInt(userFilter));
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === dateFilter;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUserFilter('all');
    setActionFilter('all');
    setDateFilter('');
    setShowFilters(false);
  };

  const getActionIcon = (action) => {
    const actionIcons = {
      login: <UserCheck size={16} />,
      logout: <UserCheck size={16} />,
      login_failed: <AlertCircle size={16} />,
      login_error: <AlertCircle size={16} />,
      create: <UserPlus size={16} />,
      update: <Edit size={16} />,
      delete: <Trash2 size={16} />,
      view: <Eye size={16} />,
      register: <FileText size={16} />,
      firearm_add: <Crosshair size={16} />,
      firearm_edit: <Crosshair size={16} />,
      firearm_delete: <Crosshair size={16} />,
      license_register: <Shield size={16} />,
      license_update: <Shield size={16} />,
      test: <FileText size={16} />
    };

    return actionIcons[action] || <FileText size={16} />;
  };

  const getActionColor = (action) => {
    const actionColors = {
      login: 'success',
      logout: 'info',
      login_failed: 'danger',
      login_error: 'danger',
      create: 'success',
      update: 'warning',
      delete: 'danger',
      view: 'info',
      register: 'success',
      firearm_add: 'success',
      firearm_edit: 'warning',
      firearm_delete: 'danger',
      license_register: 'success',
      license_update: 'warning',
      test: 'info'
    };

    return actionColors[action] || 'info';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseModule = (action, details) => {
    // Extract module from action or details
    if (action.includes('firearm')) return 'Firearms';
    if (action.includes('license')) return 'Licenses';
    if (action.includes('login') || action.includes('logout')) return 'Authentication';
    if (action === 'view' && details.includes('audit logs')) return 'Audit Logs';
    if (action === 'create' || action === 'update' || action === 'delete') {
      if (details.toLowerCase().includes('user')) return 'Users';
      if (details.toLowerCase().includes('firearm')) return 'Firearms';
      if (details.toLowerCase().includes('license')) return 'Licenses';
    }
    return 'System';
  };

  const getModuleColor = (module) => {
    const moduleColors = {
      'Firearms': 'firearms',
      'Licenses': 'licenses',
      'Authentication': 'authentication',
      'Audit Logs': 'audit',
      'Users': 'users',
      'System': 'system'
    };
    return moduleColors[module] || 'system';
  };

  const openLogDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Timestamp', 'User', 'Action', 'Module', 'Details'],
      ...filteredLogs.map(log => [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.user?.username || 'System',
        log.action,
        parseModule(log.action, log.details),
        log.details
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    // Log CSV export as an audit action
    const token = getAuthToken();
    if (token) {
      axios.post(`${API_BASE_URL}audit-logs/create/`, {
        action: 'view',
        details: 'Exported audit logs as CSV'
      }, { headers: getAuthHeaders() }).catch(() => {});
    }
  };

  const refreshLogs = () => {
    fetchLogs();
  };

  if (loading) {
    return (
      <div className="audit-logs-loading">
        <Loader2 size={32} className="animate-spin" />
        <span>Loading audit logs...</span>
      </div>
    );
  }

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <div className="audit-logs-title-section">
          <h2>
            <FileText size={28} className="header-icon" />
            Audit Logs
          </h2>
          <p>Track and monitor all user activities within the system</p>
        </div>

        <div className="audit-logs-actions">
          <button className="refresh-btn" onClick={refreshLogs} title="Refresh logs">
            <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="export-btn" onClick={exportLogs} disabled={filteredLogs.length === 0}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-error">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="audit-logs-controls">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search logs by user, action, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={16} className={`chevron ${showFilters ? 'open' : ''}`} />
          </button>

          {(searchTerm || userFilter !== 'all' || actionFilter !== 'all' || dateFilter) && (
            <button className="clear-filters" onClick={clearFilters}>
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>User</label>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Action</label>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="audit-logs-stats">
        <div className="stat-card">
          <div className="stat-value">{filteredLogs.length}</div>
          <div className="stat-label">Total Logs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{[...new Set(filteredLogs.map(log => log.user?.id))].length}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{actions.length}</div>
          <div className="stat-label">Action Types</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {filteredLogs.filter(log => log.action === 'login').length}
          </div>
          <div className="stat-label">Successful Logins</div>
        </div>
      </div>

      <div className="audit-logs-table-container">
        <table className="audit-logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <tr key={log.id} className="log-row">
                  <td>
                    <span className="log-id">#{log.id}</span>
                  </td>
                  <td>
                    <div className="timestamp-cell">
                      <Clock size={14} />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <User size={14} />
                      <div>
                        <div className="username">{log.user?.username || 'System'}</div>
                        <div className="user-role">{log.user?.role || 'System'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`action-badge ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`module-badge ${getModuleColor(parseModule(log.action, log.details))}`}>
                      {parseModule(log.action, log.details)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-details-btn" 
                      onClick={() => openLogDetails(log)}
                      title="View full details"
                    >
                      <Eye size={16} />
                      Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-logs">
                  {searchTerm || userFilter !== 'all' || actionFilter !== 'all' || dateFilter
                    ? 'No logs match your filters'
                    : 'No audit logs found'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredLogs.length > 0 && (
        <div className="audit-logs-pagination">
          <div className="pagination-info">
            Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FileText size={24} />
                Audit Log Details
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-detail-group">
                <label>Log ID</label>
                <div className="modal-detail-value">#{selectedLog.id}</div>
              </div>
              
              <div className="modal-detail-group">
                <label>Timestamp</label>
                <div className="modal-detail-value">
                  <Clock size={16} />
                  {formatTimestamp(selectedLog.timestamp)}
                </div>
              </div>
              
              <div className="modal-detail-group">
                <label>User</label>
                <div className="modal-detail-value">
                  <User size={16} />
                  <div>
                    <div className="modal-username">{selectedLog.user?.username || 'System'}</div>
                    <div className="modal-user-email">{selectedLog.user?.email || 'N/A'}</div>
                    <div className="modal-user-role">{selectedLog.user?.role || 'System'}</div>
                  </div>
                </div>
              </div>
              
              <div className="modal-detail-group">
                <label>Action</label>
                <div className="modal-detail-value">
                  <span className={`action-badge ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)}
                    {selectedLog.action.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="modal-detail-group">
                <label>Module</label>
                <div className="modal-detail-value">
                  <span className={`module-badge large ${getModuleColor(parseModule(selectedLog.action, selectedLog.details))}`}>
                    {parseModule(selectedLog.action, selectedLog.details)}
                  </span>
                </div>
              </div>
              
              <div className="modal-detail-group">
                <label>Full Details</label>
                <div className="modal-detail-value details-box">
                  {selectedLog.details}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;