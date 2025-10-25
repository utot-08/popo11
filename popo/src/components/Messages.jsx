import { useState, useEffect } from 'react';
import { 
  Mail, Search, ChevronDown, ChevronUp, Send, 
  Paperclip, Trash2, Archive, Clock, Check, CheckCheck,
  User, Users, Plus, MoreVertical, X
} from 'lucide-react';
import '../styles/Messages.css';

const Messages = () => {
  // Sample data - in a real app, you would fetch this from an API
  const [clients, setClients] = useState([
    { id: 1, name: 'Django James', email: 'djangoJames@example.com', unread: 2, lastMessage: 'About the firearm registration...', time: '10:30 AM' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@example.com', unread: 0, lastMessage: 'I have submitted the documents', time: 'Yesterday' },
    { id: 3, name: 'Michael Brown', email: 'michael.b@example.com', unread: 5, lastMessage: 'Need help with license renewal', time: '2 days ago' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', unread: 0, lastMessage: 'Thank you for your assistance!', time: '1 week ago' },
    { id: 5, name: 'Robert Wilson', email: 'robert.w@example.com', unread: 1, lastMessage: 'Question about my application', time: '3 weeks ago' },
  ]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load messages when a client is selected
  useEffect(() => {
    if (selectedClient) {
      // In a real app, you would fetch messages for this client from an API
      const sampleMessages = [
        {
          id: 1,
          sender: 'You',
          content: 'Hello, how can I assist you with your firearm registration?',
          time: '10:30 AM',
          status: 'read',
          isYou: true
        },
        {
          id: 2,
          sender: selectedClient.name,
          content: 'I need a help submitting the required documents.',
          time: '10:32 AM',
          status: 'read',
          isYou: false
        },
        {
          id: 3,
          sender: 'You',
          content: 'Please send me the scanned copies of your ID and proof of residence',
          time: '10:35 AM',
          status: 'delivered',
          isYou: true
        }
      ];
      setMessages(sampleMessages);
    }
  }, [selectedClient]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      content: newMessage,
      time: 'Just now',
      status: 'sent',
      isYou: true
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // In a real app, you would send this to your backend API
    // which would then send the email to the client
    console.log('Email sent to:', selectedClient.email);
    console.log('Message:', newMessage);
    console.log('Attachments:', attachments);
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const markAsRead = (clientId) => {
    setClients(clients.map(client => 
      client.id === clientId ? { ...client, unread: 0 } : client
    ));
  };

  return (
    <div className="messages-container">
      {/* Clients List */}
      <div className="clients-list">
        <div className="clients-header">
          <h2>Messages</h2>
          <div className="search-box">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="clients-scrollable">
          {filteredClients.map(client => (
            <div 
              key={client.id}
              className={`client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedClient(client);
                markAsRead(client.id);
              }}
            >
              <div className="client-avatar">
                <User />
              </div>
              <div className="client-info">
                <div className="client-name">{client.name}</div>
                <div className="client-last-message">{client.lastMessage}</div>
              </div>
              <div className="client-meta">
                <div className="client-time">{client.time}</div>
                {client.unread > 0 && (
                  <div className="unread-badge">{client.unread}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="message-area">
        {selectedClient ? (
          <>
            <div className="message-header">
              <div className="client-details">
                <div className="client-avatar">
                  <User />
                </div>
                <div>
                  <div className="client-name">{selectedClient.name}</div>
                  <div className="client-email">{selectedClient.email}</div>
                </div>
              </div>
              <div className="message-actions">
                <button className="action-btn">
                  <Archive size={18} />
                </button>
                <button className="action-btn">
                  <Trash2 size={18} />
                </button>
                <div className="dropdown-container">
                  <button 
                    className="action-btn"
                    onClick={() => setShowClientDropdown(!showClientDropdown)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showClientDropdown && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item">
                        <User size={16} />
                        <span>View Profile</span>
                      </div>
                      <div className="dropdown-item">
                        <Mail size={16} />
                        <span>Email History</span>
                      </div>
                      <div className="dropdown-item">
                        <Users size={16} />
                        <span>Add to Group</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="messages-scrollable">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.isYou ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-meta">
                    <span className="message-time">{message.time}</span>
                    {message.isYou && (
                      <span className="message-status">
                        {message.status === 'sent' && <Check size={14} />}
                        {message.status === 'delivered' && <CheckCheck size={14} />}
                        {message.status === 'read' && <CheckCheck size={14} className="read" />}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="message-composer">
              {attachments.length > 0 && (
                <div className="attachments-preview">
                  {attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <span>{file.name}</span>
                      <button onClick={() => removeAttachment(index)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="composer-toolbar">
                <label className="attachment-btn">
                  <Paperclip size={20} />
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleAttachment}
                    style={{ display: 'none' }}
                  />
                </label>
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-client-selected">
            <Mail size={48} className="mail-icon" />
            <h3>Select a client to start messaging</h3>
            <p>Choose from your client list on the left to view and send messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;