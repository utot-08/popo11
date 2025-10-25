import { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaLock, FaKey, FaSpinner, FaArrowLeft, FaRedo, FaCheck, FaEye, FaEyeSlash, FaExclamationTriangle, FaShieldAlt, FaUserLock, FaClock, FaMailBulk, FaLockOpen, FaCheckCircle, FaTimesCircle, FaInfoCircle} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import '../styles/OTPLogin.css';

const OTPLogin = ({ onBack, initialEmail = '' }) => {
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP, 3: Forgot Password Email, 4: Forgot Password OTP, 5: Reset Password
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [userData, setUserData] = useState(null);
  const [focusedInput, setFocusedInput] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [requestId, setRequestId] = useState(null);
  
  // Forgot password states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  
  const otpRefs = useRef([]);
  const passwordRef = useRef(null);
  const location = useLocation();

  // Email masking function
  const maskEmail = (email) => {
    if (!email) return '';
    
    // Show first 3 characters and last 4 characters, mask the rest with max 8 asterisks
    if (email.length <= 7) return email; // Don't mask if email is too short
    
    const firstThree = email.substring(0, 3);
    const lastFour = email.substring(email.length - 4);
    const middleLength = email.length - 7;
    const maskedMiddle = '*'.repeat(Math.min(Math.max(middleLength, 6), 8)); // Min 6, Max 8 asterisks
    
    return `${firstThree}${maskedMiddle}${lastFour}`;
  };

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

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle URL query parameters (from email verification redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const successParam = urlParams.get('success');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (successParam) {
      setSuccess(decodeURIComponent(successParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle verification success message from redirect
  useEffect(() => {
    if (location.state?.verificationSuccess) {
      setSuccess(location.state.message || 'Email verified successfully!');
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Handle remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered && !initialEmail) {
      setEmail(remembered);
    }
  }, [initialEmail]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/request-login-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data);
        setStep(2);
        setCountdown(120); // 2 minutes
        setSuccess('OTP sent to your email successfully');
        setTimeout(() => setSuccess(''), 3000);
        setResendAttempts(0); // Reset resend attempts on successful OTP request
      } else if (response.status === 429) {
        // User is blocked due to too many attempts
        setError(data.error || 'Too many login attempts. Please try again later.');
      } else {
        setError(data.error || data.detail || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setFocusedInput(index + 1);
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled (with debounce to prevent rapid submissions)
    if (newOtp.every(digit => digit !== '') && index === 5) {
      const currentTime = Date.now();
      // Prevent rapid-fire submissions (minimum 1 second between attempts)
      if (currentTime - lastSubmitTime > 1000) {
        setLastSubmitTime(currentTime);
        console.log('OTP complete - auto-submitting:', newOtp.join(''));
        // Small delay to ensure the last digit is properly set
        setTimeout(() => {
          if (step === 4) {
            handleForgotPasswordOTPVerification(null, newOtp.join(''));
          } else {
            handleLoginOTPVerification(null, newOtp.join(''));
          }
        }, 100);
      } else {
        console.log('Auto-submit blocked - too soon since last attempt');
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setFocusedInput(index - 1);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      pasteData.split('').forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      if (pasteData.length === 6) {
        const currentTime = Date.now();
        // Prevent rapid-fire submissions (minimum 1 second between attempts)
        if (currentTime - lastSubmitTime > 1000) {
          setLastSubmitTime(currentTime);
          console.log('OTP pasted - auto-submitting:', pasteData);
          // Small delay to ensure the OTP is properly set
          setTimeout(() => {
            if (step === 4) {
              handleForgotPasswordOTPVerification(null, pasteData);
            } else {
              handleLoginOTPVerification(null, pasteData);
            }
          }, 100);
        } else {
          console.log('Paste auto-submit blocked - too soon since last attempt');
        }
      }
    }
  };

  // Login OTP verification (Step 2)
  const handleLoginOTPVerification = async (e, otpString = null) => {
    console.log('handleLoginOTPVerification called with:', { e, otpString, loading, isVerifying, otp });
    
    if (e) e.preventDefault();
    
    // Prevent multiple simultaneous verification attempts
    if (loading || isVerifying) {
      console.log('Verification already in progress, ignoring request');
      return;
    }
    
    const finalOtp = otpString || otp.join('');
    console.log('Final Login OTP:', finalOtp, 'Length:', finalOtp.length);
    
    if (finalOtp.length !== 6) {
      console.log('OTP length check failed:', finalOtp.length);
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    console.log('Starting LOGIN OTP verification for:', finalOtp);
    setLoading(true);
    setIsVerifying(true);
    setError('');

    try {
      const requestEmail = userData?.email || email;
      console.log('Sending LOGIN verification request:', { 
        email: requestEmail, 
        otp: finalOtp,
        userData: userData,
        emailState: email
      });
      
      const response = await fetch('http://127.0.0.1:8000/api/verify-login-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: requestEmail, 
          otp: finalOtp 
        }),
      });

      const data = await response.json();
      console.log('Login OTP Response received:', { 
        status: response.status, 
        ok: response.ok, 
        data: data 
      });

      if (response.ok) {
        // Login OTP verification - store tokens and redirect
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Show success state briefly before redirect
        setSuccess('OTP verified successfully! Redirecting...');
        setTimeout(() => {
          if (data.user.must_change_password) {
            window.location.href = '/change-password';
          } else {
            window.location.href = '/';
          }
        }, 1000);
      } else {
        // Check if it's an OTP-related error that requires a new OTP
        if (data.error && (
          data.error.includes('already been used') || 
          data.error.includes('expired') || 
          data.error.includes('No OTP found') ||
          data.error.includes('No valid OTP found')
        )) {
          setError(`${data.error} Click "Resend Code" below to get a new OTP.`);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
          setFocusedInput(0);
          otpRefs.current[0]?.focus();
          // Reset countdown to allow immediate resend
          setCountdown(0);
        } else {
          setError(data.error || 'Invalid OTP. Please try again.');
          // Clear OTP on error
          setOtp(['', '', '', '', '', '']);
          setFocusedInput(0);
          otpRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  // Forgot Password OTP verification (Step 4)
  const handleForgotPasswordOTPVerification = async (e, otpString = null) => {
    console.log('handleForgotPasswordOTPVerification called with:', { e, otpString, loading, isVerifying, otp });
    
    if (e) e.preventDefault();
    
    // Prevent multiple simultaneous verification attempts
    if (loading || isVerifying) {
      console.log('Verification already in progress, ignoring request');
      return;
    }
    
    const finalOtp = otpString || otp.join('');
    console.log('Final Forgot Password OTP:', finalOtp, 'Length:', finalOtp.length);
    
    if (finalOtp.length !== 6) {
      console.log('OTP length check failed:', finalOtp.length);
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    console.log('Starting FORGOT PASSWORD OTP verification for:', finalOtp);
    setLoading(true);
    setIsVerifying(true);
    setError('');

    try {
      const requestEmail = forgotPasswordEmail || email;
      console.log('Sending FORGOT PASSWORD verification request:', { 
        email: requestEmail, 
        otp: finalOtp,
        forgotPasswordEmail: forgotPasswordEmail,
        emailState: email
      });
      
      const response = await fetch('http://127.0.0.1:8000/api/verify-forgot-password-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: requestEmail, 
          otp: finalOtp 
        }),
      });

      const data = await response.json();
      console.log('Forgot Password OTP Response received:', { 
        status: response.status, 
        ok: response.ok, 
        data: data 
      });

      if (response.ok) {
        // Forgot password OTP verification - move to reset password step
        setSuccess('OTP verified successfully! You can now reset your password.');
        setTimeout(() => {
          setStep(5);
          setSuccess('');
        }, 1500);
      } else {
        // Check if it's an OTP-related error that requires a new OTP
        if (data.error && (
          data.error.includes('already been used') || 
          data.error.includes('expired') || 
          data.error.includes('No OTP found') ||
          data.error.includes('No valid OTP found')
        )) {
          setError(`${data.error} Click "Resend Code" below to get a new OTP.`);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
          setFocusedInput(0);
          otpRefs.current[0]?.focus();
          // Reset countdown to allow immediate resend
          setCountdown(0);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        setFocusedInput(0);
        otpRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || resendLoading) return;
    
    // Limit resend attempts to prevent spam
    if (resendAttempts >= 3) {
      setError('Maximum resend attempts reached. Please wait or try again later.');
      return;
    }

    setResendLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/resend-login-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(120); // 2 minutes
        setResendAttempts(prev => prev + 1);
        setSuccess(`New OTP sent to your email${resendAttempts > 0 ? ` (${resendAttempts + 1}/3)` : ''}`);
        setTimeout(() => setSuccess(''), 3000);
        setOtp(['', '', '', '', '', '']);
        setFocusedInput(0);
        otpRefs.current[0]?.focus();
      } else if (response.status === 429) {
        // User is blocked due to too many attempts
        setError(data.error || 'Maximum resend attempts reached. Please try again later.');
        setResendAttempts(3); // Set to max to disable further attempts
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Refocus on password input after toggle
    setTimeout(() => {
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }, 0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResendButtonText = () => {
    if (resendLoading) return 'Sending...';
    return 'Resend Code';
  };

  // Forgot password handlers
  const handleForgotPassword = () => {
    setStep(3);
    setForgotPasswordEmail(email);
    setError('');
    setSuccess('');
  };

  const handleForgotPasswordEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(4);
        setCountdown(120); // 2 minutes
        setSuccess('Password reset OTP sent to your email successfully');
        setTimeout(() => setSuccess(''), 3000);
        setResendAttempts(0);
      } else if (response.status === 429) {
        // User is blocked due to too many attempts
        setError(data.error || 'Too many password reset attempts. Please try again later.');
      } else {
        setError(data.error || data.detail || 'Failed to send password reset OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleForgotPasswordOTPVerify = async (e, otpString = null) => {
    if (e) e.preventDefault();
    const finalOtp = otpString || otp.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/verify-forgot-password-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail, 
          otp: finalOtp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(5);
        setSuccess('OTP verified successfully! Please set your new password.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        setFocusedInput(0);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      setIsVerifying(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      setIsVerifying(false);
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      setIsVerifying(false);
      return;
    }
    if (passwordStrength.feedback === 'Weak') {
      setError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
      setLoading(false);
      setIsVerifying(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.error || data.detail || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResendForgotPasswordOTP = async () => {
    if (countdown > 0 || resendLoading) return;
    
    if (resendAttempts >= 3) {
      setError('Maximum resend attempts reached. Please wait or try again later.');
      return;
    }

    setResendLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(120); // 2 minutes
        setResendAttempts(prev => prev + 1);
        setSuccess(`New password reset OTP sent to your email${resendAttempts > 0 ? ` (${resendAttempts + 1}/3)` : ''}`);
        setTimeout(() => setSuccess(''), 3000);
        setOtp(['', '', '', '', '', '']);
        setFocusedInput(0);
        otpRefs.current[0]?.focus();
      } else if (response.status === 429) {
        // User is blocked due to too many attempts
        setError(data.error || 'Maximum resend attempts reached. Please try again later.');
        setResendAttempts(3); // Set to max to disable further attempts
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="otp-login-container">
      <div className="otp-login-header">
        <h2>{step <= 2 ? 'Two-Factor Authentication' : 'Password Reset'}</h2>
        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step >= 2 ? 'completed' : ''}`}>
            <div className="step-dot">1</div>
            <span>{step <= 2 ? 'Credentials' : 'Email'}</span>
          </div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step >= 3 ? 'completed' : ''}`}>
            <div className="step-dot">2</div>
            <span>{step <= 2 ? 'OTP Verification' : 'OTP Verification'}</span>
          </div>
          {step >= 3 && (
            <>
              <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
              <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step >= 5 ? 'completed' : ''}`}>
                <div className="step-dot">3</div>
                <span>Reset Password</span>
              </div>
            </>
          )}
        </div>
      </div>

      {step === 1 && (
        <div className="credentials-step slide-in-left">
          <div className="step-header">
            <h3>Enter Your Credentials</h3>
            <p>We'll send an OTP to your verified email address</p>
          </div>

          <form onSubmit={handleRequestOTP}>
            <div className="input-group">
              <label>
                <FaEnvelope className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                <FaLock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper password-input-wrapper">
                <FaLock className="input-icon" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Small Forgot Password Link */}
            <div className="forgot-password-link-small">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="forgot-password-btn-small"
              >
                <FaShieldAlt />
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="error-message slide-in-down">
                <div className="message-content">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="success-message slide-in-down">
                <div className="message-content">
                  <FaCheckCircle className="success-icon" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading} 
                className={`submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? <FaSpinner className="spinner" /> : <FaKey />}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="otp-step slide-in-right">
          <div className="step-header">
            <h3>Enter Verification Code</h3>
            <p>We've sent a 6-digit code to <strong>{maskEmail(userData?.email || email)}</strong></p>
          </div>

          <form onSubmit={(e) => step === 4 ? handleForgotPasswordOTPVerification(e) : handleLoginOTPVerification(e)}>
            <div className="otp-container">
              <div className="otp-inputs" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={() => setFocusedInput(index)}
                    className={`otp-input ${focusedInput === index ? 'focused' : ''} ${digit ? 'filled' : ''}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <div className="otp-timer">
                {countdown > 0 ? (
                  <div className="timer-container">
                    <div className="timer-text">Code expires in</div>
                    <div className="timer-countdown">{formatTime(countdown)}</div>
                    <div className="timer-note">You can resend when timer expires</div>
                  </div>
                ) : (
                  <div className="resend-container">
                    <button 
                      type="button" 
                      onClick={handleResendOTP}
                      className={`resend-btn ${resendLoading ? 'loading' : ''}`}
                      disabled={resendLoading || resendAttempts >= 3}
                    >
                      {resendLoading ? <FaSpinner className="spinner" /> : <FaRedo />}
                      {getResendButtonText()}
                    </button>
                    {resendAttempts >= 3 && (
                      <p className="resend-limit">Resend limit reached. Please try again later.</p>
                    )}
                  </div>
                )}
              </div>
              
              {resendAttempts > 0 && (
                <div className="resend-attempts-footer">
                  <p>Resend attempts: {resendAttempts}/3</p>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message slide-in-down">
                <div className="message-content">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="success-message slide-in-down">
                <div className="message-content">
                  <FaCheckCircle className="success-icon" />
                  <span>{success}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Step 3: Forgot Password Email */}
      {step === 3 && (
        <div className="credentials-step slide-in-left">
          <div className="step-header">
            <div className="step-icon-container">
              <FaShieldAlt className="step-icon forgot-password-icon" />
            </div>
            <h3>Reset Your Password</h3>
            <p>Enter your registered email address to receive a password reset code</p>
          </div>

          <form onSubmit={handleForgotPasswordEmailSubmit}>
            <div className="input-group">
              <label>
                <FaEnvelope className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="error-message slide-in-down">
                <div className="message-content">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="success-message slide-in-down">
                <div className="message-content">
                  <FaCheckCircle className="success-icon" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading} 
                className={`submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? <FaSpinner className="spinner" /> : <FaMailBulk />}
                {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
              </button>
              
              <div className="back-to-login">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="back-btn"
                >
                  <FaArrowLeft />
                  Back to Login
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Forgot Password OTP */}
      {step === 4 && (
        <div className="otp-step slide-in-right">
          <div className="step-header">
            <div className="step-icon-container">
              <FaUserLock className="step-icon forgot-password-otp-icon" />
            </div>
            <h3>Enter Reset Code</h3>
            <p>We've sent a 6-digit code to <strong>{maskEmail(forgotPasswordEmail)}</strong></p>
          </div>

          <form onSubmit={(e) => handleForgotPasswordOTPVerify(e)}>
            <div className="otp-container">
              <div className="otp-inputs" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={() => setFocusedInput(index)}
                    className={`otp-input ${focusedInput === index ? 'focused' : ''} ${digit ? 'filled' : ''}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <div className="otp-timer">
                {countdown > 0 ? (
                  <div className="timer-container">
                    <div className="timer-icon">
                      <FaClock />
                    </div>
                    <div className="timer-text">Code expires in</div>
                    <div className="timer-countdown">{formatTime(countdown)}</div>
                    <div className="timer-note">You can resend when timer expires</div>
                  </div>
                ) : (
                  <div className="resend-container">
                    <button 
                      type="button" 
                      onClick={handleResendForgotPasswordOTP}
                      className={`resend-btn ${resendLoading ? 'loading' : ''}`}
                      disabled={resendLoading || resendAttempts >= 3}
                    >
                      {resendLoading ? <FaSpinner className="spinner" /> : <FaRedo />}
                      {getResendButtonText()}
                    </button>
                    {resendAttempts >= 3 && (
                      <p className="resend-limit">Resend limit reached. Please try again later.</p>
                    )}
                  </div>
                )}
              </div>
              
              {resendAttempts > 0 && (
                <div className="resend-attempts-footer">
                  <p>Resend attempts: {resendAttempts}/3</p>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message slide-in-down">
                <div className="message-content">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="success-message slide-in-down">
                <div className="message-content">
                  <FaCheckCircle className="success-icon" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <div className="button-group">
              <button 
                type="button" 
                onClick={() => setStep(3)}
                className="back-btn"
              >
                <FaArrowLeft />
                Back to Email
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5: Reset Password */}
      {step === 5 && (
        <div className="credentials-step slide-in-left">
          <div className="step-header">
            <div className="step-icon-container">
              <FaLockOpen className="step-icon reset-password-icon" />
            </div>
            <h3>Set New Password</h3>
            <p>Create a strong password for your account</p>
          </div>

          <form onSubmit={handlePasswordReset}>
            <div className="input-group">
              <label>
                <FaLock className="label-icon" />
                New Password
              </label>
              <div className="input-wrapper password-input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePasswordStrength(e.target.value);
                  }}
                  placeholder="Enter your new password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="password-strength-indicator">
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
                      <FaCheck />
                      At least 8 characters
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.uppercase ? 'met' : 'unmet'}`}>
                      <FaCheck />
                      Uppercase letter
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.lowercase ? 'met' : 'unmet'}`}>
                      <FaCheck />
                      Lowercase letter
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.number ? 'met' : 'unmet'}`}>
                      <FaCheck />
                      Number
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.special ? 'met' : 'unmet'}`}>
                      <FaCheck />
                      Special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>
                <FaLock className="label-icon" />
                Confirm New Password
              </label>
              <div className="input-wrapper password-input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message slide-in-down">
                <div className="message-content">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="success-message slide-in-down">
                <div className="message-content">
                  <FaCheckCircle className="success-icon" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading} 
                className={`submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? <FaSpinner className="spinner" /> : <FaLockOpen />}
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
              
              <div className="back-to-login">
                <button 
                  type="button" 
                  onClick={() => setStep(4)}
                  className="back-btn"
                >
                  <FaArrowLeft />
                  Back to OTP
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OTPLogin;