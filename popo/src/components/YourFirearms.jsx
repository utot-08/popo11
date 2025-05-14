import { useState, useEffect } from 'react';
import { ListChecks, Shield, Plus, Lock, Archive, Skull } from 'lucide-react';
import '../styles/YourFirearms.css';
import { useAuth } from '../context/AuthContext';

const YourFirearms = () => {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFirearm, setSelectedFirearm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    const fetchFirearms = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/owners/');
        if (!response.ok) {
          throw new Error('Failed to fetch firearms data');
        }
        const data = await response.json();
        console.log(user)
        // Find the owner you want to display (using "yeah yeah" as example)
        const owner = data.find(owner => owner.full_legal_name === user.first_name + ' ' + user.last_name);
        if (owner) {
          setFirearms(owner.firearms);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFirearms();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'deposit':
        return 'status-deposit';
      case 'surrendered':
        return 'status-surrendered';
      case 'confiscated':
        return 'status-confiscated';
      case 'abandoned':
        return 'status-abandon';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'deposit':
        return 'On Deposit';
      case 'surrendered':
        return 'Surrendered';
      case 'confiscated':
        return 'Confiscated';
      case 'abandoned':
        return 'Abandoned';
      default:
        return status; // Return the original status if not matched
    }
  };

  const getFirearmIcon = (gunType) => {
    switch(gunType) {
      case 'handgun':
        return <Shield size={24} />;
      case 'rifle':
        return <Archive size={24} />;
      case 'submachine':
        return <Lock size={24} />;
      default:
        return <Skull size={24} />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewDetails = (firearm) => {
    setSelectedFirearm(firearm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFirearm(null);
  };

  if (loading) return <div className="loading">Loading firearms data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="firearms-content">
      <div className="firearms-header">
        <h2><ListChecks size={24} /> Your Registered Firearms ({firearms.length})</h2>
        {/* <button className="add-firearm-btn">
          <Plus size={16} /> Register New Firearm
        </button> */}
      </div>
      
      {firearms.length === 0 ? (
        <div className="no-firearms">No firearms registered under your name.</div>
      ) : (
        <div className="firearms-grid">
          {firearms.map((firearm) => (
            <div className="firearm-card" key={firearm.serial_number}>
              <div className="firearm-header">
                <div className="firearm-icon">
                  {getFirearmIcon(firearm.gun_type)}
                </div>
                <span className={`firearm-status ${getStatusColor(firearm.firearm_status)}`}>
                  {getStatusText(firearm.firearm_status)}
                </span>
              </div>
              <div className="firearm-details">
                <h3>{firearm.gun_model}</h3>
                <p><strong>Serial:</strong> {firearm.serial_number}</p>
                <p><strong>Type:</strong> {firearm.gun_type}</p>
                <p><strong>Collected:</strong> {formatDate(firearm.date_of_collection)}</p>
              </div>
              <button 
                className="firearm-action"
                onClick={() => handleViewDetails(firearm)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing firearm details */}
{showModal && selectedFirearm && (
  <div className="firearm-modal-overlay">
    <div className="firearm-modal-content">
      <div className="firearm-modal-header">
        <h3>{selectedFirearm.gun_model} Details</h3>
        <button className="firearm-modal-close" onClick={closeModal}>&times;</button>
      </div>
      <div className="firearm-modal-body">
        <div className="firearm-modal-detail">
          <strong>Serial Number:</strong>
          <span>{selectedFirearm.serial_number}</span>
        </div>
        <div className="firearm-modal-detail">
          <strong>Type:</strong>
          <span>{selectedFirearm.gun_type}</span>
        </div>
        <div className="firearm-modal-detail">
          <strong>Ammunition:</strong>
          <span>{selectedFirearm.ammunition_type}</span>
        </div>
        <div className="firearm-modal-detail">
          <strong>Status:</strong>
          <span className={`${getStatusColor(selectedFirearm.firearm_status)}`}>
            {getStatusText(selectedFirearm.firearm_status)}
          </span>
        </div>
        <div className="firearm-modal-detail">
          <strong>Collection Date:</strong>
          <span>{formatDate(selectedFirearm.date_of_collection)}</span>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default YourFirearms;