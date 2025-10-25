import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <Shield className="unauthorized-icon" size={64} />
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div className="unauthorized-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;