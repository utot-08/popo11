import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSignInAlt } from 'react-icons/fa';
import '../styles/ChangePasswordSuccess.css'; // We'll create this CSS file

const ChangePasswordSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('success-page');
    return () => {
      document.body.classList.remove('success-page');
    };
  }, []);

  const handleClose = () => {
    navigate('/login');
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon animate-pop">
          <FaCheckCircle />
        </div>
        <h2 className="success-title">Password Changed Successfully!</h2>
        <h3 className="success-title">You can now go back to the Login Page</h3>
        {/* <p className="success-message">
          You can now log in with your new password.
        </p>
        <button
          className="success-button animate-bounce"
          onClick={handleClose}
        >
          <FaSignInAlt className="button-icon" />
          Go to Login
        </button> */}
      </div>
    </div>
  );
};

export default ChangePasswordSuccess;
