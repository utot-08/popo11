import { useState, useEffect } from 'react';
import { 
  User, UserCheck, UserCog, Edit, Trash2, 
  ChevronLeft, ChevronRight, Search, Loader2,
  AlertCircle, ChevronDown, Save, X, Mail,
  Shield, ShieldCheck, UserPlus, Filter, 
  MoreVertical, RefreshCw, Check, Circle, Plus,
  Home, Calendar, Phone, MapPin, Lock, Eye, EyeOff,
  UserX, UserCheck2, Smartphone, Info, Key
} from 'lucide-react';
import axios from 'axios';
import '../styles/UserList.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    is_active: true
  });

  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    role: 'client',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const usersPerPage = 8;

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}users/`);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    if (users) {
      let filtered = users;
      
      if (searchTerm) {
        filtered = filtered.filter(user => 
          (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.includes(searchTerm)
        ));
      }
      
      if (roleFilter !== 'all') {
        filtered = filtered.filter(user => user.role === roleFilter);
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(user => 
          statusFilter === 'active' ? user.is_active : !user.is_active
        );
      }
      
      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, users, roleFilter, statusFilter]);

  // Open edit modal for existing user
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      date_of_birth: user.date_of_birth || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      is_active: user.is_active
    });
    setIsEditModalOpen(true);
  };

  // Open add modal for new user
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setEditingUser(null);
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle new user form changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm({
      ...newUserForm,
      [name]: value
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate new user form
  const validateForm = () => {
    const errors = {};
    
    if (!newUserForm.username.trim()) {
      errors.username = 'Username is required';
    } else if (newUserForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!newUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!newUserForm.password) {
      errors.password = 'Password is required';
    } else if (newUserForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newUserForm.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } 
    
    // if (newUserForm.password != newUserForm.confirmPassword) {
    //   errors.confirmPassword = 'Passwords do not match';
    // }
    
    if (!newUserForm.role) {
      errors.role = 'Role is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new user
  const handleAddUser = async () => {
    if (!validateForm()) return;
    
    try {
      const userData = {
        username: newUserForm.username,
        email: newUserForm.email,
        role: newUserForm.role,
        password: newUserForm.password,
        first_name: newUserForm.first_name,
        last_name: newUserForm.last_name,
        date_of_birth: newUserForm.date_of_birth,
        phone_number: newUserForm.phone_number,
        address: newUserForm.address
      };
      console.log(userData);
      console.log(newUserForm.password);
      console.log(newUserForm.confirmPassword);
      await axios.post(`${API_BASE_URL}users/`, userData);
      setNewUserForm({
        username: '',
        email: '',
        role: 'client',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        address: ''
      });
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.response?.data) {
        setFormErrors({
          ...formErrors,
          apiError: Object.values(error.response.data).join(' ')
        });
      } else {
        setError(error.response?.data?.message || 'Failed to add user');
      }
    }
  };

  // Save edited user
  const handleSaveChanges = async () => {
    try {
      await axios.put(`${API_BASE_URL}users/${editingUser.id}/`, editFormData);
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE_URL}users/${userId}/`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user) => {
    try {
      await axios.patch(`${API_BASE_URL}users/${user.id}/`, {
        is_active: !user.is_active
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate user avatar
  const getUserAvatar = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  // Generate role badge with icon
  const getUserRoleBadge = (role) => {
    const roleData = {
      administrator: { icon: <ShieldCheck size={14} />, text: 'Admin', color: 'admin' },
      police_officer: { icon: <Shield size={14} />, text: 'Officer', color: 'police' },
      client: { icon: <User size={14} />, text: 'Client', color: 'client' }
    };
    
    const { icon, text, color } = roleData[role] || roleData.client;
    
    return (
      <span className={`role-badge ${color}`}>
        {icon}
        {text}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="user-list-container">
      {/* Loading and Error States */}
      {loading && (
        <div className="loading-indicator">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading users...</span>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="user-list-header">
        <div className="header-title">
          <h2><UserCog size={24} className="header-icon" /> User Management</h2>
          <div className="header-actions">
            <button 
              className="btn btn-refresh"
              onClick={fetchUsers}
              title="Refresh"
            >
              <RefreshCw size={16} />
              <span className="tooltip">Refresh</span>
            </button>
            <button 
              className="btn btn-primary"
              onClick={openAddModal}
            >
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="search-bar">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search users by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-container">
            <div className="filter-button-wrapper">
              <button 
                className="btn btn-filter"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
              <ChevronDown 
                size={16} 
                className={`filter-chevron ${showFilters ? 'open' : ''}`} 
                onClick={() => setShowFilters(!showFilters)}
              />
            </div>
            
            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-section">
                  <h4><Filter size={14} /> Role</h4>
                  <div className="filter-options">
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="roleFilter"
                          value="all"
                          checked={roleFilter === 'all'}
                          onChange={() => setRoleFilter('all')}
                        />
                        <Circle size={12} />
                        <span>All Roles</span>
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="roleFilter"
                          value="administrator"
                          checked={roleFilter === 'administrator'}
                          onChange={() => setRoleFilter('administrator')}
                        />
                        <ShieldCheck size={12} />
                        <span>Admins</span>
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="roleFilter"
                          value="police_officer"
                          checked={roleFilter === 'police_officer'}
                          onChange={() => setRoleFilter('police_officer')}
                        />
                        <Shield size={12} />
                        <span>Officers</span>
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="roleFilter"
                          value="client"
                          checked={roleFilter === 'client'}
                          onChange={() => setRoleFilter('client')}
                        />
                        <User size={12} />
                        <span>Clients</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="filter-section">
                  <h4><UserCheck size={14} /> Status</h4>
                  <div className="filter-options">
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="statusFilter"
                          value="all"
                          checked={statusFilter === 'all'}
                          onChange={() => setStatusFilter('all')}
                        />
                        <Circle size={12} />
                        <span>All Statuses</span>
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="statusFilter"
                          value="active"
                          checked={statusFilter === 'active'}
                          onChange={() => setStatusFilter('active')}
                        />
                        <UserCheck2 size={12} />
                        <span>Active</span>
                      </label>
                    </div>
                    <div className="filter-option">
                      <label>
                        <input
                          type="radio"
                          name="statusFilter"
                          value="inactive"
                          checked={statusFilter === 'inactive'}
                          onChange={() => setStatusFilter('inactive')}
                        />
                        <UserX size={12} />
                        <span>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="user-grid">
        {currentUsers.length > 0 ? (
          currentUsers.map(user => (
            <div className="user-card" key={user.id}>
              <div className="user-card-header">
                <div className="user-avatar">
                  {getUserAvatar(user.username)}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.username}</h3>
                  <div className="user-meta">
                    {getUserRoleBadge(user.role)}
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="user-details">
                <div className="detail-row">
                  <Mail size={14} />
                  <a href={`mailto:${user.email}`} className="email-link">
                    {user.email}
                  </a>
                </div>
                
                {(user.first_name || user.last_name) && (
                  <div className="detail-row">
                    <User size={14} />
                    <span>{user.first_name} {user.last_name}</span>
                  </div>
                )}
                
                {user.phone_number && (
                  <div className="detail-row">
                    <Phone size={14} />
                    <span>{user.phone_number}</span>
                  </div>
                )}
                
                {user.date_of_birth && (
                  <div className="detail-row">
                    <Calendar size={14} />
                    <span>{formatDate(user.date_of_birth)}</span>
                  </div>
                )}
                
                {user.address && (
                  <div className="detail-row">
                    <MapPin size={14} />
                    <span className="truncate">{user.address}</span>
                  </div>
                )}
              </div>
              
              <div className="user-actions">
                <button 
                  className="btn btn-icon btn-status"
                  onClick={() => toggleUserStatus(user)}
                  title={user.is_active ? 'Deactivate user' : 'Activate user'}
                >
                  {user.is_active ? <UserX size={16} /> : <UserCheck2 size={16} />}
                </button>
                
                <button 
                  className="btn btn-icon btn-edit"
                  onClick={() => openEditModal(user)}
                  title="Edit user"
                >
                  <Edit size={16} />
                </button>
                
                <button 
                  className="btn btn-icon btn-delete"
                  onClick={() => handleDeleteUser(user.id)}
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
                
                <button className="btn btn-icon btn-more">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 
              'No users match your filters' : 
              'No users found in the system'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              <span className="mobile-hidden">Previous</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
            
            <button 
              className="pagination-btn"
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              <span className="mobile-hidden">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit size={20} className="modal-icon" />
                Edit User: {editingUser.username}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-column">
                <div className="form-section">
                  <h4><User size={16} /> Basic Information</h4>
                  <div className="form-group">
                    <label><Mail size={14} /> Email</label>
                    <div className="input-with-icon">
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={editFormData.first_name}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={editFormData.last_name}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label><Calendar size={14} /> Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={editFormData.date_of_birth}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label><Phone size={14} /> Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={editFormData.phone_number}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label><MapPin size={14} /> Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      className="modal-input"
                    />
                  </div>
                </div>
                
                <div className="form-section">
                  <h4><UserCheck size={16} /> Account Status</h4>
                  <div className="form-group">
                    <label>Status</label>
                    <div className="status-selector">
                      <label className={`status-option ${editFormData.is_active ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="is_active"
                          value={true}
                          checked={editFormData.is_active}
                          onChange={() => handleEditFormChange({ target: { name: 'is_active', value: true } })}
                        />
                        <Check size={16} />
                        <span>Active</span>
                      </label>
                      
                      <label className={`status-option ${!editFormData.is_active ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="is_active"
                          value={false}
                          checked={!editFormData.is_active}
                          onChange={() => handleEditFormChange({ target: { name: 'is_active', value: false } })}
                        />
                        <X size={16} />
                        <span>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveChanges}
              >
                <Save size={16} className="btn-icon" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Add User Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <UserPlus size={20} className="modal-icon" />
                  Add New User
                </h3>
                <button className="modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-column">
                  <div className="form-section">
                    <h4><User size={16} /> Account Information</h4>
                    <div className="form-group">
                      <label><User size={14} /> Username</label>
                      <input
                        type="text"
                        name="username"
                        value={newUserForm.username}
                        onChange={handleNewUserChange}
                        className={`modal-input ${formErrors.username ? 'error' : ''}`}
                        placeholder="Enter username"
                      />
                      {formErrors.username && (
                        <span className="error-message">{formErrors.username}</span>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label><Mail size={14} /> Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newUserForm.email}
                        onChange={handleNewUserChange}
                        className={`modal-input ${formErrors.email ? 'error' : ''}`}
                        placeholder="Enter email"
                      />
                      {formErrors.email && (
                        <span className="error-message">{formErrors.email}</span>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label><Lock size={14} /> Password</label>
                        <div className="input-with-icon">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={newUserForm.password}
                            onChange={handleNewUserChange}
                            className={`modal-input ${formErrors.password ? 'error' : ''}`}
                            placeholder="Enter password"
                          />
                          <button 
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                            type="button"
                          >
                          </button>
                        </div>
                        {formErrors.password && (
                          <span className="error-message">{formErrors.password}</span>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label><Key size={14} /> Confirm Password</label>
                        <div className="input-with-icon">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={newUserForm.confirmPassword}
                            onChange={handleNewUserChange}
                            className={`modal-input ${formErrors.confirmPassword ? 'error' : ''}`}
                            placeholder="Confirm password"
                          />
                          <button 
                            className="password-toggle"
                            onClick={toggleConfirmPasswordVisibility}
                            type="button"
                          >
                      
                          </button>
                        </div>
                        {formErrors.confirmPassword && (
                          <span className="error-message">{formErrors.confirmPassword}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label><UserCog size={14} /> Role</label>
                      <div className="role-selector">
                        <label className={`role-option ${newUserForm.role === 'administrator' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="role"
                            value="administrator"
                            checked={newUserForm.role === 'administrator'}
                            onChange={handleNewUserChange}
                          />
                          <ShieldCheck size={16} />
                          <span>Administrator</span>
                        </label>
                        
                        <label className={`role-option ${newUserForm.role === 'police_officer' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="role"
                            value="police_officer"
                            checked={newUserForm.role === 'police_officer'}
                            onChange={handleNewUserChange}
                          />
                          <Shield size={16} />
                          <span>Police Officer</span>
                        </label>
                        
                        <label className={`role-option ${newUserForm.role === 'client' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="role"
                            value="client"
                            checked={newUserForm.role === 'client'}
                            onChange={handleNewUserChange}
                          />
                          <User size={16} />
                          <span>Client</span>
                        </label>
                      </div>
                      {formErrors.role && (
                        <span className="error-message">{formErrors.role}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4><UserCheck size={16} /> Personal Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={newUserForm.first_name}
                          onChange={handleNewUserChange}
                          className="modal-input"
                          placeholder="Optional"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={newUserForm.last_name}
                          onChange={handleNewUserChange}
                          className="modal-input"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label><Calendar size={14} /> Date of Birth</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={newUserForm.date_of_birth}
                          onChange={handleNewUserChange}
                          className="modal-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label><Phone size={14} /> Phone Number</label>
                        <input
                          type="text"
                          name="phone_number"
                          value={newUserForm.phone_number}
                          onChange={handleNewUserChange}
                          className="modal-input"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label><MapPin size={14} /> Address</label>
                      <input
                        type="text"
                        name="address"
                        value={newUserForm.address}
                        onChange={handleNewUserChange}
                        className="modal-input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddUser}
                >
                  <Save size={16} className="btn-icon" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default UserList;