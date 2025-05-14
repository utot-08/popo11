import { useState, useEffect } from 'react';
import { 
  UserCog, UserCheck, User, Shield, BadgeAlert,
  ChevronDown, Search, Filter, Plus, MoreVertical,
  Pencil, Trash2, Mail, Phone, ShieldHalf, Gavel
} from 'lucide-react';
import '../styles/Personnel.css';

const Personnel = () => {
  const [personnel, setPersonnel] = useState([
    {
      id: 1,
      name: 'Brian James "The beast" Paragas',
      badgeNumber: 'PD-1245',
      rank: 'Chief',
      department: 'Command Staff',
      email: 'Th3Beast@pd.example.com',
      phone: '(555) 123-4567',
      status: 'active',
      joinDate: '1551-03-12'
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
      name: 'Brian Rest Framwork',
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
    if (expandedOfficer === id) {
      setExpandedOfficer(null);
    } else {
      setExpandedOfficer(id);
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 'Chief':
        return <Shield className="text-yellow-500" />;
      case 'Captain':
        return <ShieldHalf className="text-blue-500" />;
      case 'Lieutenant':
        return <Gavel className="text-green-500" />;
      case 'Sergeant':
        return <UserCog className="text-purple-500" />;
      case 'Detective':
        return <UserCheck className="text-red-500" />;
      default:
        return <User className="text-gray-500" />;
    }
  };

  return (
    <div className="personnel-container">
      <div className="personnel-header">
        <h2>Personnel Management</h2>
        <div className="controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or badge number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <Filter className="filter-icon" />
            <select 
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
            >
              {ranks.map(rank => (
                <option key={rank.value} value={rank.value}>{rank.label}</option>
              ))}
            </select>
          </div>
          <button className="add-button">
            <Plus className="add-icon" />
            Add Personnel
          </button>
        </div>
      </div>

      <div className="personnel-list">
        <div className="list-header">
          <div className="header-item name">Name</div>
          <div className="header-item badge">Badge #</div>
          <div className="header-item rank">Rank</div>
          <div className="header-item department">Department</div>
          <div className="header-item status">Status</div>
          <div className="header-item actions">Actions</div>
        </div>

        {filteredPersonnel.length > 0 ? (
          filteredPersonnel.map(officer => (
            <div key={officer.id} className="personnel-card">
              <div className="card-main">
                <div className="card-item name">
                  <div className="avatar">
                    {officer.name.charAt(0)}
                  </div>
                  <span>{officer.name}</span>
                </div>
                <div className="card-item badge">{officer.badgeNumber}</div>
                <div className="card-item rank">
                  {getRankIcon(officer.rank)}
                  <span>{officer.rank}</span>
                </div>
                <div className="card-item department">{officer.department}</div>
                <div className="card-item status">
                  <span className={`status-badge ${officer.status}`}>
                    {officer.status}
                  </span>
                </div>
                <div className="card-item actions">
                  <button className="action-btn" onClick={() => toggleOfficerDetails(officer.id)}>
                    <ChevronDown className={`dropdown-icon ${expandedOfficer === officer.id ? 'open' : ''}`} />
                  </button>
                  <button className="action-btn">
                    <MoreVertical />
                  </button>
                </div>
              </div>

              {expandedOfficer === officer.id && (
                <div className="card-details">
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="contact-info">
                      <div>
                        <Mail className="contact-icon" />
                        <span>{officer.email}</span>
                      </div>
                      <div>
                        <Phone className="contact-icon" />
                        <span>{officer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Service Details</h4>
                    <div className="service-info">
                      <div>
                        <span className="detail-label">Join Date:</span>
                        <span>{officer.joinDate}</span>
                      </div>
                      <div>
                        <span className="detail-label">Years of Service:</span>
                        <span>{new Date().getFullYear() - new Date(officer.joinDate).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-actions">
                    <button className="detail-action-btn edit">
                      <Pencil className="action-icon" />
                      Edit Profile
                    </button>
                    <button className="detail-action-btn message">
                      <Mail className="action-icon" />
                      Send Message
                    </button>
                    <button className="detail-action-btn delete">
                      <Trash2 className="action-icon" />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <BadgeAlert className="no-results-icon" />
            <p>No personnel found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Personnel;