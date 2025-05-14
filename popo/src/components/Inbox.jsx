import { useState } from 'react';
import { 
  Inbox, Search, ChevronDown, ChevronUp, Mail, 
  Star, Archive, Trash2, AlertCircle, Clock, 
  CheckCircle, User, Shield, FileText, Filter,
  RefreshCw, MoreVertical, Paperclip, Reply, Forward,
  Plus, X
} from 'lucide-react';
import '../styles/Inbox.css';


const InboxComponent = () => {
  // Sample data - in a real app, you would fetch this from an API
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'Dispatch Center',
      subject: 'Urgent: BOLO Alert - Stolen Vehicle',
      content: 'Be on the lookout for a stolen black 2020 Toyota Camry, license plate ABC123. Last seen heading north on Main St. Suspect armed and dangerous.',
      time: '10:15 AM',
      date: 'Today',
      read: false,
      starred: true,
      priority: 'high',
      category: 'alert'
    },
    {
      id: 2,
      from: 'Chief of Police',
      subject: 'Monthly Department Meeting',
      content: 'Reminder: Monthly department meeting this Friday at 0900 hours in the main briefing room. All officers must attend.',
      time: 'Yesterday',
      date: 'Jun 12',
      read: true,
      starred: false,
      priority: 'medium',
      category: 'announcement'
    },
    {
      id: 3,
      from: 'Evidence Locker',
      subject: 'Firearm Check-in Confirmation #45892',
      content: 'The firearm (Serial: XJ45892) has been successfully checked into the evidence locker. Case #2023-0458.',
      time: 'Jun 11',
      date: 'Jun 11',
      read: true,
      starred: false,
      priority: 'low',
      category: 'confirmation'
    },
    {
      id: 4,
      from: 'Patrol Supervisor',
      subject: 'Shift Change Notification',
      content: 'Your shift has been changed from Day to Evening effective next Monday. Please confirm receipt of this message.',
      time: 'Jun 10',
      date: 'Jun 10',
      read: false,
      starred: true,
      priority: 'medium',
      category: 'notification'
    },
    {
      id: 5,
      from: 'Training Division',
      subject: 'Firearms Recertification Required',
      content: 'Your firearms certification expires in 30 days. Please schedule your recertification test at the range.',
      time: 'Jun 8',
      date: 'Jun 8',
      read: true,
      starred: false,
      priority: 'high',
      category: 'reminder'
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: ''
  });

  const filters = [
    { id: 'all', label: 'All Messages' },
    { id: 'unread', label: 'Unread' },
    { id: 'starred', label: 'Starred' },
    { id: 'high', label: 'High Priority' },
    { id: 'alerts', label: 'Alerts' }
  ];

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.from.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !message.read) ||
      (filter === 'starred' && message.starred) ||
      (filter === 'high' && message.priority === 'high') ||
      (filter === 'alerts' && message.category === 'alert');
    return matchesSearch && matchesFilter;
  });

  const markAsRead = (id) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const toggleStar = (id, e) => {
    e.stopPropagation();
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const deleteMessage = (id, e) => {
    e.stopPropagation();
    setMessages(messages.filter(msg => msg.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  const handleSendMessage = () => {
    // In a real app, you would send this to your backend
    console.log('Message sent:', newMessage);
    setComposeOpen(false);
    setNewMessage({ to: '', subject: '', content: '' });
    // Add to sent items or show success message
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

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'alert':
        return <Shield className="category-icon alert" />;
      case 'announcement':
        return <FileText className="category-icon announcement" />;
      case 'confirmation':
        return <CheckCircle className="category-icon confirmation" />;
      default:
        return <Mail className="category-icon default" />;
    }
  };

  return (
    <div className="inbox-container">
      {/* Sidebar */}
      <div className="inbox-sidebar">
        <button 
          className="compose-btn"
          onClick={() => setComposeOpen(true)}
        >
          <span>Compose</span>
          <Plus size={18} />
        </button>

        <div className="folder-list">
          <div className="folder active">
            <Inbox size={18} />
            <span>Inbox</span>
            <span className="badge">{messages.filter(m => !m.read).length}</span>
          </div>
          <div className="folder">
            <Star size={18} />
            <span>Starred</span>
          </div>
          <div className="folder">
            <Clock size={18} />
            <span>Scheduled</span>
          </div>
          <div className="folder">
            <Archive size={18} />
            <span>Archive</span>
          </div>
          <div className="folder">
            <Trash2 size={18} />
            <span>Trash</span>
          </div>
        </div>

        <div className="filter-section">
          <h4>Filters</h4>
          {filters.map(f => (
            <div 
              key={f.id}
              className={`filter-item ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              <span>{f.label}</span>
              {filter === f.id && <span className="count">
                {f.id === 'all' ? messages.length :
                 f.id === 'unread' ? messages.filter(m => !m.read).length :
                 f.id === 'starred' ? messages.filter(m => m.starred).length :
                 f.id === 'high' ? messages.filter(m => m.priority === 'high').length :
                 messages.filter(m => m.category === 'alert').length}
              </span>}
            </div>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="message-list">
        <div className="list-header">
          <div className="search-box">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="action-btn">
              <RefreshCw size={18} />
            </button>
            <button className="action-btn">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="messages-scrollable">
          {filteredMessages.length > 0 ? (
            filteredMessages.map(message => (
              <div 
                key={message.id}
                className={`message-item ${!message.read ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  markAsRead(message.id);
                }}
              >
                <div className="message-checkbox">
                  <input type="checkbox" />
                </div>
                <div className="message-star" onClick={(e) => toggleStar(message.id, e)}>
                  <Star 
                    size={18} 
                    fill={message.starred ? 'currentColor' : 'none'} 
                    className={message.starred ? 'starred' : ''}
                  />
                </div>
                <div className="message-sender">
                  <div className="sender-icon">
                    {getCategoryIcon(message.category)}
                  </div>
                  <span>{message.from}</span>
                </div>
                <div className="message-content">
                  <div className="message-subject">
                    <span>{message.subject}</span>
                    {getPriorityIcon(message.priority)}
                  </div>
                  <div className="message-preview">
                    {message.content.substring(0, 60)}...
                  </div>
                </div>
                <div className="message-time">
                  <span>{message.time}</span>
                  <span>{message.date}</span>
                </div>
                <div className="message-actions">
                  <button 
                    className="action-btn" 
                    onClick={(e) => deleteMessage(message.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="action-btn">
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <Inbox size={48} />
              <h3>No messages found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="message-detail">
        {selectedMessage ? (
          <>
            <div className="detail-header">
              <div className="message-subject">
                <h2>{selectedMessage.subject}</h2>
                <div className="priority-badge">
                  {selectedMessage.priority === 'high' ? 'High Priority' :
                   selectedMessage.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                </div>
              </div>
              <div className="message-meta">
                <div className="sender-info">
                  <div className="sender-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="sender-name">{selectedMessage.from}</div>
                    <div className="sender-email">to me</div>
                  </div>
                </div>
                <div className="message-time">
                  <span>{selectedMessage.time}</span>
                  <span>{selectedMessage.date}</span>
                </div>
              </div>
              <div className="message-actions">
                <button className="action-btn">
                  <Reply size={18} />
                  <span>Reply</span>
                </button>
                <button className="action-btn">
                  <Forward size={18} />
                  <span>Forward</span>
                </button>
                <button className="action-btn">
                  <Trash2 size={18} />
                </button>
                <button className="action-btn">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="message-body">
              <div className="body-content">
                {selectedMessage.content}
              </div>
              {selectedMessage.category === 'alert' && (
                <div className="alert-notice">
                  <AlertCircle size={20} />
                  <span>This is an official police alert. Please take appropriate action.</span>
                </div>
              )}
            </div>

            <div className="message-footer">
              <button className="reply-btn">
                <Reply size={16} />
                <span>Reply</span>
              </button>
              <button className="forward-btn">
                <Forward size={16} />
                <span>Forward</span>
              </button>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <Mail size={48} />
            <h3>Select a message to read</h3>
            <p>Choose a message from the list to view its contents</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="compose-modal">
          <div className="compose-header">
            <h3>New Message</h3>
            <button onClick={() => setComposeOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="compose-body">
            <div className="compose-field">
              <label>To:</label>
              <input 
                type="text" 
                value={newMessage.to}
                onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
              />
            </div>
            <div className="compose-field">
              <label>Subject:</label>
              <input 
                type="text" 
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              />
            </div>
            <div className="compose-content">
              <textarea 
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                placeholder="Type your message here..."
              />
            </div>
            <div className="compose-attachments">
              <button className="attach-btn">
                <Paperclip size={16} />
                <span>Attach File</span>
              </button>
            </div>
          </div>
          <div className="compose-footer">
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.to || !newMessage.subject}
            >
              <Send size={16} />
              <span>Send</span>
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setComposeOpen(false)}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxComponent;