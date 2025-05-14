import { useState, useEffect } from 'react';
import {
  Radio, MapPin, Users, Car, AlertCircle,
  Clock, CheckCircle, Phone, Plus, Search,
  ChevronDown, Filter, RefreshCw, MoreVertical,
  MessageSquare, PhoneCall, Clipboard, User
} from 'lucide-react';
import '../styles/Dispatch.css';

const Dispatch = () => {
  // Sample data - in a real app, you would fetch this from an API
  const [activeCalls, setActiveCalls] = useState([
    {
      id: 1,
      callType: 'Robbery in Progress',
      location: '123 Main St',
      time: '14:32',
      units: ['Unit 12', 'Unit 45'],
      status: 'active',
      priority: 'high',
      caller: 'John Smith',
      callerPhone: '(555) 123-4567',
      details: 'Armed robbery at convenience store. Suspect wearing black hoodie, last seen heading west on foot.'
    },
    {
      id: 2,
      callType: 'Domestic Disturbance',
      location: '456 Oak Ave',
      time: '13:45',
      units: ['Unit 33'],
      status: 'pending',
      priority: 'medium',
      caller: 'Sarah Johnson',
      callerPhone: '(555) 234-5678',
      details: 'Verbal argument between couple. No weapons reported.'
    },
    {
      id: 3,
      callType: 'Traffic Accident',
      location: 'Highway 101 at Exit 42',
      time: '12:18',
      units: ['Unit 7', 'Unit 19'],
      status: 'resolved',
      priority: 'medium',
      caller: 'Michael Brown',
      callerPhone: '(555) 345-6789',
      details: 'Two-vehicle collision with minor injuries. Road partially blocked.'
    }
  ]);

  const [units, setUnits] = useState([
    { id: 1, number: 'Unit 12', officer: 'Officer Smith', status: 'on-scene', location: '123 Main St' },
    { id: 2, number: 'Unit 45', officer: 'Officer Johnson', status: 'en-route', location: 'Approaching Main St' },
    { id: 3, number: 'Unit 33', officer: 'Officer Williams', status: 'available', location: 'Station 2' },
    { id: 4, number: 'Unit 7', officer: 'Officer Brown', status: 'on-break', location: 'HQ' },
    { id: 5, number: 'Unit 19', officer: 'Officer Davis', status: 'available', location: 'Patrol Area 3' }
  ]);

  const [selectedCall, setSelectedCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [newCall, setNewCall] = useState({
    callType: '',
    location: '',
    caller: '',
    phone: '',
    details: ''
  });
  const [showCallForm, setShowCallForm] = useState(false);

  const callTypes = [
    'Robbery in Progress',
    'Domestic Disturbance',
    'Traffic Accident',
    'Suspicious Person',
    'Burglary',
    'Assault',
    'Medical Emergency',
    'Other'
  ];

  const filters = [
    { id: 'all', label: 'All Calls' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'high', label: 'High Priority' }
  ];

  const filteredCalls = activeCalls.filter(call => {
    const matchesSearch = call.callType.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         call.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && call.status === 'active') ||
      (filter === 'pending' && call.status === 'pending') ||
      (filter === 'high' && call.priority === 'high');
    return matchesSearch && matchesFilter;
  });

  const handleCreateCall = () => {
    if (!newCall.callType || !newCall.location) return;

    const call = {
      id: activeCalls.length + 1,
      callType: newCall.callType,
      location: newCall.location,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      units: [],
      status: 'pending',
      priority: 'medium',
      caller: newCall.caller,
      callerPhone: newCall.phone,
      details: newCall.details
    };

    setActiveCalls([...activeCalls, call]);
    setNewCall({ callType: '', location: '', caller: '', phone: '', details: '' });
    setShowCallForm(false);
  };

  const assignUnit = (callId, unitNumber) => {
    setActiveCalls(activeCalls.map(call => {
      if (call.id === callId) {
        return {
          ...call,
          units: [...call.units, unitNumber],
          status: 'active'
        };
      }
      return call;
    }));

    setUnits(units.map(unit => {
      if (unit.number === unitNumber) {
        return {
          ...unit,
          status: 'en-route'
        };
      }
      return unit;
    }));
  };

  const updateCallStatus = (callId, status) => {
    setActiveCalls(activeCalls.map(call => {
      if (call.id === callId) {
        return {
          ...call,
          status: status
        };
      }
      return call;
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'var(--error-color)';
      case 'pending':
        return 'var(--warning-color)';
      case 'resolved':
        return 'var(--success-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high':
        return <AlertCircle className="priority-icon high" />;
      case 'medium':
        return <Clock className="priority-icon medium" />;
      default:
        return <CheckCircle className="priority-icon low" />;
    }
  };

  return (
    <div className="dispatch-container">
      {/* Calls List */}
      <div className="calls-list">
        <div className="list-header">
          <h2>Dispatch Calls</h2>
          <div className="controls">
            <div className="search-box">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="new-call-btn"
              onClick={() => setShowCallForm(true)}
            >
              <Plus size={18} />
              <span>New Call</span>
            </button>
          </div>
          <div className="filters">
            {filters.map(f => (
              <button
                key={f.id}
                className={`filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="calls-scrollable">
          {filteredCalls.map(call => (
            <div 
              key={call.id}
              className={`call-item ${selectedCall?.id === call.id ? 'selected' : ''}`}
              onClick={() => setSelectedCall(call)}
            >
              <div className="call-header">
                <div className="call-type">
                  {getPriorityIcon(call.priority)}
                  <span>{call.callType}</span>
                </div>
                <div 
                  className="call-status"
                  style={{ color: getStatusColor(call.status) }}
                >
                  {call.status}
                </div>
              </div>
              <div className="call-location">
                <MapPin size={16} />
                <span>{call.location}</span>
              </div>
              <div className="call-meta">
                <div className="call-time">
                  <Clock size={16} />
                  <span>{call.time}</span>
                </div>
                <div className="call-units">
                  <Users size={16} />
                  <span>{call.units.join(', ') || 'No units assigned'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call Detail */}
      <div className="call-detail">
        {selectedCall ? (
          <>
            <div className="detail-header">
              <div className="call-title">
                <h3>{selectedCall.callType}</h3>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedCall.status) }}
                >
                  {selectedCall.status}
                </div>
              </div>
              <div className="call-actions">
                <button className="action-btn">
                  <RefreshCw size={18} />
                </button>
                <button className="action-btn">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h4>Call Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{selectedCall.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Time Received:</span>
                    <span className="info-value">{selectedCall.time}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Priority:</span>
                    <span className="info-value">{selectedCall.priority}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Assigned Units:</span>
                    <span className="info-value">
                      {selectedCall.units.length > 0 ? selectedCall.units.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Caller Information</h4>
                <div className="caller-info">
                  <div className="caller-avatar">
                    <User size={20} />
                  </div>
                  <div className="caller-details">
                    <div className="caller-name">{selectedCall.caller}</div>
                    <div className="caller-phone">
                      <Phone size={16} />
                      <span>{selectedCall.callerPhone}</span>
                    </div>
                  </div>
                  <button className="call-btn">
                    <PhoneCall size={18} />
                    <span>Call Back</span>
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <h4>Call Details</h4>
                <div className="call-details">
                  {selectedCall.details}
                </div>
              </div>

              <div className="detail-section">
                <h4>Available Units</h4>
                <div className="units-grid">
                  {units.filter(unit => unit.status === 'available').map(unit => (
                    <div key={unit.id} className="unit-card">
                      <div className="unit-header">
                        <span className="unit-number">{unit.number}</span>
                        <span className="unit-status">{unit.status}</span>
                      </div>
                      <div className="unit-officer">{unit.officer}</div>
                      <div className="unit-location">
                        <MapPin size={14} />
                        <span>{unit.location}</span>
                      </div>
                      <button 
                        className="assign-btn"
                        onClick={() => assignUnit(selectedCall.id, unit.number)}
                      >
                        Assign to Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-actions">
                <button 
                  className="action-btn resolve"
                  onClick={() => updateCallStatus(selectedCall.id, 'resolved')}
                  disabled={selectedCall.status === 'resolved'}
                >
                  <CheckCircle size={18} />
                  <span>Mark Resolved</span>
                </button>
                <button className="action-btn note">
                  <Clipboard size={18} />
                  <span>Add Note</span>
                </button>
                <button className="action-btn message">
                  <MessageSquare size={18} />
                  <span>Message Units</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-call-selected">
            <Radio size={48} />
            <h3>Select a call to view details</h3>
            <p>Choose a call from the list to view and manage dispatch information</p>
          </div>
        )}
      </div>

      {/* New Call Modal */}
      {showCallForm && (
        <div className="new-call-modal">
          <div className="modal-header">
            <h3>Create New Dispatch Call</h3>
            <button onClick={() => setShowCallForm(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Call Type</label>
              <select
                value={newCall.callType}
                onChange={(e) => setNewCall({...newCall, callType: e.target.value})}
              >
                <option value="">Select call type</option>
                {callTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newCall.location}
                onChange={(e) => setNewCall({...newCall, location: e.target.value})}
                placeholder="Enter location"
              />
            </div>
            <div className="form-group">
              <label>Caller Name</label>
              <input
                type="text"
                value={newCall.caller}
                onChange={(e) => setNewCall({...newCall, caller: e.target.value})}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Caller Phone</label>
              <input
                type="text"
                value={newCall.phone}
                onChange={(e) => setNewCall({...newCall, phone: e.target.value})}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Details</label>
              <textarea
                value={newCall.details}
                onChange={(e) => setNewCall({...newCall, details: e.target.value})}
                placeholder="Enter call details"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="create-btn"
              onClick={handleCreateCall}
              disabled={!newCall.callType || !newCall.location}
            >
              Create Call
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setShowCallForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;