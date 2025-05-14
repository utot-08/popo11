import { 
  FaUser, 
  FaUserShield, 
  FaLock, 
  FaSignInAlt, 
  FaPhoneAlt,
  FaShieldAlt,
  FaBuilding,                     
  FaIdBadge,
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckSquare
} from 'react-icons/fa';
import { useState } from 'react';
import '../styles/LoginForm.css';
import policeBuilding from '../assets/police-image.jpg'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isOfficerLogin, setIsOfficerLogin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  // Hardcoded credentials for testing
  // const validCredentials = {
  //   admin: { password: '123', role: 'admin' },
  //   police: { password: '789', role: 'police' },
  //   client: { password: '456', role: 'client' }
  // };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError('');

      // Basic validation
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Invalid username or password"
      );
      // Explicitly prevent default in case of error
      e.preventDefault();
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="form-header">
          <div className="header-icon-container">
            {isOfficerLogin ? (
              <FaShieldAlt className="header-icon" />
            ) : (
              <FaUser className="header-icon" />
            )}
          </div>
          <h1>Welcome Back</h1>
          <p>Enter your login details below</p>
        </div>

        {/* <div className="login-toggle">
          <button 
            className={`toggle-btn ${!isOfficerLogin ? 'active' : ''}`}
            onClick={() => setIsOfficerLogin(false)}
          >
            <FaUser className="toggle-icon" /> Client Login
          </button>
          <button 
            className={`toggle-btn ${isOfficerLogin ? 'active' : ''}`}
            onClick={() => setIsOfficerLogin(true)}
          >
            <FaUserShield className="toggle-icon" /> Officer Login
          </button>
        </div> */}

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">
             
                <>
                  <FaIdBadge className="label-icon" /> Username
                </>
             
            </label>
            <div className="input-wrapper">
              {isOfficerLogin ? 
                <FaUserShield className="input-icon" /> : 
                <FaUser className="input-icon" />
              }
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="password-label">
              <label htmlFor="password">
                <FaLock className="label-icon" /> Password
              </label>
              <a href="#forgot" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="3"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <FaCheckSquare className="checkbox-icon" />
                Remember me
              </label>
            </div>
          </div>

          <button type="submit" className="login-btn">
            <FaSignInAlt className="btn-icon" /> 
            LOG IN
          </button>
        </form>
        <div className="emergency-notice">
          <FaPhoneAlt className="emergency-icon" />
          <p>For emergencies, please call 911 immediately</p>
        </div>
      </div>

      <div className="login-image-section">
        <div className="image-overlay">
        </div>
        <img src={policeBuilding} alt="Police Department Building" />
      </div>
          </div>
  );
};  

export default LoginForm;