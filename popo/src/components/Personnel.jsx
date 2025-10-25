import { useState } from 'react';
import { 
  UserCog, UserCheck, User, Shield, BadgeAlert,
  ChevronDown, Search, Filter, Plus, MoreVertical,
  Pencil, Trash2, Mail, Phone, ShieldHalf, Gavel
} from 'lucide-react';
import '../styles/Personnel.css';

const Personnel = () => {
  const [personnel] = useState([
    {
      id: 1,
      name: 'Brian James "The beast" Paragas',
      badgeNumber: 'PD-1245',
      rank: 'Chief',
      department: 'Command Staff',
      email: 'Th3Beast@pd.example.com',
      phone: '(555) 123-4567',
      status: 'active',
      joinDate: '2015-03-12'
    },
    {
      id: 2,
      name: 'Django James',
      badgeNumber: 'PD-1567',
      rank: 'Captain',
      department: 'Patrol Division',
      email: 's.johnson@pd.example.com',
      phone: '(555) 234-5678',
      status: 'active',
      joinDate: '2017-08-22'
    },
    {
      id: 3,
      name: 'Rian Row',
      badgeNumber: 'PD-1890',
      rank: 'Lieutenant',
      department: 'Investigations',
      email: 'm.brown@pd.example.com',
      phone: '(555) 345-6789',
      status: 'active',
      joinDate: '2018-05-15'
    },
    {
      id: 4,
      name: 'Brian Garapata',
      badgeNumber: 'PD-2011',
      rank: 'Sergeant',
      department: 'Traffic Unit',
      email: 'e.davis@pd.example.com',
      phone: '(555) 456-7890',
      status: 'active',
      joinDate: '2019-11-30'
    },
    {
      id: 5,
      name: 'Brian Rest Framework',
      badgeNumber: 'PD-2234',
      rank: 'Officer',
      department: 'Patrol Division',
      email: 'r.wilson@pd.example.com',
      phone: '(555) 567-8901',
      status: 'active',
      joinDate: '2020-02-18'
    },
    {
      id: 6,
      name: 'Pansit ni Brian',
      badgeNumber: 'PD-2456',
      rank: 'Detective',
      department: 'Narcotics',
      email: 'l.miller@pd.example.com',
      phone: '(555) 678-9012',
      status: 'on leave',
      joinDate: '2016-07-09'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('all');
  const [expandedOfficer, setExpandedOfficer] = useState(null);

  const ranks = [
    { value: 'all', label: 'All Ranks' },
    { value: 'Chief', label: 'Chief' },
    { value: 'Captain', label: 'Captain' },
    { value: 'Lieutenant', label: 'Lieutenant' },
    { value: 'Sergeant', label: 'Sergeant' },
    { value: 'Detective', label: 'Detective' },
    { value: 'Officer', label: 'Officer' },
  ];

  const filteredPersonnel = personnel.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         officer.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = filterRank === 'all' || officer.rank === filterRank;
    return matchesSearch && matchesRank;
  });

  const toggleOfficerDetails = (id) => {
    setExpandedOfficer(expandedOfficer === id ? null : id);
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 'Chief': return <Shield className="rank-icon chief" />;
      case 'Captain': return <ShieldHalf className="rank-icon captain" />;
      case 'Lieutenant': return <Gavel className="rank-icon lieutenant" />;
      case 'Sergeant': return <UserCog className="rank-icon sergeant" />;
      case 'Detective': return <UserCheck className="rank-icon detective" />;
      default: return <User className="rank-icon officer" />;
    }
  };

  const getStatusClass = (status) => {
    return status.replace(' ', '-').toLowerCase();
  };

  return (
    <div className="personnel-management">
      <header className="personnel-header">
        <h1>Personnel Management</h1>
        <div className="header-controls">
          <div className="search-control">
            <Search className="control-icon" />
            <input 
              type="text" 
              placeholder="Search by name or badge number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-control">
            <Filter className="control-icon" />
            <select 
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
            >
              {ranks.map(rank => (
                <option key={rank.value} value={rank.value}>{rank.label}</option>
              ))}
            </select>
          </div>
          <button className="add-personnel">
            <Plus className="control-icon" />
            Add Personnel
          </button>
        </div>
      </header>

      <main className="personnel-list-container">
        <div className="list-header">
          <div className="header-col name">Name</div>
          <div className="header-col badge">Badge #</div>
          <div className="header-col rank">Rank</div>
          <div className="header-col department">Department</div>
          <div className="header-col status">Status</div>
          <div className="header-col actions">Actions</div>
        </div>

        {filteredPersonnel.length > 0 ? (
          <div className="personnel-cards">
            {filteredPersonnel.map(officer => (
              <div key={officer.id} className={`personnel-card ${expandedOfficer === officer.id ? 'expanded' : ''}`}>
                <div className="card-main">
                  <div className="card-col name">
                    <div className="avatar">
                      {officer.name.charAt(0)}
                    </div>
                    <span>{officer.name}</span>
                  </div>
                  <div className="card-col badge">{officer.badgeNumber}</div>
                  <div className="card-col rank">
                    {getRankIcon(officer.rank)}
                    <span>{officer.rank}</span>
                  </div>
                  <div className="card-col department">{officer.department}</div>
                  <div className="card-col status">
                    <span className={`status-badge ${getStatusClass(officer.status)}`}>
                      {officer.status}
                    </span>
                  </div>
                  <div className="card-col actions">
                    <button 
                      className="action-btn expand" 
                      onClick={() => toggleOfficerDetails(officer.id)}
                      aria-label={expandedOfficer === officer.id ? 'Collapse details' : 'Expand details'}
                    >
                      <ChevronDown className={`dropdown-icon ${expandedOfficer === officer.id ? 'open' : ''}`} />
                    </button>
                    <button className="action-btn more" aria-label="More options">
                      <MoreVertical />
                    </button>
                  </div>
                </div>

                {expandedOfficer === officer.id && (
                  <div className="card-details">
                    <div className="details-section">
                      <h3>Contact Information</h3>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail className="detail-icon" />
                          <span>{officer.email}</span>
                        </div>
                        <div className="contact-item">
                          <Phone className="detail-icon" />
                          <span>{officer.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="details-section">
                      <h3>Service Details</h3>
                      <div className="service-info">
                        <div className="service-item">
                          <span className="detail-label">Join Date:</span>
                          <span>{new Date(officer.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="service-item">
                          <span className="detail-label">Years of Service:</span>
                          <span>{new Date().getFullYear() - new Date(officer.joinDate).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="detail-actions">
                      <button className="action-button edit">
                        <Pencil className="action-icon" />
                        Edit Profile
                      </button>
                      <button className="action-button message">
                        <Mail className="action-icon" />
                        Send Message
                      </button>
                      <button className="action-button delete">
                        <Trash2 className="action-icon" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <BadgeAlert className="no-results-icon" />
            <p>No personnel found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Personnel;