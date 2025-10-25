import { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  User,
  Barcode,
  Crosshair,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  Check,
  X,
  Image,
  MoreVertical,
  Eye,
  Maximize2,
  Mail,
  Printer,
  ChevronsUpDown,
  Download,
  Upload
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/FirearmLicenseManagement.css';
import api from '../api/api';
import eventBus from '../utils/eventBus';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const FirearmLicenseManagement = () => {
  const [licenses, setLicenses] = useState([]);
  const [filteredLicenses, setFilteredLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const licensesPerPage = 10;
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    license: null,
  });

  const handleViewLicense = (license) => {
    setViewModal({
      isOpen: true,
      license: license,
    });
  };

  const handleCloseModal = () => {
    setViewModal({
      isOpen: false,
      license: null,
    });
  };

  const API_TIMEOUT = 10000;

  const fetchLicenses = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (expiryFilter !== 'all') params.append('expiry', expiryFilter);
      if (dateFromFilter) params.append('date_from', dateFromFilter);
      if (dateToFilter) params.append('date_to', dateToFilter);

      const response = await axios.get(`${API_BASE_URL}firearm-licenses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params,
        signal: controller.signal,
      });

      // Validate response structure
      if (
        !response.data ||
        !response.data.success ||
        !Array.isArray(response.data.results)
      ) {
        throw new Error('Invalid data format received from server');
      }

      // Process the license data
      const processedLicenses = response.data.results.map((license) => ({
        ...license,
        // Ensure owner object exists
        owner: license.owner || {},
        // Format dates for consistent display
        date_issued: license.date_issued
          ? new Date(license.date_issued).toISOString().split('T')[0]
          : '',
        expiry_date: license.expiry_date
          ? new Date(license.expiry_date).toISOString().split('T')[0]
          : '',
        // Ensure photo URL is properly formatted
        photo_url: license.photo_url || null,
      }));

      // Sort by ID in descending order (Last In First Out)
      const sortedLicenses = processedLicenses.sort((a, b) => b.id - a.id);

      setLicenses(sortedLicenses);
      setFilteredLicenses(sortedLicenses);
    } catch (err) {
      handleFetchError(err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleFetchError = (err) => {
    let errorMessage = 'Failed to fetch licenses';
    let shouldLogout = false;
    let errorDetails = null;

    if (err.name === 'AbortError') {
      errorMessage = 'Request timed out. Please try again.';
    } else if (err.response) {
      // Handle structured error responses from backend
      if (err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
        errorDetails = err.response.data.details;
      } else {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid request data';
            if (err.response.data.errors) {
              errorDetails = Object.entries(err.response.data.errors)
                .map(
                  ([field, errors]) =>
                    `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
                )
                .join('; ');
            }
            break;
          case 401:
            errorMessage = 'Session expired. Please log in again.';
            shouldLogout = true;
            break;
          case 403:
            errorMessage = "You don't have permission to view licenses";
            break;
          case 404:
            errorMessage = 'License data not found';
            break;
          case 500:
            errorMessage = 'Server error occurred';
            break;
          default:
            errorMessage = `Server error: ${err.response.status}`;
        }
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    setError(errorMessage);
    console.error('Fetch error:', err, errorDetails);

    // Show error notification
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: `
      <div style="text-align: left;">
        <p>${errorMessage}</p>
        ${errorDetails ? `<p><small>${errorDetails}</small></p>` : ''}
      </div>
    `,
      confirmButtonText: 'OK',
    });

    // Handle logout if needed
    if (shouldLogout) {
      localStorage.removeItem('access_token');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
  };

  const applyFilters = (data) => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((license) => {
        // Check all searchable fields
        const searchFields = [
          license.control_number,
          license.license_number,
          license.serial_number,
          license.owner?.first_name,
          license.owner?.last_name,
          license.owner?.email,
          license.kind,
          license.make,
          license.model,
          license.caliber,
        ]
          .filter(Boolean)
          .map((f) => f.toString().toLowerCase());

        return searchFields.some((field) => field.includes(term));
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((license) => license.status === statusFilter);
    }

    // Apply expiry filter
    if (expiryFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((license) => {
        if (!license.expiry_date) return false;

        const expiryDate = new Date(license.expiry_date);
        switch (expiryFilter) {
          case 'expired':
            return expiryDate < today;
          case 'active':
            return expiryDate >= today;
          case 'expiring':
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return expiryDate >= today && expiryDate <= nextMonth;
          default:
            return true;
        }
      });
    }

    // Apply date range filter
    if (dateFromFilter || dateToFilter) {
      filtered = filtered.filter((license) => {
        if (!license.date_issued) return false;

        const issueDate = new Date(license.date_issued);
        issueDate.setHours(0, 0, 0, 0);

        let matchesFrom = true;
        let matchesTo = true;

        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          matchesFrom = issueDate >= fromDate;
        }

        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesTo = issueDate <= toDate;
        }

        return matchesFrom && matchesTo;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredLicenses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDeleteLicense = async (licenseId) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      html: `<div style="text-align: left;">
            <p>Are you sure you want to delete this license?</p>
            <p><strong>This action cannot be undone.</strong></p>
          </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Authentication required');

      // Show loading state
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait while we remove the license',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Optimistic update
      setLicenses((prev) => prev.filter((license) => license.id !== licenseId));
      setFilteredLicenses((prev) =>
        prev.filter((license) => license.id !== licenseId)
      );

      await axios.delete(`${API_BASE_URL}firearm-licenses/${licenseId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000, // 8 second timeout
      });

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'License was successfully removed.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Delete error:', error);

      // Revert optimistic update if failed
      fetchLicenses();

      let errorMsg = 'Failed to delete license';
      if (error.response) {
        if (error.response.status === 404) {
          errorMsg = 'License not found (already deleted?)';
        } else if (error.response.status === 403) {
          errorMsg = "You don't have permission to delete licenses";
        } else {
          errorMsg = `Server error: ${error.response.status}`;
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  };

  const calculateDaysRemaining = (expiryDate, status) => {
    if (!expiryDate || status === 'revoked') return 'N/A';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  // Memoized date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge component
  const StatusBadge = ({ status, expiryDate }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);

    // Determine the effective status
    let effectiveStatus = status;
    if (expiry < today) {
        effectiveStatus = 'expired';
    }

    if (effectiveStatus === 'expired') {
        return <span className="badge badge-expired">Expired</span>;
    }

    // Only active status remains
    return <span className="badge badge-active">Active</span>;
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle select all licenses
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLicenses(currentLicenses.map(license => license.id));
    } else {
      setSelectedLicenses([]);
    }
  };

  // Handle select individual license
  const handleSelectLicense = (licenseId) => {
    if (selectedLicenses.includes(licenseId)) {
      setSelectedLicenses(selectedLicenses.filter(id => id !== licenseId));
    } else {
      setSelectedLicenses([...selectedLicenses, licenseId]);
    }
  };

  // Pagination controls
  const Pagination = ({ currentPage, totalPages, paginate }) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flm-pagination">
        <div className="flm-pagination-info">
          Showing {indexOfFirstLicense + 1} to {Math.min(indexOfLastLicense, filteredLicenses.length)} of {filteredLicenses.length} entries
        </div>
        <div className="flm-pagination-container">
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="flm-pagination-button"
          >
            «
          </button>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="flm-pagination-button"
          >
            ‹
          </button>

          {startPage > 1 && (
            <>
              <button onClick={() => paginate(1)} className="flm-pagination-button">
                1
              </button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`flm-pagination-button ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                onClick={() => paginate(totalPages)}
                className="flm-pagination-button"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flm-pagination-button"
          >
            ›
          </button>
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="flm-pagination-button"
          >
            »
          </button>
        </div>
      </div>
    );
  };

  // In your component's useEffect
  useEffect(() => {
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        await fetchLicenses();
      } catch (err) {
        console.error('Initial load error:', err);
      }
    };

    loadData();

    return () => {
      abortController.abort();
    };
  }, []);

  // Filter effect
  useEffect(() => {
    if (licenses.length > 0) {
      applyFilters(licenses);
    }
  }, [searchTerm, statusFilter, expiryFilter, dateFromFilter, dateToFilter, licenses, sortConfig]);

  // Listen for user archive/restore events to refresh licenses
  useEffect(() => {
    const handleUserArchived = () => {
      console.log('User archived - refreshing licenses...');
      fetchLicenses();
    };

    const handleUserRestored = () => {
      console.log('User restored - refreshing licenses...');
      fetchLicenses();
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

  const indexOfLastLicense = currentPage * licensesPerPage;
  const indexOfFirstLicense = indexOfLastLicense - licensesPerPage;
  const currentLicenses = filteredLicenses.slice(
    indexOfFirstLicense,
    indexOfLastLicense
  );
  const totalPages = Math.ceil(filteredLicenses.length / licensesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flm-container">
      {/* Header */}
      <div className="flm-header">
        <div className="flm-header-title">
          <ShieldCheck size={28} className="flm-header-icon" />
          <h2>Firearm License Management</h2>
        </div>
        <div className="flm-header-actions">
          <button
            className="flm-btn flm-btn-secondary"
            onClick={fetchLicenses}
            title="Refresh"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="flm-btn flm-btn-primary">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="flm-status-cards">
        <div className="flm-status-card">
          <div className="flm-status-card-header">
            <span className="flm-status-card-title">Total Licenses</span>
            <span className="flm-status-card-count">{licenses.length}</span>
          </div>
        </div>
        <div className="flm-status-card">
          <div className="flm-status-card-header">
            <span className="flm-status-card-title">Active</span>
            <span className="flm-status-card-count">
              {licenses.filter((l) => l.status === 'active').length}
            </span>
          </div>
          <span className="flm-status-card-badge flm-badge-active">Active</span>
        </div>
        <div className="flm-status-card">
          <div className="flm-status-card-header">
            <span className="flm-status-card-title">Expired</span>
            <span className="flm-status-card-count">
              {
                licenses.filter((l) => {
                  if (!l.expiry_date) return false;
                  const today = new Date();
                  const expiry = new Date(l.expiry_date);
                  return expiry < today;
                }).length
              }
            </span>
          </div>
          <span className="flm-status-card-badge flm-badge-expired">
            Expired
          </span>
        </div>
        <div className="flm-status-card">
          <div className="flm-status-card-header">
            <span className="flm-status-card-title">Selected</span>
            <span className="flm-status-card-count">{selectedLicenses.length}</span>
          </div>
          <span className="flm-status-card-badge flm-badge-pending">Selected</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flm-controls">
        <div className="flm-search">
          <Search className="flm-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search licenses by owner, control no, license no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flm-filter-container">
          <button
            className="flm-filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span>Filters</span>
            <ChevronDown
              size={16}
              className={`flm-filter-chevron ${showFilters ? 'open' : ''}`}
            />
          </button>

          {showFilters && (
            <div className="flm-filter-dropdown">
              <div className="flm-filter-section">
                <h4>
                  <ShieldCheck size={16} /> Status
                </h4>
                <div className="flm-filter-options">
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="statusFilter"
                        value="all"
                        checked={statusFilter === 'all'}
                        onChange={() => setStatusFilter('all')}
                      />
                      <span>All Statuses</span>
                    </label>
                  </div>
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="statusFilter"
                        value="active"
                        checked={statusFilter === 'active'}
                        onChange={() => setStatusFilter('active')}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="statusFilter"
                        value="expired"
                        checked={statusFilter === 'expired'}
                        onChange={() => setStatusFilter('expired')}
                      />
                      <span>Expired</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flm-filter-section">
                <h4>
                  <Clock size={16} /> Expiry
                </h4>
                <div className="flm-filter-options">
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="expiryFilter"
                        value="all"
                        checked={expiryFilter === 'all'}
                        onChange={() => setExpiryFilter('all')}
                      />
                      <span>All</span>
                    </label>
                  </div>
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="expiryFilter"
                        value="active"
                        checked={expiryFilter === 'active'}
                        onChange={() => setExpiryFilter('active')}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="expiryFilter"
                        value="expiring"
                        checked={expiryFilter === 'expiring'}
                        onChange={() => setExpiryFilter('expiring')}
                      />
                      <span>Expiring Soon</span>
                    </label>
                  </div>
                  <div className="flm-filter-option">
                    <label>
                      <input
                        type="radio"
                        name="expiryFilter"
                        value="expired"
                        checked={expiryFilter === 'expired'}
                        onChange={() => setExpiryFilter('expired')}
                      />
                      <span>Expired</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flm-filter-section">
                <h4>
                  <Calendar size={16} /> Date Range
                </h4>
                <div className="flm-date-range-filters">
                  <div className="flm-date-input-group">
                    <label className="flm-date-label">From:</label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="flm-date-input"
                    />
                  </div>
                  <div className="flm-date-input-group">
                    <label className="flm-date-label">To:</label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="flm-date-input"
                    />
                  </div>
                  {(dateFromFilter || dateToFilter) && (
                    <button
                      className="flm-clear-date-btn"
                      onClick={() => {
                        setDateFromFilter('');
                        setDateToFilter('');
                      }}
                    >
                      <X size={14} />
                      Clear Dates
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flm-loading">
          <Loader2 size={24} className="flm-loading-spinner" />
          <span>Loading licenses...</span>
        </div>
      )}

      {error && (
        <div className="flm-error">
          <AlertCircle size={20} className="flm-error-icon" />
          <span className="flm-error-message">{error}</span>
          {error.includes('Session expired') && (
            <button
              onClick={() => (window.location.href = '/login')}
              className="flm-error-action"
            >
              Go to Login
            </button>
          )}
          <button onClick={() => setError(null)} className="flm-error-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* License Table */}
      {!loading && !error && (
        <>
          <div className="flm-table-container">
            <table className="flm-table">
              <thead>
                <tr>
                  <th className="flm-table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLicenses.length === currentLicenses.length && currentLicenses.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => handleSort('license_number')}>
                    <div className="flm-table-header">
                      License Number
                      <ChevronsUpDown size={14} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('control_number')}>
                    <div className="flm-table-header">
                      Control Number
                      <ChevronsUpDown size={14} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('owner.first_name')}>
                    <div className="flm-table-header">
                      Owner
                      <ChevronsUpDown size={14} />
                    </div>
                  </th>
                  <th>Firearm Details</th>
                  <th onClick={() => handleSort('date_issued')}>
                    <div className="flm-table-header">
                      Date Issued
                      <ChevronsUpDown size={14} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('expiry_date')}>
                    <div className="flm-table-header">
                      Expiry Date
                      <ChevronsUpDown size={14} />
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLicenses.length > 0 ? (
                  currentLicenses.map((license) => (
                    <tr key={license.id} className={selectedLicenses.includes(license.id) ? 'selected' : ''}>
                      <td className="flm-table-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedLicenses.includes(license.id)}
                          onChange={() => handleSelectLicense(license.id)}
                        />
                      </td>
                      <td>
                        <div className="flm-table-cell-primary">{license.license_number}</div>
                      </td>
                      <td>{license.control_number}</td>
                      <td>
                        <div className="flm-owner-cell">
                          <div className="flm-owner-avatar">
                            {license.owner?.first_name?.charAt(0)}
                            {license.owner?.last_name?.charAt(0)}
                          </div>
                          <div className="flm-owner-info">
                            <div className="flm-owner-name">
                              {license.owner?.first_name} {license.owner?.last_name}
                            </div>
                            {license.owner?.email && (
                              <div className="flm-owner-email">
                                {license.owner.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flm-firearm-details">
                          <div>{license.kind} / {license.make}</div>
                          <div className="flm-firearm-model">{license.model} / {license.caliber}</div>
                          <div className="flm-serial-number">SN: {license.serial_number}</div>
                        </div>
                      </td>
                      <td>{formatDate(license.date_issued)}</td>
                      <td>
                        <div className="flm-expiry-cell">
                          {formatDate(license.expiry_date)}
                          <div className="flm-days-remaining">
                            {calculateDaysRemaining(license.expiry_date, license.status)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge
                          status={license.status}
                          expiryDate={license.expiry_date}
                        />
                      </td>
                      <td>
                        <div className="flm-action-buttons">
                          <button
                            className="flm-action-btn flm-view-btn"
                            title="View License"
                            onClick={() => handleViewLicense(license)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="flm-action-btn flm-delete-btn"
                            title="Delete"
                            onClick={() => handleDeleteLicense(license.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="flm-no-results">
                      <div className="flm-no-results-content">
                        <AlertCircle size={48} />
                        <p>No licenses found matching your criteria</p>
                        <button 
                          className="flm-btn flm-btn-secondary"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setExpiryFilter('all');
                            setDateFromFilter('');
                            setDateToFilter('');
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLicenses.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
            />
          )}
        </>
      )}

      {/* License View Modal */}
      {viewModal.isOpen && viewModal.license && (
        <div className="flm-modal-overlay">
          <div className="flm-modal-content">
            {/* Header */}
            <div className="flm-modal-header">
              <div className="flm-modal-title">
                <ShieldCheck size={24} className="flm-modal-icon" />
                <h3>Firearm License Details</h3>
                <div className="flm-license-number-badge">
                  {viewModal.license.license_number}
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="flm-modal-close"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flm-modal-body">
              {/* Top Section - Photo and Status */}
              <div className="flm-modal-top-section">
                {/* Photo Section */}
                <div className="flm-license-photo-section">
                  {viewModal.license.photo_url ? (
                    <div className="flm-photo-container">
                      <img
                        src={viewModal.license.photo_url}
                        alt={`License ${viewModal.license.license_number}`}
                        className="flm-license-photo"
                        onClick={() =>
                          window.open(viewModal.license.photo_url, '_blank')
                        }
                      />
                      <button
                        className="flm-view-full-btn"
                        onClick={() =>
                          window.open(viewModal.license.photo_url, '_blank')
                        }
                      >
                        <Maximize2 size={16} /> View Full Size
                      </button>
                    </div>
                  ) : (
                    <div className="flm-no-photo-placeholder">
                      <Image size={48} />
                      <span>No photo available</span>
                    </div>
                  )}
                </div>

                {/* Status Section */}
                <div className="flm-license-status-section">
                  <div className="flm-status-header">
                    <h4>License Status</h4>
                    <StatusBadge
                      status={viewModal.license.status}
                      expiryDate={viewModal.license.expiry_date}
                      large
                    />
                  </div>

                  <div className="flm-status-details-grid">
                    <div className="flm-status-detail">
                      <span className="flm-detail-label">
                        <Calendar size={16} /> Issued:
                      </span>
                      <span className="flm-detail-value">
                        {formatDate(viewModal.license.date_issued)}
                      </span>
                    </div>

                    <div className="flm-status-detail">
                      <span className="flm-detail-label">
                        <Clock size={16} /> Expires:
                      </span>
                      <span className="flm-detail-value">
                        {formatDate(viewModal.license.expiry_date)}
                      </span>
                    </div>

                    <div className="flm-status-detail">
                      <span className="flm-detail-label">
                        <AlertCircle size={16} /> Status:
                      </span>
                      <span className="flm-detail-value">
                        {calculateDaysRemaining(
                          viewModal.license.expiry_date,
                          viewModal.license.status
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Details */}
              <div className="flm-license-details-section">
                <h4 className="flm-section-title">License Information</h4>

                <div className="flm-details-grid">
                  {/* Column 1 */}
                  <div className="flm-details-column">
                    <div className="flm-detail-item">
                      <span className="flm-detail-label">Control Number:</span>
                      <span className="flm-detail-value">
                        {viewModal.license.control_number}
                      </span>
                    </div>

                    <div className="flm-detail-item">
                      <span className="flm-detail-label">Owner:</span>
                      <div className="flm-owner-details">
                        <span className="flm-owner-name">
                          {viewModal.license.owner?.first_name}{' '}
                          {viewModal.license.owner?.last_name}
                        </span>
                        {viewModal.license.owner?.email && (
                          <span className="flm-owner-email">
                            <Mail size={14} /> {viewModal.license.owner.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="flm-details-column">
                    <div className="flm-detail-item">
                      <span className="flm-detail-label">Firearm Type:</span>
                      <span className="flm-detail-value">
                        {viewModal.license.kind || 'N/A'}
                      </span>
                    </div>

                    <div className="flm-detail-item">
                      <span className="flm-detail-label">Make/Model:</span>
                      <span className="flm-detail-value">
                        {viewModal.license.make || 'N/A'}{' '}
                        {viewModal.license.model || ''}
                      </span>
                    </div>

                    <div className="flm-detail-item">
                      <span className="flm-detail-label">Caliber:</span>
                      <span className="flm-detail-value">
                        {viewModal.license.caliber || 'N/A'}
                      </span>
                    </div>

                    <div className="flm-detail-item">
                      <span className="flm-detail-label">Serial Number:</span>
                      <span className="flm-detail-value flm-serial-number">
                        {viewModal.license.serial_number}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {viewModal.license.notes && (
                <div className="flm-notes-section">
                  <h4 className="flm-section-title">Additional Notes</h4>
                  <div className="flm-notes-content">
                    {viewModal.license.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flm-modal-footer">
              <button
                onClick={handleCloseModal}
                className="flm-btn flm-btn-secondary"
              >
                Close
              </button>
              <div className="flm-footer-actions">
                <button
                  onClick={() => handlePrintLicense(viewModal.license)}
                  className="flm-btn flm-btn-primary"
                >
                  <Printer size={16} /> Print License
                </button>
                {/* <button
                  onClick={() => handleEditLicense(viewModal.license)}
                  className="flm-btn flm-btn-edit"
                >
                  <Edit size={16} /> Edit
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirearmLicenseManagement;