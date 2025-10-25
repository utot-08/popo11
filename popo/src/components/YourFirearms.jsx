import { useState, useEffect } from 'react';
import {
  ListChecks,
  Shield,
  Plus,
  Lock,
  Archive,
  Skull,
  Loader2,
  AlertCircle,
  FileSearch,
  Clock,
  ShieldAlert, AlertTriangle
} from 'lucide-react';
import '../styles/YourFirearms.css';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const YourFirearms = () => {
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFirearm, setSelectedFirearm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);



  // Fetch gun data
  useEffect(() => {
    const fetchGunData = async () => {
      try {
        const [typesRes, subtypesRes, modelsRes] = await Promise.all([
          fetch(`${API_BASE_URL}gun-types/`),
          fetch(`${API_BASE_URL}gun-subtypes/`),
          fetch(`${API_BASE_URL}gun-models/`),
        ]);

        const [typesData, subtypesData, modelsData] = await Promise.all([
          typesRes.json(),
          subtypesRes.json(),
          modelsRes.json(),
        ]);

        setGunTypes(typesData);
        setGunSubtypes(subtypesData);
        setGunModels(modelsData);
      } catch (err) {
        console.error('Error fetching gun data:', err);
      }
    };

    fetchGunData();
  }, []);

  // Helper functions to get names from IDs
  const getTypeName = (typeId) => {
    const type = gunTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getSubtypeName = (subtypeId) => {
    const subtype = gunSubtypes.find((s) => s.id === subtypeId);
    return subtype ? subtype.name : 'Unknown Subtype';
  };

  const getModelName = (modelId) => {
    const model = gunModels.find((m) => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  useEffect(() => {
    const fetchFirearms = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}owners/`);
        if (!response.ok) {
          throw new Error('Failed to fetch firearms data');
        }
        const data = await response.json();

        // Find the owner matching the current user
        const owner = data.find(
          (owner) =>
            owner.full_legal_name === `${user.first_name} ${user.last_name}`
        );

        if (owner) {
          // Enhance firearms data with type/subtype/model names
          const enhancedFirearms = owner.firearms.map((firearm) => ({
            ...firearm,
            typeName: getTypeName(firearm.gun_type),
            subtypeName: getSubtypeName(firearm.gun_subtype),
            modelName: firearm.gun_model_details?.name || 'Unknown Model',
          }));
          setFirearms(enhancedFirearms);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFirearms();
  }, [user, gunTypes, gunSubtypes, gunModels]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'captured':
        return 'status-captured';
      case 'confiscated':
        return 'status-confiscated';
      case 'surrendered':
        return 'status-surrendered';
      case 'deposited':
        return 'status-deposited';
      case 'abandoned':
        return 'status-abandoned';
      case 'forfeited':
        return 'status-forfeited';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'captured':
        return 'Captured';
      case 'confiscated':
        return 'Confiscated';
      case 'surrendered':
        return 'Surrendered';
      case 'deposited':
        return 'Deposited';
      case 'abandoned':
        return 'Abandoned';
      case 'forfeited':
        return 'Forfeited';
      default:
        return status;
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

  if (loading)
    return (
      <div className="loading">
        <Loader2 className="animate-spin" size={24} />
        <span>Loading firearms data...</span>
      </div>
    );

  if (error)
    return (
      <div className="error">
        <AlertCircle size={24} />
        <span>Error: {error}</span>
      </div>
    );

  return (
    <div className="firearms-content">
      <div className="firearms-header">
        <h2>
          <ListChecks size={24} /> Your Registered Firearms ({firearms.length})
        </h2>
      </div>

      {firearms.length === 0 ? (
        <div className="no-firearms">
          <FileSearch size={32} />
          <span>No firearms registered under your name.</span>
        </div>
      ) : (
        <div className="firearms-table-container">
          <table className="firearms-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Subtype</th>
                <th>Caliber</th>
                <th>Status</th>
                <th>Collection Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {firearms.map((firearm) => (
                <tr key={firearm.serial_number} className="firearm-row">
                  <td className="firearm-type-cell">
                    <div className="firearm-type">{firearm.typeName}</div>
                  </td>
                  <td className="firearm-model-cell">
                    <div className="firearm-model">{firearm.modelName}</div>
                  </td>
                  <td className="firearm-serial-cell">
                    <div className="firearm-serial">{firearm.serial_number}</div>
                  </td>
                  <td className="firearm-subtype-cell">
                    <div className="firearm-subtype">{firearm.subtypeName}</div>
                  </td>
                  <td className="firearm-caliber-cell">
                    <div className="firearm-caliber">{firearm.ammunition_type}</div>
                  </td>
                  <td className="firearm-status-cell">
                    <span className={`firearm-status ${getStatusColor(firearm.firearm_status)}`}>
                      {getStatusText(firearm.firearm_status)}
                    </span>
                  </td>
                  <td className="firearm-date-cell">
                    <div className="firearm-date">{formatDate(firearm.date_of_collection)}</div>
                  </td>
                  <td className="firearm-actions-cell">
                    <button
                      className="firearm-action-btn"
                      onClick={() => handleViewDetails(firearm)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{showModal && selectedFirearm && (
  <div className="firearm-modal-overlay">
    <div className="firearm-modal-content landscape-modal animate-slide-in">
      <div className="firearm-modal-header">
        <div className="modal-title-group">
          <h3>{selectedFirearm.modelName}</h3>
          <p className="modal-subtitle">{selectedFirearm.typeName} • {selectedFirearm.subtypeName}</p>
        </div>
        <button className="firearm-modal-close" onClick={closeModal}>
          &times;
        </button>
      </div>
      
      <div className="firearm-modal-body landscape-body">
        <div className="modal-column">
          <div className="modal-section">
            <h4 className="section-title">Identification</h4>
            <div className="firearm-modal-detail">
              <strong>Serial Number:</strong>
              <span className="firearm-modal-detail-value highlight">
                {selectedFirearm.serial_number}
              </span>
            </div>
            <div className="firearm-modal-detail">
              <strong>Model:</strong>
              <span className="firearm-modal-detail-value">
                {selectedFirearm.modelName}
              </span>
            </div>
            <div className="firearm-modal-detail">
              <strong>Caliber:</strong>
              <span className="firearm-modal-detail-value">
                {selectedFirearm.ammunition_type}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-column">
          <div className="modal-section">
            <h4 className="section-title">Status</h4>
            <div className="firearm-modal-detail">
              <strong>Current Status:</strong>
              <span className={`firearm-modal-detail-value status-badge ${getStatusColor(selectedFirearm.firearm_status)}`}>
                {getStatusText(selectedFirearm.firearm_status)}
              </span>
            </div>
            <div className="firearm-modal-detail">
              <strong>{getStatusText(selectedFirearm.firearm_status)} Date:</strong>
              <span className="firearm-modal-detail-value date-value">
                {formatDate(selectedFirearm.date_of_collection)}
              </span>
            </div>
          </div>
          
          <div className="modal-section">
            <h4 className="section-title">Notes</h4>
            <div className="status-notes">
              {selectedFirearm.status_comment || 'No additional notes provided'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default YourFirearms;
