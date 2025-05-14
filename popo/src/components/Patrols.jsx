import { useState, useEffect } from 'react';
import { Car, MapPin, Users, Clock, Calendar, Search, Map, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Patrols.css';


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LiveMap = ({ patrols }) => {
  const map = useMap();

  // Fit map to show all markers
  useEffect(() => {
    if (patrols.length > 0) {
      const bounds = L.latLngBounds(patrols.map(p => p.coordinates));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [patrols, map]);

  return null;
};

const Patrols = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bacnotan coordinates (centered on Municipal Hall)
  const bacnotanCenter = [16.7222, 120.3525];

  // Patrol data with Bacnotan locations
  const patrolData = {
    active: [
      {
        id: 1,
        unit: 'Patrol 1',
        officers: ['Officer Reyes', 'Officer Castro'],
        location: 'Bacnotan Town Proper',
        status: 'On Duty',
        startTime: '08:00',
        duration: '4h 22m',
        lastCheckIn: new Date().toLocaleTimeString(),
        coordinates: [16.7222, 120.3525] // Municipal Hall
      },
      {
        id: 2,
        unit: 'Patrol 2',
        officers: ['Officer Aquino'],
        location: 'Bacsil District',
        status: 'On Duty',
        startTime: '10:00',
        duration: '2h 45m',
        lastCheckIn: new Date().toLocaleTimeString(),
        coordinates: [16.7324, 120.3581] // Bacsil Elementary School
      },
      {
        id: 3,
        unit: 'Patrol 3',
        officers: ['Officer Dela Cruz', 'Officer Mendoza'],
        location: 'Cabaroan Area',
        status: 'On Duty',
        startTime: '09:30',
        duration: '3h 15m',
        lastCheckIn: new Date().toLocaleTimeString(),
        coordinates: [16.7156, 120.3478] // Near Bacnotan National High School
      }
    ],
    scheduled: [
      {
        id: 4,
        unit: 'Patrol 4',
        officers: ['Officer Gonzales', 'Officer Ramos'],
        location: 'Poblacion Market Area',
        status: 'Scheduled',
        startTime: '16:00',
        duration: '8h 00m (planned)',
        coordinates: [16.7210, 120.3512] // Public Market
      },
      {
        id: 5,
        unit: 'Patrol 5',
        officers: ['Officer Torres', 'Officer Santos'],
        location: 'Bacnotan Beach Area',
        status: 'Scheduled',
        startTime: '18:00',
        duration: '6h 00m (planned)',
        coordinates: [16.7278, 120.3441] // Near Bacnotan Beach
      }
    ],
    completed: [
      {
        id: 6,
        unit: 'Patrol 6',
        officers: ['Officer Fernandez', 'Officer Gutierrez'],
        location: 'Barangay Bulala',
        status: 'Completed',
        startTime: '06:00',
        endTime: '14:00',
        duration: '8h 00m',
        coordinates: [16.7089, 120.3623] // Barangay Hall
      },
      {
        id: 7,
        unit: 'Patrol 7',
        officers: ['Officer Rivera', 'Officer Ocampo'],
        location: 'Bacnotan Industrial Area',
        status: 'Completed',
        startTime: '12:00',
        endTime: '20:00',
        duration: '8h 00m',
        coordinates: [16.7183, 120.3407] // Industrial Zone
      }
    ]
  };

  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredPatrols = patrolData[activeTab].filter(patrol =>
    patrol.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patrol.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patrol.officers.some(officer => 
      officer.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const activePatrols = patrolData.active;

  return (
    <div className="patrols-container">
      <div className="patrols-header">
        <h2>Bacnotan, La Union Patrol Management</h2>
        <div className="patrols-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search patrols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="patrols-tabs">
        <button 
          className={activeTab === 'active' ? 'active' : ''}
          onClick={() => setActiveTab('active')}
        >
          <Car size={18} /> Active Patrols ({patrolData.active.length})
        </button>
        <button 
          className={activeTab === 'scheduled' ? 'active' : ''}
          onClick={() => setActiveTab('scheduled')}
        >
          <Calendar size={18} /> Scheduled ({patrolData.scheduled.length})
        </button>
        <button 
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          <Clock size={18} /> Completed ({patrolData.completed.length})
        </button>
      </div>

      <div className="patrols-list">
        {filteredPatrols.length > 0 ? (
          filteredPatrols.map((patrol) => (
            <div key={patrol.id} className="patrol-card">
              <div className="patrol-card-header">
                <h3>{patrol.unit}</h3>
                <span className={`status-badge ${patrol.status.toLowerCase().replace(' ', '-')}`}>
                  {patrol.status}
                </span>
              </div>
              <div className="patrol-card-body">
                <div className="info-row">
                  <Users size={16} />
                  <span>{patrol.officers.join(', ')}</span>
                </div>
                <div className="info-row">
                  <MapPin size={16} />
                  <span>{patrol.location}</span>
                </div>
                <div className="info-row">
                  <Clock size={16} />
                  <span>Started: {patrol.startTime}</span>
                  {patrol.endTime && <span>Ended: {patrol.endTime}</span>}
                </div>
              </div>
              <div className="patrol-card-actions">
                <div className="last-checkin">
                  Last check-in: {patrol.lastCheckIn || 'N/A'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No patrols found matching your search.</p>
          </div>
        )}
      </div>

      {/* Live Map Section */}
      <div className="live-map-section">
        <div className="section-header">
          <h3>Bacnotan Patrol Locations</h3>
          <div className="map-controls">
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        <MapContainer 
          center={bacnotanCenter}
          zoom={14} 
          style={{ height: '500px', width: '100%' }}
          className="live-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {activePatrols.map((patrol) => (
            <Marker key={patrol.id} position={patrol.coordinates}>
              <Popup>
                <div className="map-popup">
                  <h4>{patrol.unit}</h4>
                  <p><strong>Officers:</strong> {patrol.officers.join(', ')}</p>
                  <p><strong>Location:</strong> {patrol.location}</p>
                  <p><strong>Status:</strong> {patrol.status}</p>
                  <p><strong>Last Check-In:</strong> {patrol.lastCheckIn}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <LiveMap patrols={activePatrols} />
        </MapContainer>
      </div>
    </div>
  );
};

export default Patrols;