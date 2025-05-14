import { useState } from 'react';
import {
  Mail, Send, Paperclip, Shield, X,
  Check, CheckCheck, User, Search
} from 'lucide-react';
import '../styles/ClientMessages.css';

const ClientMessages = () => {
  // Sample data - in a real app, you would fetch this from an API
  const [messages, setMessages] = useState([
    {
      id: 1,
      subject: 'Firearm Registration Inquiry',
      content: 'I have questions about the registration process for my new firearm.',
      time: '2 days ago',
      status: 'read',
      isYou: false
    },
    {
      id: 2,
      subject: 'RE: Firearm Registration Inquiry',
      content: 'Thank you for your inquiry. Please visit our office with your ID and proof of purchase.',
      time: 'Yesterday',
      status: 'delivered',
      isYou: true
    },
    {
      id: 3,
      subject: 'Firearm Transfer Request',
      content: 'I would like to transfer ownership of my firearm to a family member.',
      time: '1 hour ago',
      status: 'sent',
      isYou: true
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) return;

    const message = {
      id: messages.length + 1,
      subject: newMessage.subject,
      content: newMessage.content,
      time: 'Just now',
      status: 'sent',
      isYou: true
    };

    setMessages([...messages, message]);
    setNewMessage({ subject: '', content: '' });
    setAttachments([]);
    
    // In a real app, you would send this to your backend API
    console.log('Message sent to police department');
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

  return (
    <div className="client-messages-container">
      {/* Messages List */}
      <div className="messages-list">
        <div className="list-header">
          <h2>Messages to Police</h2>
          <div className="search-box">
            <Search className="search-icon" />
            <input type="text" placeholder="Search messages..." />
          </div>
        </div>

        <div className="messages-scrollable">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
              onClick={() => setSelectedMessage(message)}
            >
              <div className="message-sender">
                {message.isYou ? (
                  <div className="sender-you">You</div>
                ) : (
                  <div className="sender-police">
                    <Shield size={16} />
                    <span>Police Dept</span>
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-subject">{message.subject}</div>
                <div className="message-preview">{message.content.substring(0, 60)}...</div>
              </div>
              <div className="message-meta">
                <div className="message-time">{message.time}</div>
                {message.isYou && (
                  <div className="message-status">
                    {message.status === 'sent' && <Check size={14} />}
                    {message.status === 'delivered' && <CheckCheck size={14} />}
                    {message.status === 'read' && <CheckCheck size={14} className="read" />}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail */}
      <div className="message-detail">
        {selectedMessage ? (
          <>
            <div className="detail-header">
              <div className="message-subject">
                <h3>{selectedMessage.subject}</h3>
              </div>
              <div className="message-meta">
                <div className="sender-info">
                  {selectedMessage.isYou ? (
                    <div className="sender-you">
                      <User size={18} />
                      <span>You</span>
                    </div>
                  ) : (
                    <div className="sender-police">
                      <Shield size={18} />
                      <span>Police Department</span>
                    </div>
                  )}
                </div>
                <div className="message-time">{selectedMessage.time}</div>
              </div>
            </div>

            <div className="message-body">
              <div className="body-content">{selectedMessage.content}</div>
            </div>
          </>
        ) : (
          <div className="no-message-selected">
            <Mail size={48} />
            <h3>Select a message to view</h3>
            <p>Choose a message from the list to read its contents</p>
          </div>
        )}

        {/* Message Composer */}
        <div className="message-composer">
          <h4>New Message to Police Department</h4>
          
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

          <div className="composer-fields">
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                placeholder="Enter subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                placeholder="Type your message here..."
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
              />
            </div>
          </div>

          <div className="composer-actions">
            <label className="attachment-btn">
              <Paperclip size={18} />
              <span>Attach File</span>
              <input 
                type="file" 
                onChange={handleAttachment}
                style={{ display: 'none' }}
              />
            </label>
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.subject || !newMessage.content}
            >
              <Send size={18} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;