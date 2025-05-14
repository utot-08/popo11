import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import {
  User,
  Shield,
  Phone,
  Home,
  FileText,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  ShieldAlert,
  Target,
  Calendar,
  BadgeCheck,
  FileSearch,
  Fingerprint,
  ArrowRight,
  Check,
  X,
  Edit,
  Barcode,
  MapPin,
  Clock,
  Bomb,
  CircleDot,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import '../styles/AddOwner.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const AddOwner = () => {
  const [newOwner, setNewOwner] = useState({
    full_legal_name: '',
    contact_number: '',
    license_status: 'active',
    registration_date: '',
    age: 0,
    residential_address: '',
  });

  const [firearm, setFirearm] = useState({
    serial_number: '',
    gun_model: '',
    gun_type: 'handgun',
    ammunition_type: '',
    firearm_status: 'deposit',
    date_of_collection: '',
    registration_location: '',
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [networkErrorDetails, setNetworkErrorDetails] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch users with role "client"
  // const searchUsers = async () => {
  //   if (!searchTerm.trim()) return;

  //   setIsSearching(true);
  //   setSearchError('');

  //   try {
  //     const response = await axios.get(`${API_BASE_URL}users/?search=${searchTerm}&role=client`);
  //     setSearchResults(response.data);
  //     console.log(response.data)
  //     if (response.data.length === 0) {
  //       setSearchError('No clients found with that name');
  //     }
  //   } catch (error) {
  //     console.error('Search error:', error);
  //     setSearchError('Failed to search users. Please try again.');
  //     setSearchResults([]);
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };
  const debouncedSearch = debounce(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}users/?search=${searchTerm}&role=client`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 1000); // 300ms delay

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      setIsSearching(true);
      debouncedSearch(term);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };
  // Populate form fields when a user is selected
  const selectUser = (user) => {
    setNewOwner((prev) => ({
      ...prev,
      full_legal_name: user.first_name + ' ' + user.last_name || '',
      contact_number: user.phone_number || '',
      age: getAge(user.date_of_birth) || '',
      residential_address: user.address || '',
    }));
    setSearchResults([]);
    setSearchTerm(user.full_name || '');
  };

  // Helper functions
  const getLicenseStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <ShieldCheck size={18} className="icon-active" />;
      case 'revoked':
        return <ShieldOff size={18} className="icon-revoked" />;
      case 'suspended':
        return <ShieldAlert size={18} className="icon-suspended" />;
      case 'pending':
        return <ShieldQuestion size={18} className="icon-pending" />;
      default:
        return <Shield size={18} />;
    }
  };

  const getFirearmStatusIcon = (status) => {
    switch (status) {
      case 'confiscated':
        return <ShieldAlert size={18} className="icon-suspended" />;
      case 'surrendered':
        return <ShieldOff size={18} className="icon-revoked" />;
      case 'deposit':
        return <ShieldCheck size={18} className="icon-active" />;
      case 'abandoned':
        return <ShieldQuestion size={18} className="icon-pending" />;
      default:
        return <Shield size={18} />;
    }
  };
  /**
   * Calculates the fucking age from a date of birth
   * @param {string|Date} dateOfBirth - The date of birth (YYYY-MM-DD, MM/DD/YYYY, or Date object)
   * @returns {string} - The age in years or 'N/A' if invalid
   */
  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';

    try {
      // Parse the date (handles both string formats and Date objects)
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) return 'N/A'; // Invalid date check

      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return age >= 0 ? age.toString() : 'N/A';
    } catch (error) {
      console.error('Failed to calculate fucking age:', error);
      return 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setNewOwner((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFirearmChange = (e) => {
    const { name, value } = e.target;
    setFirearm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Owner validation
    if (!newOwner.full_legal_name.trim()) {
      errors.full_legal_name = 'Full name is required';
      isValid = false;
    }

    if (!newOwner.contact_number.trim()) {
      errors.contact_number = 'Contact number is required';
      isValid = false;
    }

    if (!newOwner.registration_date) {
      errors.registration_date = 'Registration date is required';
      isValid = false;
    }

    if (!newOwner.age) {
      errors.age = 'Age is required';
      isValid = false;
    } else if (parseInt(newOwner.age) < 18) {
      errors.age = 'Must be at least 18 years old';
      isValid = false;
    }

    if (!newOwner.residential_address.trim()) {
      errors.residential_address = 'Address is required';
      isValid = false;
    }

    // Firearm validation
    if (!firearm.serial_number.trim()) {
      errors.serial_number = 'Serial number is required';
      isValid = false;
    }

    if (!firearm.gun_model.trim()) {
      errors.gun_model = 'Gun name/model is required';
      isValid = false;
    }

    if (!firearm.ammunition_type.trim()) {
      errors.ammunition_type = 'Ammunition type is required';
      isValid = false;
    }

    if (!firearm.date_of_collection) {
      errors.date_of_collection = 'Date is required';
      isValid = false;
    }

    if (!firearm.registration_location.trim()) {
      errors.registration_location = 'Location is required';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setPreviewMode(true);
    }
  };

  // Combined owner and firearm creation
  const createOwnerWithFirearms = async (ownerData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}owners/`, {
        full_legal_name: ownerData.full_legal_name,
        contact_number: ownerData.contact_number,
        license_status: ownerData.license_status,
        registration_date: ownerData.registration_date,
        age: ownerData.age,
        residential_address: ownerData.residential_address,
        firearms: ownerData.firearms || [], // Include firearms array if it exists
      });
      return response.data;
    } catch (error) {
      console.error('Creation failed:', error.response?.data);
      throw error;
    }
  };

  // Updated handleConfirm function
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    setNetworkErrorDetails('');

    try {
      // Single API call to create owner with firearms
      await createOwnerWithFirearms({
        ...newOwner,
        firearms: [firearm], // Wrap single firearm in array
      });

      // Success handling
      function showAlert(message) {
  const alertEl = document.createElement('div');
  alertEl.className = 'custom-alert';
  alertEl.textContent = message;
  document.body.appendChild(alertEl);
  // Trigger showing with animation
  setTimeout(() => alertEl.classList.add('show'), 10);
  // Hide and remove after 3.5 seconds
  setTimeout(() => {
    alertEl.classList.remove('show');
    setTimeout(() => document.body.removeChild(alertEl), 400);
  }, 3500);
}
// Usage
showAlert('Owner and firearms created successfully!');

      // Reset form
      setNewOwner({
        full_legal_name: '',
        contact_number: '',
        license_status: 'active',
        registration_date: '',
        age: '',
        residential_address: '',
      });

      setFirearm({
        serial_number: '',
        gun_model: '',
        gun_type: 'handgun',
        ammunition_type: '',
        firearm_status: 'deposit',
        date_of_collection: '',
        registration_location: '',
      });

      setPreviewMode(false);
      setSubmitSuccess(true);
      setSearchTerm('');
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed';
      let errorDetails = '';

      if (error.response) {
        // Handle validation errors from the backend
        if (error.response.data) {
          errorMessage = 'Please correct the following errors:';

          // Format Django REST framework validation errors
          if (typeof error.response.data === 'object') {
            for (const [field, errors] of Object.entries(error.response.data)) {
              // Handle nested firearm errors
              if (field === 'firearms' && Array.isArray(errors)) {
                errors.forEach((firearmError, index) => {
                  if (typeof firearmError === 'object') {
                    for (const [fField, fErrors] of Object.entries(
                      firearmError
                    )) {
                      errorDetails += `Firearm ${index + 1} - ${fField}: ${Array.isArray(fErrors) ? fErrors.join(', ') : fErrors}\n`;
                    }
                  } else {
                    errorDetails += `Firearm ${index + 1}: ${firearmError}\n`;
                  }
                });
              } else {
                errorDetails += `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}\n`;
              }
            }
          } else {
            errorDetails = error.response.data;
          }
        }
      } else if (error.request) {
        errorMessage = 'Network error - could not reach the server';
        errorDetails =
          'Please check your internet connection and ensure the backend server is running.';
      } else {
        errorDetails = error.message;
      }

      setSubmitError(errorMessage);
      setNetworkErrorDetails(errorDetails);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = () => {
    setPreviewMode(false);
  };

  return (
    <div className="dashboard-content">
      <div className="form-header">
        <div className="header-badge">
          <FileSearch size={24} />
          <span>FIREARM REGISTRY SYSTEM</span>
        </div>
        <h2>
          <Fingerprint size={28} className="header-icon" />
          <span>Owner & Firearm Registration</span>
        </h2>
        <p className="form-description">
          Complete all required fields to register new firearm owner and firearm
          details
        </p>
      </div>

      {submitSuccess ? (
        <div className="success-message">
          <Check size={18} />
          <span>Registration submitted successfully!</span>
          <button
            className="add-another-btn"
            onClick={() => setSubmitSuccess(false)}
          >
            Add Another Registration
          </button>
        </div>
      ) : (
        <div className="add-user-form">
          {!previewMode ? (
            <form onSubmit={handleSubmit}>
              <div className="form-section owner-section">
                <div className="section-header">
                  <div className="section-icon-container">
                    <User size={22} className="section-icon" />
                  </div>
                  <h3>Personal Information</h3>
                  <span className="section-badge">Required</span>
                </div>

                <div className="user-search-container">
                  <div className="form-group">
                    <label htmlFor="user-search">
                      <div className="input-icon-container">
                        <Search size={18} className="input-icon" />
                      </div>
                      Search Existing Clients
                    </label>
                    <div className="search-input-container">
                      <input
                        type="text"
                        id="user-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by client name..."
                      />
                      {isSearching && (
                        <Loader2
                          size={18}
                          className="animate-spin search-loading"
                        />
                      )}
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="search-results">
                      <div className="results-header">
                        <span>Matching Clients</span>
                        <span>{searchResults.length} found</span>
                      </div>
                      <div className="results-list">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="result-item"
                            onClick={() => selectUser(user)}
                          >
                           <div className="user-info">
                              <User size={16} />
                              <span>{user.first_name} {user.last_name}</span>
                            </div>
                            <div className="user-details">
                              <span>
                                <Phone size={14} /> {user.phone_number || 'N/A'}
                              </span>
                              <span>
                                Age: {getAge(user.date_of_birth) || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : searchTerm.trim() && !isSearching ? (
                    <div className="search-results empty-results">
                      <div className="results-header">
                        <span>No matching clients found</span>
                      </div>
                      <div className="empty-state">
                        <FileSearch size={24} />
                        <p>No clients match your search</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="full_legal_name">
                      <div className="input-icon-container">
                        <User size={18} className="input-icon" />
                      </div>
                      Full Legal Name
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_legal_name"
                      name="full_legal_name"
                      value={newOwner.full_legal_name}
                      onChange={handleOwnerChange}
                      disabled
                      placeholder="As shown on government ID"
                      className={
                        validationErrors.full_legal_name ? 'error' : ''
                      }
                    />
                    {validationErrors.full_legal_name && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.full_legal_name}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_number">
                      <div className="input-icon-container">
                        <Phone size={18} className="input-icon" />
                      </div>
                      Contact Number
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contact_number"
                      name="contact_number"
                      value={newOwner.contact_number}
                      disabled
                      onChange={handleOwnerChange}
                      placeholder="Phone Number"
                      className={validationErrors.contact_number ? 'error' : ''}
                    />
                    {validationErrors.contact_number && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.contact_number}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="license_status">
                      <div className="input-icon-container">
                        <Shield size={18} className="input-icon" />
                      </div>
                      License Status
                      <span className="required-indicator">*</span>
                    </label>
                    <div className="select-with-icon">
                      {getLicenseStatusIcon(newOwner.license_status)}
                      <select
                        id="license_status"
                        name="license_status"
                        value={newOwner.license_status}
                        onChange={handleOwnerChange}
                      >
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="registration_date">
                      <div className="input-icon-container">
                        <Calendar size={18} className="input-icon" />
                      </div>
                      Registration Date
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="date"
                      id="registration_date"
                      name="registration_date"
                      value={newOwner.registration_date}
                      onChange={handleOwnerChange}
                      className={
                        validationErrors.registration_date ? 'error' : ''
                      }
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {validationErrors.registration_date && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.registration_date}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="age">
                      <div className="input-icon-container">
                        <User size={18} className="input-icon" />
                      </div>
                      Age
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={newOwner.age}
                      onChange={handleOwnerChange}
                      placeholder="age"
                      min="18"
                      max="120"
                      disabled
                      className={validationErrors.age ? 'error' : ''}
                    />
                    {validationErrors.age && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.age}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="residential_address">
                      <div className="input-icon-container">
                        <Home size={18} className="input-icon" />
                      </div>
                      Residential Address
                      <span className="required-indicator">*</span>
                    </label>
                    <textarea
                      id="residential_address"
                      name="residential_address"
                      value={newOwner.residential_address}
                      onChange={handleOwnerChange}
                      placeholder="Full current address including postal code"
                      rows="3"
                      className={
                        validationErrors.residential_address ? 'error' : ''
                      }
                    />
                    {validationErrors.residential_address && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.residential_address}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section firearm-section">
                <div className="section-header">
                  <div className="section-icon-container">
                    <Bomb size={22} className="section-icon" />
                  </div>
                  <h3>Firearm Information</h3>
                  <span className="section-badge">Required</span>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="serial_number">
                      <div className="input-icon-container">
                        <Barcode size={18} className="input-icon" />
                      </div>
                      Serial Number
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      id="serial_number"
                      name="serial_number"
                      value={firearm.serial_number}
                      onChange={handleFirearmChange}
                      placeholder="Unique firearm identifier"
                      className={validationErrors.serial_number ? 'error' : ''}
                    />
                    {validationErrors.serial_number && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.serial_number}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gun_model">
                      <div className="input-icon-container">
                        <Bomb size={18} className="input-icon" />
                      </div>
                      Gun Name/Model
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      id="gun_model"
                      name="gun_model"
                      value={firearm.gun_model}
                      onChange={handleFirearmChange}
                      placeholder="e.g. Glock 19"
                      className={validationErrors.gun_model ? 'error' : ''}
                    />
                    {validationErrors.gun_model && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.gun_model}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gun_type">
                      <div className="input-icon-container">
                        <Bomb size={18} className="input-icon" />
                      </div>
                      Type of Gun
                      <span className="required-indicator">*</span>
                    </label>
                    <select
                      id="gun_type"
                      name="gun_type"
                      value={firearm.gun_type}
                      onChange={handleFirearmChange}
                    >
                      <option value="handgun">Handgun</option>
                      <option value="rifle">Rifle</option>
                      <option value="shotgun">Shotgun</option>
                      <option value="submachine">Submachine Gun</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ammunition_type">
                      <div className="input-icon-container">
                        <CircleDot size={18} className="input-icon" />
                      </div>
                      Ammunition Type
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      id="ammunition_type"
                      name="ammunition_type"
                      value={firearm.ammunition_type}
                      onChange={handleFirearmChange}
                      placeholder="e.g. 9mm, .45 ACP"
                      className={
                        validationErrors.ammunition_type ? 'error' : ''
                      }
                    />
                    {validationErrors.ammunition_type && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.ammunition_type}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="firearm_status"
                      className="flex items-center"
                    >
                      <div className="input-icon-container mr-2">
                        <Shield size={18} className="input-icon" />
                      </div>
                      <span className="flex items-center">
                        Firearm Status
                        <span className="required-indicator text-red-500 ml-1">
                          *
                        </span>
                      </span>
                    </label>

                    <div className="select-with-icon flex items-center mt-2">
                      {getFirearmStatusIcon(firearm.firearm_status)}
                      <select
                        id="firearm_status"
                        name="firearm_status"
                        value={firearm.firearm_status}
                        onChange={handleFirearmChange}
                        className="ml-2 border rounded p-1"
                      >
                        <option value="deposit">Deposit</option>
                        <option value="confiscated">Confiscated</option>
                        <option value="surrendered">Surrendered</option>
                        <option value="abandoned">Abandoned</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date_of_collection">
                      <div className="input-icon-container">
                        <Clock size={18} className="input-icon" />
                      </div>
                      Date of Collection
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_of_collection"
                      name="date_of_collection"
                      value={firearm.date_of_collection}
                      onChange={handleFirearmChange}
                      className={
                        validationErrors.date_of_collection ? 'error' : ''
                      }
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {validationErrors.date_of_collection && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.date_of_collection}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="registration_location">
                      <div className="input-icon-container">
                        <MapPin size={18} className="input-icon" />
                      </div>
                      Registration Location
                      <span className="required-indicator">*</span>
                    </label>
                    <textarea
                      id="registration_location"
                      name="registration_location"
                      value={firearm.registration_location}
                      onChange={handleFirearmChange}
                      placeholder="Where the firearm was registered/acquired"
                      rows="3"
                      className={
                        validationErrors.registration_location ? 'error' : ''
                      }
                    />
                    {validationErrors.registration_location && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.registration_location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="section-footer">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    Review Registration
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="preview-section">
              <div className="preview-header">
                <div className="section-icon-container">
                  <BadgeCheck size={22} className="section-icon" />
                </div>
                <h3>Review Registration Information</h3>
                <span className="section-badge">Preview</span>
              </div>

              <div className="preview-content">
                <div className="preview-subsection">
                  <h4>
                    <User size={18} />
                    Owner Information
                  </h4>
                  <div className="preview-grid">
                    <div className="preview-item">
                      <span className="preview-label">
                        <User size={16} />
                        Full Name:
                      </span>
                      <span className="preview-value">
                        {newOwner.full_legal_name}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Phone size={16} />
                        Contact Number:
                      </span>
                      <span className="preview-value">
                        {newOwner.contact_number}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Shield size={16} />
                        License Status:
                      </span>
                      <span className="preview-value">
                        {getLicenseStatusIcon(newOwner.license_status)}
                        {newOwner.license_status.charAt(0).toUpperCase() +
                          newOwner.license_status.slice(1)}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Calendar size={16} />
                        Registration Date:
                      </span>
                      <span className="preview-value">
                        {formatDate(newOwner.registration_date)}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <User size={16} />
                        Age:
                      </span>
                      <span className="preview-value">{newOwner.age}</span>
                    </div>

                    <div className="preview-item full-width">
                      <span className="preview-label">
                        <Home size={16} />
                        Address:
                      </span>
                      <span className="preview-value">
                        {newOwner.residential_address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="preview-subsection">
                  <h4>
                    <Bomb size={18} />
                    Firearm Information
                  </h4>
                  <div className="preview-grid">
                    <div className="preview-item">
                      <span className="preview-label">
                        <Barcode size={16} />
                        Serial Number:
                      </span>
                      <span className="preview-value">
                        {firearm.serial_number}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Bomb size={16} />
                        Gun Name/Model:
                      </span>
                      <span className="preview-value">{firearm.gun_model}</span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Bomb size={16} />
                        Type of Gun:
                      </span>
                      <span className="preview-value">
                        {firearm.gun_type.charAt(0).toUpperCase() +
                          firearm.gun_type.slice(1)}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <CircleDot size={16} />
                        Ammunition Type:
                      </span>
                      <span className="preview-value">
                        {firearm.ammunition_type}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Shield size={16} />
                        Firearm Status:
                      </span>
                      <span className="preview-value">
                        {getFirearmStatusIcon(firearm.firearm_status)}
                        {firearm.firearm_status.charAt(0).toUpperCase() +
                          firearm.firearm_status.slice(1)}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Clock size={16} />
                        Date of Collection:
                      </span>
                      <span className="preview-value">
                        {formatDate(firearm.date_of_collection)}
                      </span>
                    </div>

                    <div className="preview-item full-width">
                      <span className="preview-label">
                        <MapPin size={16} />
                        Registration Location:
                      </span>
                      <span className="preview-value">
                        {firearm.registration_location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="preview-note">
                  <Target size={20} />
                  <p>
                    This registration will be submitted to the firearms registry
                    database
                  </p>
                </div>
              </div>

              {(submitError || networkErrorDetails) && (
                <div className="error-message detailed-error">
                  <AlertCircle size={18} />
                  <div>
                    <strong>{submitError || 'Registration Error'}</strong>
                    {networkErrorDetails && (
                      <div className="error-details">
                        <pre>{networkErrorDetails}</pre>
                        <div className="troubleshooting-tips">
                          <p>Troubleshooting tips:</p>
                          <ul>
                            <li>
                              Ensure backend server is running (check terminal)
                            </li>
                            <li>Verify API URL is correct: {API_BASE_URL}</li>
                            <li>Check browser console for CORS errors</li>
                            <li>Try refreshing the page</li>
                            <li>
                              Check all required fields are properly filled
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="preview-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleEdit}
                  disabled={isSubmitting}
                >
                  <Edit size={18} />
                  Edit Information
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirm Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddOwner;
