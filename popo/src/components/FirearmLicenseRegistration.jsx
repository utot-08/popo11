import { useState, useEffect } from 'react';
import {
  Search,
  User,
  FileText,
  ShieldCheck,
  Calendar,
  Check,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  Clock,
  Barcode,
  Crosshair,
  Circle,
  Save,
  Image,
} from 'lucide-react';
import axios from 'axios';
import { addYears } from 'date-fns';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import eventBus from '../utils/eventBus';
import '../styles/FirearmLicenseRegistration.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const FirearmLicenseRegistration = () => {
  const location = useLocation();
  const ownerData = location.state?.ownerData;

  // Add state for gun types
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);
  const [filteredSubtypes, setFilteredSubtypes] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);

  // Initialize form data with ownerData if available
  const [formData, setFormData] = useState({
    owner_id: ownerData?.id || null,
    control_number: '',
    license_number: '',
    kind: '',
    kind_id: null, // Add this to store the selected type ID
    make: '',
    make_id: null, // Add this to store the selected subtype ID
    model: '',
    model_id: null, // Add this to store the selected model ID
    caliber: '',
    serial_number: '',
    date_issued: '',
    status: 'active',
    duration: '5',
    expiry_date: '',
    photo: null,
    photo_preview: null,
  });

  // Add state for owner firearms
  const [ownerFirearms, setOwnerFirearms] = useState([]);
  const [selectedFirearm, setSelectedFirearm] = useState(null);
  const [isLoadingFirearms, setIsLoadingFirearms] = useState(false);
  const [allFirearmsLicensed, setAllFirearmsLicensed] = useState(false);

  // Initialize search term and selected owner with ownerData if available
  const [searchTerm, setSearchTerm] = useState(
    ownerData ? ownerData.full_legal_name : ''
  );

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected owner with ownerData if available
  const [selectedOwner, setSelectedOwner] = useState(ownerData || null);

  // Fetch gun data on component mount
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

  // Update filtered subtypes when kind changes
  useEffect(() => {
    if (formData.kind_id) {
      const subs = gunSubtypes.filter((st) => st.typeId === formData.kind_id);
      setFilteredSubtypes(subs);
    } else {
      setFilteredSubtypes([]);
    }
    // Only reset make and model when kind changes manually (not programmatically)
    if (formData.kind_id && !selectedFirearm) {
      setFormData((prev) => ({
        ...prev,
        make: '',
        make_id: null,
        model: '',
        model_id: null,
      }));
    }
  }, [formData.kind_id, gunSubtypes, selectedFirearm]);

  // Update filtered models when make changes
  useEffect(() => {
    if (formData.make_id) {
      const mods = gunModels.filter((m) => m.subtypeId === formData.make_id);
      setFilteredModels(mods);
    } else {
      setFilteredModels([]);
    }
    // Only reset model when make changes manually (not programmatically)
    if (formData.make_id && !selectedFirearm) {
      setFormData((prev) => ({
        ...prev,
        model: '',
        model_id: null,
      }));
    }
  }, [formData.make_id, gunModels, selectedFirearm]);

  // Fetch owner firearms when owner is selected
  useEffect(() => {
    const fetchOwnerFirearms = async () => {
      if (!selectedOwner?.id) {
        setOwnerFirearms([]);
        setSelectedFirearm(null);
        return;
      }

      setIsLoadingFirearms(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Use the existing owners endpoint which already includes firearms data
        const response = await axios.get(
          `${API_BASE_URL}owners/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Find the specific owner and get their firearms
        const owner = response.data.find(o => o.id === selectedOwner.id);
        const allFirearms = owner?.firearms || [];

        // Fetch existing firearm licenses to filter out firearms that already have licenses
        const licensesResponse = await axios.get(
          `${API_BASE_URL}firearm-licenses/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Get serial numbers of firearms that already have licenses
        const licensedSerialNumbers = new Set(
          licensesResponse.data.results.map(license => license.serial_number)
        );

        // Filter out firearms that already have licenses
        const availableFirearms = allFirearms.filter(
          firearm => !licensedSerialNumbers.has(firearm.serial_number)
        );

        // Track if all firearms are already licensed
        const allFirearmsLicensed = allFirearms.length > 0 && availableFirearms.length === 0;

        setOwnerFirearms(availableFirearms);
        setAllFirearmsLicensed(allFirearmsLicensed);
      } catch (error) {
        console.error('Error fetching owner firearms:', error);
        setOwnerFirearms([]);
        setAllFirearmsLicensed(false);
      } finally {
        setIsLoadingFirearms(false);
      }
    };

    fetchOwnerFirearms();
  }, [selectedOwner]);

  // Add this function to calculate expiry date based on duration
  const calculateExpiryDate = (issueDate, duration) => {
    if (!issueDate) return '';
    const date = new Date(issueDate);
    return addYears(date, parseInt(duration)).toISOString().split('T')[0];
  };

  // Function to handle firearm selection and auto-fill form data
  const handleFirearmSelection = (firearm) => {
    setSelectedFirearm(firearm);
    
    // Auto-fill form data based on selected firearm
    setFormData((prev) => ({
      ...prev,
      kind: firearm.gun_type_details?.name || '',
      kind_id: firearm.gun_type_details?.id || null,
      make: firearm.gun_subtype_details?.name || '',
      make_id: firearm.gun_subtype_details?.id || null,
      model: firearm.gun_model_details?.name || '',
      model_id: firearm.gun_model_details?.id || null,
      caliber: firearm.ammunition_type || '',
      serial_number: firearm.serial_number || '',
    }));
  };

  // Automatically select the owner if ownerData is provided
  useEffect(() => {
    if (ownerData && !selectedOwner) {
      setSelectedOwner(ownerData);
      setFormData((prev) => ({
        ...prev,
        owner_id: ownerData.id,
      }));
    }
  }, [ownerData, selectedOwner]);

  // Remove the owner search functionality if owner is pre-selected
  const handleSearchChange = (e) => {
    if (selectedOwner) return; // Disable search if owner is already selected

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photo_preview: URL.createObjectURL(file),
      }));
    }
  };

  const debouncedSearch = debounce(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}owners/?search=${term}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  // const handleSearchChange = (e) => {
  //   const term = e.target.value;
  //   setSearchTerm(term);

  //   if (term.trim()) {
  //     setIsSearching(true);
  //     debouncedSearch(term);
  //   } else {
  //     setSearchResults([]);
  //     setIsSearching(false);
  //   }
  // };

  const selectOwner = (owner) => {
    setSelectedOwner(owner);
    setFormData((prev) => ({
      ...prev,
      owner_id: owner.id,
    }));
    setSearchResults([]);
    setSearchTerm(owner.full_legal_name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Handle gun type hierarchy changes
      if (name === 'kind_id') {
        const selectedType = gunTypes.find(
          (type) => type.id === parseInt(value)
        );
        newData.kind = selectedType?.name || '';
        newData.kind_id = selectedType?.id || null;
        // Reset make and model when kind changes
        newData.make = '';
        newData.make_id = null;
        newData.model = '';
        newData.model_id = null;
      }

      if (name === 'make_id') {
        const selectedSubtype = gunSubtypes.find(
          (subtype) => subtype.id === parseInt(value)
        );
        newData.make = selectedSubtype?.name || '';
        newData.make_id = selectedSubtype?.id || null;
        // Reset model when make changes
        newData.model = '';
        newData.model_id = null;
      }

      if (name === 'model_id') {
        const selectedModel = gunModels.find(
          (model) => model.id === parseInt(value)
        );
        newData.model = selectedModel?.name || '';
        newData.model_id = selectedModel?.id || null;
      }

      // Handle status change
      if (name === 'status') {
        if (value === 'active') {
          // If switching to active, calculate expiry date from duration
          if (newData.date_issued) {
            const issueDate = new Date(newData.date_issued);
            const expiryDate = new Date(issueDate);
            expiryDate.setFullYear(
              issueDate.getFullYear() + parseInt(newData.duration || '5')
            );
            newData.expiry_date = expiryDate.toISOString().split('T')[0];
          } else {
            newData.expiry_date = '';
          }
        }
        // If switching to inactive, keep the existing expiry_date
      }

      // If date_issued or duration changes and status is active, calculate expiry_date
      if (
        (name === 'date_issued' || name === 'duration') &&
        newData.status === 'active'
      ) {
        if (newData.date_issued) {
          const issueDate = new Date(newData.date_issued);
          const expiryDate = new Date(issueDate);
          expiryDate.setFullYear(
            issueDate.getFullYear() + parseInt(newData.duration || '5')
          );
          newData.expiry_date = expiryDate.toISOString().split('T')[0];
        } else {
          newData.expiry_date = '';
        }
      }

      return newData;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    // Owner validation
    if (!formData.owner_id) {
      errors.owner = 'Owner is required';
      isValid = false;
    }

    // License number validations
    if (!formData.control_number.trim()) {
      errors.control_number = 'Control number is required';
      isValid = false;
    }

    if (!formData.license_number.trim()) {
      errors.license_number = 'License number is required';
      isValid = false;
    }

    // Firearm details validations
    if (!formData.kind.trim()) {
      errors.kind = 'Kind is required';
      isValid = false;
    }

    if (!formData.make.trim()) {
      errors.make = 'Make is required';
      isValid = false;
    }

    if (!formData.model.trim()) {
      errors.model = 'Model is required';
      isValid = false;
    }

    if (!formData.caliber.trim()) {
      errors.caliber = 'Caliber is required';
      isValid = false;
    }

    if (!formData.serial_number.trim()) {
      errors.serial_number = 'Serial number is required';
      isValid = false;
    }

    // Date validations
    if (!formData.date_issued) {
      errors.date_issued = 'Date issued is required';
      isValid = false;
    } else {
      const issuedDate = new Date(formData.date_issued);

      // Validate issue date is not in the future
      if (issuedDate > today) {
        errors.date_issued = 'Issue date cannot be in the future';
        isValid = false;
      }
    }

    // Status-based validations
    if (formData.status === 'active') {
      if (!formData.duration) {
        errors.duration = 'License duration is required';
        isValid = false;
      }

      // For active licenses, validate calculated expiry date
      if (formData.date_issued && formData.duration) {
        const expiryDate = new Date(formData.date_issued);
        expiryDate.setFullYear(
          expiryDate.getFullYear() + parseInt(formData.duration)
        );

        if (expiryDate < today) {
          errors.duration = 'Selected duration makes license already expired';
          isValid = false;
        }
      }
    } else {
      // Inactive license validations
      if (!formData.expiry_date) {
        errors.expiry_date = 'Expiry date is required for inactive licenses';
        isValid = false;
      } else {
        const expiryDate = new Date(formData.expiry_date);

        // Validate expiry date is after issue date
        if (
          formData.date_issued &&
          expiryDate < new Date(formData.date_issued)
        ) {
          errors.expiry_date = 'Expiry date must be after issue date';
          isValid = false;
        }

        // Validate expiry date is not in the future for inactive licenses
        if (expiryDate > today) {
          errors.expiry_date =
            'Inactive licenses cannot have future expiry dates';
          isValid = false;
        }
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Calculate expiry date based on duration
      const issueDate = new Date(formData.date_issued);
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(
        issueDate.getFullYear() + parseInt(formData.duration)
      );

      // Create FormData object
      const formDataToSend = new FormData();

      // Append all required fields
      const fields = [
        'owner_id',
        'control_number',
        'license_number',
        'kind',
        'make',
        'model',
        'caliber',
        'serial_number',
        'date_issued',
      ];

      fields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });

      // Add calculated expiry date
      formDataToSend.append(
        'expiry_date',
        expiryDate.toISOString().split('T')[0]
      );

      // Append photo if exists
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      // Show loading state with option to confirm if license is expired
      const today = new Date();
      const isExpired = expiryDate < today;

      if (isExpired) {
        const confirmResult = await Swal.fire({
          title: 'Register Expired License?',
          html: `The license expiry date (${expiryDate.toISOString().split('T')[0]}) is in the past.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, register',
          cancelButtonText: 'No, cancel',
          reverseButtons: true,
        });

        if (!confirmResult.isConfirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      const swalResult = Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we register your license',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        timer: 30000,
        timerProgressBar: true,
      });

      const response = await axios.post(
        `${API_BASE_URL}firearm-licenses/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 25000,
        }
      );

      // Close loading dialog
      await swalResult.close();

      // Handle expired license notification
      if (isExpired) {
        await Swal.fire({
          icon: 'info',
          title: 'Expired License Registered',
          html: `
            <div style="text-align: left;">
              <p>License <strong>${response.data.license_number}</strong> registered as expired.</p>
              <div style="margin-top: 15px; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                <p style="margin: 0; font-weight: 500;">Client Notification Required:</p>
                <p style="margin: 5px 0 0 0;">
                  Please notify <strong>${selectedOwner.first_name} ${selectedOwner.last_name}</strong> 
                  ${selectedOwner.email ? `(<a href="mailto:${selectedOwner.email}">${selectedOwner.email}</a>)` : ''}
                  about their expired firearm license.
                </p>
                <p style="margin: 5px 0 0 0;">
                  <strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}
                </p>
              </div>
              <div style="margin-top: 15px; padding: 10px; background-color: #e8f5e8; border-radius: 4px; border-left: 4px solid #28a745;">
                <p style="margin: 0; font-weight: 500; color: #155724;">
                  <strong>✓</strong> Redirecting to Owner Profile to view the registered license...
                </p>
              </div>
            </div>
          `,
          confirmButtonText: 'OK'
        });
      } else {
        // Show success message for non-expired licenses
        await Swal.fire({
          icon: 'success',
          title: 'License Registered!',
          html: `
            <div style="text-align: left;">
              <p>Firearm license <strong>${response.data.data.license_number}</strong> has been registered successfully.</p>
              ${
                response.data.data.photo_url
                  ? `
                  <div style="margin-top: 15px;">
                    <p>Uploaded photo preview:</p>
                    <img src="${response.data.data.photo_url}" 
                         style="max-width: 100%; max-height: 200px; margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                         alt="License photo"/>
                  </div>
                  `
                  : ''
              }
              <div style="margin-top: 15px; padding: 10px; background-color: #e8f5e8; border-radius: 4px; border-left: 4px solid #28a745;">
                <p style="margin: 0; font-weight: 500; color: #155724;">
                  <strong>✓</strong> Redirecting to Owner Profile to view the registered license...
                </p>
              </div>
            </div>
          `,
          confirmButtonText: 'OK',
        });
      }

      // Reset form
      setFormData({
        owner_id: null,
        control_number: '',
        license_number: '',
        kind: '',
        kind_id: null,
        make: '',
        make_id: null,
        model: '',
        model_id: null,
        caliber: '',
        serial_number: '',
        date_issued: '',
        duration: '5',
        photo: null,
        photo_preview: null,
      });
      setSelectedOwner(null);
      setSelectedFirearm(null);
      setOwnerFirearms([]);
      setAllFirearmsLicensed(false);
      setFilteredSubtypes([]);
      setFilteredModels([]);
      setSearchTerm('');

      // Navigate to Owner Profile to view the registered license
      try {
        localStorage.setItem('admin_active_menu', 'Profile');
      } catch (_) {}
    } catch (error) {
      console.error('Registration error:', error);
      let errorDetails = '';

      // Handle different error types
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          errorDetails = 'Session expired. Please log in again.';
        } else if (status === 400) {
          errorDetails = data.detail || 'Validation errors occurred';
          if (data.errors) {
            errorDetails = Object.entries(data.errors)
              .map(([field, errors]) => 
                `<strong>${field}:</strong> ${Array.isArray(errors) ? errors.join(', ') : errors}`
              )
              .join('<br>');
          }
        } else if (status === 413) {
          errorDetails = 'File too large. Maximum size is 5MB.';
        } else {
          errorDetails = `Server error: ${status}`;
        }
      } else if (error.request) {
        errorDetails = 'No response from server. Check your network connection.';
      } else {
        errorDetails = error.message || 'An unknown error occurred.';
      }

      await Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        html: `
          <div style="text-align: left;">
            <p>${errorDetails}</p>
          </div>
        `,
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (ownerData) {
      // Pre-fill form fields with ownerData
    }
  }, [ownerData]);

  // Listen for user archive/restore events to refresh owner search
  useEffect(() => {
    const handleUserArchived = () => {
      console.log('User archived - refreshing owner search...');
      // Clear current selection and refresh search results
      setSelectedOwner(null);
      setSearchResults([]);
      setSearchTerm('');
    };

    const handleUserRestored = () => {
      console.log('User restored - refreshing owner search...');
      // Same logic as archive
      setSelectedOwner(null);
      setSearchResults([]);
      setSearchTerm('');
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

  return (
    <div className="flr-container">
      <div className="flr-header">
        <div className="flr-header-badge">
          <ShieldCheck size={28} />
          <span>FIREARM LICENSE REGISTRATION</span>
        </div>
        <h2 className="flr-title">Register New Firearm License</h2>
        <p className="flr-description">
          Complete all required fields to register a new firearm license
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flr-form">
        <div className="flr-form-section">
          <div className="flr-section-header">
            <User size={24} className="flr-section-icon" />
            <h3>Owner Information</h3>
            <span className="flr-required-badge">Required</span>
          </div>

          <div className="flr-form-group">
            <label htmlFor="owner-search" className="flr-input-label">
              <Search size={20} className="flr-input-icon" />
              Search Active Client
            </label>
            <div className="flr-search-container">
              <input
                type="text"
                id="owner-search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by client name..."
                disabled={!!selectedOwner}
                className="flr-search-input"
              />
              {isSearching && (
                <Loader2
                  size={20}
                  className="flr-search-loading animate-spin"
                />
              )}
            </div>
            {validationErrors.owner && (
              <div className="flr-error-message">
                <X size={16} /> {validationErrors.owner}
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="flr-search-results">
              {searchResults.map((owner) => (
                <div
                  key={owner.id}
                  className="flr-result-item"
                  onClick={() => selectOwner(owner)}
                >
                  <div className="flr-user-info">
                    <User size={18} />
                    <span>
                      {owner.full_legal_name}
                    </span>
                  </div>
                  <div className="flr-user-details">
                    <span>{owner.contact_number}</span>
                    <span>{owner.residential_address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedOwner && (
            <div className="flr-selected-owner">
              <div className="flr-owner-avatar">
                {selectedOwner.full_legal_name?.charAt(0)}
                {selectedOwner.full_legal_name?.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div className="flr-owner-details">
                <h4>
                  {selectedOwner.full_legal_name}
                </h4>
                <p>{selectedOwner.contact_number}</p>
                <p>{selectedOwner.residential_address}</p>
              </div>
              <button
                type="button"
                className="flr-clear-btn"
                onClick={() => {
                  setSelectedOwner(null);
                  setOwnerFirearms([]);
                  setAllFirearmsLicensed(false);
                  setSearchTerm('');
                }}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Firearm Selection Section */}
        {selectedOwner && (
          <div className="flr-form-section">
            <div className="flr-section-header">
              <Crosshair size={24} className="flr-section-icon" />
              <h3>Select Firearm</h3>
              <span className="flr-required-badge">Optional</span>
            </div>

            {isLoadingFirearms ? (
              <div className="flr-loading-container">
                <Loader2 size={24} className="animate-spin" />
                <span>Loading firearms...</span>
              </div>
            ) : ownerFirearms.length > 0 ? (
              <div className="flr-firearm-selection">
                <p className="flr-firearm-description">
                  Select a firearm to automatically fill the gun details below:
                </p>
                <div className="flr-firearm-grid">
                  {ownerFirearms.map((firearm) => (
                    <div
                      key={firearm.serial_number}
                      className={`flr-firearm-card ${
                        selectedFirearm?.serial_number === firearm.serial_number
                          ? 'flr-firearm-card-selected'
                          : ''
                      }`}
                      onClick={() => handleFirearmSelection(firearm)}
                    >
                      <div className="flr-firearm-header">
                        <Crosshair size={20} />
                        <span className="flr-firearm-serial">
                          {firearm.serial_number}
                        </span>
                      </div>
                      <div className="flr-firearm-details">
                        <div className="flr-firearm-detail">
                          <strong>Type:</strong> {firearm.gun_type_details?.name || 'N/A'}
                        </div>
                        <div className="flr-firearm-detail">
                          <strong>Subtype:</strong> {firearm.gun_subtype_details?.name || 'N/A'}
                        </div>
                        <div className="flr-firearm-detail">
                          <strong>Model:</strong> {firearm.gun_model_details?.name || 'N/A'}
                        </div>
                        <div className="flr-firearm-detail">
                          <strong>Caliber:</strong> {firearm.ammunition_type || 'N/A'}
                        </div>
                        <div className="flr-firearm-detail">
                          <strong>Status:</strong> {firearm.firearm_status || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedFirearm && (
                  <div className="flr-selected-firearm-info">
                    <div className="flr-selected-firearm-header">
                      <Check size={20} className="flr-check-icon" />
                      <span>Selected: {selectedFirearm.serial_number}</span>
                    </div>
                    <button
                      type="button"
                      className="flr-clear-firearm-btn"
                      onClick={() => {
                        setSelectedFirearm(null);
                        // Reset firearm-related form fields
                        setFormData((prev) => ({
                          ...prev,
                          kind: '',
                          kind_id: null,
                          make: '',
                          make_id: null,
                          model: '',
                          model_id: null,
                          caliber: '',
                          serial_number: '',
                        }));
                        // Reset filtered dropdowns
                        setFilteredSubtypes([]);
                        setFilteredModels([]);
                      }}
                    >
                      <X size={16} />
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flr-no-firearms">
                <AlertCircle size={24} />
                {allFirearmsLicensed ? (
                  <>
                    <p>All firearms for this owner already have licenses.</p>
                    <p className="flr-no-firearms-subtitle">
                      You can manually enter the firearm details below to register a new firearm.
                    </p>
                  </>
                ) : (
                  <>
                    <p>No firearms found for this owner.</p>
                    <p className="flr-no-firearms-subtitle">
                      You can manually enter the firearm details below.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flr-form-section">
          <div className="flr-section-header">
            <FileText size={24} className="flr-section-icon" />
            <h3>License Details</h3>
            <span className="flr-required-badge">Required</span>
          </div>

          <div className="flr-form-grid">
            <div className="flr-form-group">
              <label htmlFor="control_number" className="flr-input-label">
                <Barcode size={20} className="flr-input-icon" />
                Control Number
                <span className="flr-required-star">*</span>
              </label>
              <input
                type="text"
                id="control_number"
                name="control_number"
                value={formData.control_number}
                onChange={handleChange}
                placeholder="Enter control number"
                className={`flr-input ${validationErrors.control_number ? 'flr-input-error' : ''}`}
              />
              {validationErrors.control_number && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.control_number}
                </div>
              )}
            </div>

            <div className="flr-form-group">
              <label htmlFor="license_number" className="flr-input-label">
                <ShieldCheck size={20} className="flr-input-icon" />
                Firearms License No. (FA LIC. NO.)
                <span className="flr-required-star">*</span>
              </label>
              <input
                type="text"
                id="license_number"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                placeholder="Enter license number"
                className={`flr-input ${validationErrors.license_number ? 'flr-input-error' : ''}`}
              />
              {validationErrors.license_number && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.license_number}
                </div>
              )}
            </div>

            {/* Kind (Type of Gun) Dropdown */}
            <div className="flr-form-group">
              <label htmlFor="kind_id" className="flr-input-label">
                <Crosshair size={20} className="flr-input-icon" />
                Type of Gun
                <span className="flr-required-star">*</span>
              </label>
              <select
                id="kind_id"
                name="kind_id"
                value={formData.kind_id || ''}
                onChange={handleChange}
                disabled={!!selectedFirearm}
                className={`flr-input ${validationErrors.kind ? 'flr-input-error' : ''}`}
              >
                <option value="">Select Type of Gun</option>
                {gunTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {validationErrors.kind && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.kind}
                </div>
              )}
            </div>

            {/* Make (Sub Type) Dropdown */}
            <div className="flr-form-group">
              <label htmlFor="make_id" className="flr-input-label">
                <Crosshair size={20} className="flr-input-icon" />
                Sub Type
                <span className="flr-required-star">*</span>
              </label>
              <select
                id="make_id"
                name="make_id"
                value={formData.make_id || ''}
                onChange={handleChange}
                disabled={!formData.kind_id || !!selectedFirearm}
                className={`flr-input ${validationErrors.make ? 'flr-input-error' : ''}`}
              >
                <option value="">Select Sub Type</option>
                {filteredSubtypes.map((subtype) => (
                  <option key={subtype.id} value={subtype.id}>
                    {subtype.name}
                  </option>
                ))}
              </select>
              {validationErrors.make && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.make}
                </div>
              )}
            </div>

            {/* Model (Gun Name/Model) Dropdown */}
            <div className="flr-form-group">
              <label htmlFor="model_id" className="flr-input-label">
                <Crosshair size={20} className="flr-input-icon" />
                Gun Name/Model
                <span className="flr-required-star">*</span>
              </label>
              <select
                id="model_id"
                name="model_id"
                value={formData.model_id || ''}
                onChange={handleChange}
                disabled={!formData.make_id || !!selectedFirearm}
                className={`flr-input ${validationErrors.model ? 'flr-input-error' : ''}`}
              >
                <option value="">Select Model</option>
                {filteredModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {validationErrors.model && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.model}
                </div>
              )}
            </div>

            <div className="flr-form-group">
              <label htmlFor="caliber" className="flr-input-label">
                <Crosshair size={20} className="flr-input-icon" />
                Caliber
                <span className="flr-required-star">*</span>
              </label>
              <input
                type="text"
                id="caliber"
                name="caliber"
                value={formData.caliber}
                onChange={handleChange}
                disabled={!!selectedFirearm}
                placeholder="Enter caliber (e.g., 9mm)"
                className={`flr-input ${validationErrors.caliber ? 'flr-input-error' : ''}`}
              />
              {validationErrors.caliber && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.caliber}
                </div>
              )}
            </div>

            <div className="flr-form-group">
              <label htmlFor="serial_number" className="flr-input-label">
                <Barcode size={20} className="flr-input-icon" />
                Serial Number
                <span className="flr-required-star">*</span>
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                disabled={!!selectedFirearm}
                placeholder="Enter serial number"
                className={`flr-input ${validationErrors.serial_number ? 'flr-input-error' : ''}`}
              />
              {validationErrors.serial_number && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.serial_number}
                </div>
              )}
            </div>

            <div className="flr-form-group">
              <label htmlFor="date_issued" className="flr-input-label">
                <Calendar size={20} className="flr-input-icon" />
                Date Issued
                <span className="flr-required-star">*</span>
              </label>
              <input
                type="date"
                id="date_issued"
                name="date_issued"
                value={formData.date_issued}
                onChange={handleChange}
                className={`flr-input ${validationErrors.date_issued ? 'flr-input-error' : ''}`}
              />
              {validationErrors.date_issued && (
                <div className="flr-error-message">
                  <X size={16} /> {validationErrors.date_issued}
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flr-form-group">
              <label htmlFor="status" className="flr-input-label">
                <ShieldCheck size={20} className="flr-input-icon" />
                License Status
                <span className="flr-required-star">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`flr-input ${validationErrors.status ? 'flr-input-error' : ''}`}
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {formData.status === 'active' ? (
              <div className="flr-form-group">
                <label htmlFor="duration" className="flr-input-label">
                  <Clock size={20} className="flr-input-icon" />
                  License Duration
                  <span className="flr-required-star">*</span>
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`flr-input ${validationErrors.duration ? 'flr-input-error' : ''}`}
                >
                  <option value="5">5 Years</option>
                  <option value="10">10 Years</option>
                </select>
                {validationErrors.duration && (
                  <div className="flr-error-message">
                    <X size={16} /> {validationErrors.duration}
                  </div>
                )}
              </div>
            ) : (
              <div className="flr-form-group">
                <label htmlFor="expiry_date" className="flr-input-label">
                  <Calendar size={20} className="flr-input-icon" />
                  Expiry Date
                  <span className="flr-required-star">*</span>
                </label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className={`flr-input ${validationErrors.expiry_date ? 'flr-input-error' : ''}`}
                />
                {validationErrors.expiry_date && (
                  <div className="flr-error-message">
                    <X size={16} /> {validationErrors.expiry_date}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flr-form-group">
          <label htmlFor="photo" className="flr-input-label">
            <Image size={20} className="flr-input-icon" />
            License Photo
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="flr-input"
          />
          {formData.photo_preview && (
            <div className="flr-photo-preview">
              <img src={formData.photo_preview} alt="License preview" />
            </div>
          )}
        </div>

        <div className="flr-form-actions">
          <button
            type="submit"
            className="flr-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Register License</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper function for debouncing
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default FirearmLicenseRegistration;
