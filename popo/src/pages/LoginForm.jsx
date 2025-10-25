import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaShieldAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import '../styles/LoginForm.css';
import { useNavigate, useLocation } from 'react-router-dom';
import OTPLogin from '../components/OTPLogin';
import rcsuLogo from '../assets/rcsu-logo.png'; // Import the logo

const LoginForm = () => {
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for verification success message from redirect
    if (location.state?.verificationSuccess) {
      setSuccessMessage(location.state.message || 'Email verified successfully!');
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    // Check for URL query parameters (from email verification redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const successParam = urlParams.get('success');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (successParam) {
      setSuccessMessage(decodeURIComponent(successParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
    }
  }, []);

  if (showOTPLogin) {
    return (
      <div className="login-page-container">
        <div className="login-glass-container slide-in-right">
          <OTPLogin 
            onBack={() => setShowOTPLogin(false)}
            initialEmail={email}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <div className="login-glass-container scale-in">
        <div className="login-form-section">
          <div className="form-header">
            <div className="header-icon-container bounce-in">
              <div className="icon-background pulse">
                <img 
                  src={rcsuLogo} 
                  alt="RCSU Logo - CISHL, SECURITY FEO SOSIA PNP" 
                  className="header-logo"
                  onError={(e) => {
                    // Fallback in case image fails to load
                    console.error('Failed to load logo:', rcsuLogo);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1>Firearms and Ammunition Monitoring and Management System</h1>
            {/* <p>Secure login with two-factor authentication</p> */}
          </div>

          {successMessage && (
            <div className="success-message enhanced-success slide-in-down" role="status">
              <div className="message-content">
                <FaCheckCircle className="success-icon" />
                <span className="success-text">{successMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message enhanced-error shake" role="alert">
              <div className="message-content">
                <FaExclamationTriangle className="error-icon" />
                <span className="error-text">{error}</span>
              </div>
            </div>
          )}

          <div className="login-options">
            <div className="security-features">
              {/* <div className="feature-item">
                <FaShieldAlt className="feature-icon" />
                <span>Military-grade encryption</span>
              </div>
              <div className="feature-item">
                <FaEnvelope className="feature-icon" />
                <span>Email verification</span>
              </div>
              <div className="feature-item">
                <FaClock className="feature-icon" />
                <span>Real-time monitoring</span>
              </div> */}
            </div>
            <button
              onClick={() => setShowOTPLogin(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`login-btn advanced-btn ${isHovered ? 'btn-hover' : ''}`}
            >
              <span className="btn-content">
                <span className="btn-text">Continue with Email OTP</span>
                <span className="btn-arrow">→</span>
              </span>
              <div className="btn-shine"></div>
            </button>
          </div>

          <div className="emergency-notice">
            <div className="emergency-content">
              <FaExclamationTriangle className="emergency-icon" />
              <div>
                <strong>Emergency Protocol</strong>
                <p>For emergencies, please call 911 immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;