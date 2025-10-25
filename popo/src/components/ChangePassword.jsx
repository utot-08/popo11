import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiLock,
  FiCheck,
  FiX,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiShield,
  FiLoader,
} from 'react-icons/fi';
import '../styles/ChangePassword.css';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [showOTPField, setShowOTPField] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [isValidatingCurrentPassword, setIsValidatingCurrentPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api/';

  // Password strength validation function
  const validatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        feedback: '',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        }
      });
      return;
    }

    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    let score = 0;
    let feedback = '';

    // Calculate score based on requirements
    Object.values(requirements).forEach(met => {
      if (met) score++;
    });

    // Determine strength level
    if (score < 3) {
      feedback = 'Weak';
    } else if (score < 5) {
      feedback = 'Medium';
    } else {
      feedback = 'Strong';
    }

    setPasswordStrength({
      score,
      feedback,
      requirements
    });
  };

  // Debounced current password validation
  const validateCurrentPassword = async (password) => {
    if (!password || password.length < 1) {
      setCurrentPasswordError('');
      return;
    }

    setIsValidatingCurrentPassword(true);
    setCurrentPasswordError('');

    try {
      const response = await fetch(`${API_BASE_URL}validate-current-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          current_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes('incorrect')) {
          setCurrentPasswordError('Current password is incorrect');
        } else {
          setCurrentPasswordError(data.error || 'Invalid password');
        }
      } else {
        setCurrentPasswordError('');
      }
    } catch (err) {
      setCurrentPasswordError('Unable to validate password');
    } finally {
      setIsValidatingCurrentPassword(false);
    }
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const debouncedValidateCurrentPassword = debounce(validateCurrentPassword, 500);

  // Handle current password change
  const handleCurrentPasswordChange = (e) => {
    const value = e.target.value;
    setCurrentPassword(value);
    debouncedValidateCurrentPassword(value);
  };

  // Handle new password change
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePasswordStrength(value);
  };

const handleVerifyOTP = async () => {
  if (!otp || otp.length !== 6) {
    setError('Please enter a valid 6-digit OTP.');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const response = await fetch(`${API_BASE_URL}verify-password-change/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        otp,
        user_id: userId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || data.detail || 'Failed to verify OTP.');
      setIsLoading(false);
      return;
    }

    setSuccess('Password changed successfully! Redirecting to login...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setTimeout(() => navigate('/login'), 2000);
  } catch (err) {
    setError('An error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  // Check for ?verified=1 in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === '1') {
      setVerified(true);
      setSuccess('Your password has been changed. You can now close this tab.');
    }
  }, [location.search]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setIsLoading(true);

  // Basic validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    setError('Please fill in all fields.');
    setIsLoading(false);
    return;
  }
  if (currentPasswordError) {
    setError('Please correct the current password error before proceeding.');
    setIsLoading(false);
    return;
  }
  if (newPassword !== confirmPassword) {
    setError('Passwords do not match.');
    setIsLoading(false);
    return;
  }
  if (newPassword.length < 8) {
    setError('Password must be at least 8 characters.');
    setIsLoading(false);
    return;
  }
  if (passwordStrength.feedback === 'Weak') {
    setError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
    setIsLoading(false);
    return;
  }
  if (currentPassword === newPassword) {
    setError('New password must be different from current password.');
    setIsLoading(false);
    return;
  }

  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => navigate('/login'), 1500);
      setIsLoading(false);
      return;
    }

    // Request OTP for password change
    const response = await fetch(`${API_BASE_URL}request-password-change/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      setError('Session expired or unauthorized. Please log in again.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setTimeout(() => navigate('/login'), 1500);
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      // Check if it's the "same password" error
      if (data.error && data.error.includes('cannot be the same as your current password')) {
        setError('This is your previous password. Please choose a different password.');
      } else {
        setError(data.detail || data.error || 'Failed to request OTP.');
      }
      setIsLoading(false);
      return;
    }

    setShowOTPField(true);
    setUserId(data.user_id); 
    setSuccess('OTP sent to your email. Please enter it below.');
  } catch (err) {
    setError('An error occurred. Please try again.');
    console.error('Password change error:', err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <motion.div
      className="change-password-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="password-card">
        {/* <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button> */}

        <div className="password-header">
          <FiLock size={48} className="lock-icon" />
          <h2>Change Your Password</h2>
          <p>Create a new strong password to secure your account</p>
        </div>

        {/* Show success message if verified */}
        {verified ? (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheck className="message-icon" />
            Your password has been changed. You can now close this tab.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Current Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                  required
                  placeholder="Enter your current password"
                  disabled={showOTPField}
                  className={currentPasswordError ? 'error-input' : ''}
                />
                {isValidatingCurrentPassword && (
                  <div className="validation-spinner">
                    <FiLoader className="spinning" size={16} />
                  </div>
                )}
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  disabled={showOTPField} 
                >
                  {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {currentPasswordError && (
                <motion.div
                  className="inline-error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    color: '#f44336',
                    fontSize: '12px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <FiX size={12} style={{ marginRight: '4px' }} />
                  {currentPasswordError}
                </motion.div>
              )}
            </div>

            <div className="input-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  minLength={8}
                  required
                  placeholder="At least 8 characters"
                  disabled={showOTPField}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={showOTPField} 
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <motion.div
                  className="password-strength-indicator"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${passwordStrength.feedback.toLowerCase()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="strength-text">
                    Password Strength: <span className={`strength-label ${passwordStrength.feedback.toLowerCase()}`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  
                  {/* Requirements Checklist */}
                  <div className="requirements-checklist">
                    <div className={`requirement ${passwordStrength.requirements.length ? 'met' : 'unmet'}`}>
                      <FiCheck size={12} />
                      At least 8 characters
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.uppercase ? 'met' : 'unmet'}`}>
                      <FiCheck size={12} />
                      Uppercase letter
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.lowercase ? 'met' : 'unmet'}`}>
                      <FiCheck size={12} />
                      Lowercase letter
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.number ? 'met' : 'unmet'}`}>
                      <FiCheck size={12} />
                      Number
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.special ? 'met' : 'unmet'}`}>
                      <FiCheck size={12} />
                      Special character
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="Re-enter your password"
                  disabled={showOTPField} 
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                  disabled={showOTPField} 
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* OTP Verification Section */}
            {showOTPField && (
              <motion.div
                className="input-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label>OTP Verification</label>
                <div className="input-wrapper">
                  <FiShield className="input-icon" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    inputMode="numeric"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={handleVerifyOTP}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || otp.length !== 6}
                  className="verify-button"
                >
                  {isLoading ? <div className="spinner"></div> : 'Verify OTP'}
                </motion.button>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  backgroundColor: '#ffebee', 
                  border: '1px solid #f44336',
                  borderRadius: '4px',
                  padding: '12px',
                  margin: '12px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <FiX className="message-icon" style={{ color: '#f44336', marginRight: '8px' }} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FiCheck className="message-icon" />
                {success}
              </motion.div>
            )}

            <motion.button
              type={showOTPField ? 'button' : 'submit'} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || showOTPField}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : showOTPField ? (
                'OTP Sent'
              ) : (
                'Change Password'
              )}
            </motion.button>

            {showOTPField && (
              <div className="otp-resend">
                <p>Didn't receive OTP?</p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ChangePassword;
