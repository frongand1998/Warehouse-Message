import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messenger/messages');
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showAlert('error', 'Image size should not exceed 10MB');
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      showAlert('error', 'Please enter a message text');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (image) {
        formData.append('image', image);
      }
      if (recipientId.trim()) {
        formData.append('recipientId', recipientId);
      }

      const response = await axios.post('/api/messenger/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showAlert('success', 'Message sent successfully to Facebook Messenger!');
        setText('');
        setImage(null);
        setImagePreview(null);
        setRecipientId('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message. Please try again.';
      const errorDetails = error.response?.data?.details;
      showAlert('error', `${errorMessage}${errorDetails ? ': ' + JSON.stringify(errorDetails) : ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📦 Warehouse Message</h1>
        <p>Send messages with images to Facebook Messenger</p>
      </header>

      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <form className="messenger-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipientId">Recipient ID (optional)</label>
          <input
            type="text"
            id="recipientId"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="Leave empty to use default recipient from .env"
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Enter the Facebook Page-Scoped ID (PSID) of the recipient
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="text">Message Text *</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your message here..."
            required
          />
        </div>

        <div className="form-group">
          <label>Image (optional)</label>
          <div className="file-input-wrapper">
            <label className={`file-input-label ${image ? 'has-file' : ''}`} htmlFor="image">
              📷 {image ? 'Change Image' : 'Choose Image'}
            </label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
            />
          </div>
          {image && (
            <div className="file-name">
              Selected: {image.name}
            </div>
          )}
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <br />
            <button type="button" className="remove-image" onClick={removeImage}>
              Remove Image
            </button>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading && <span className="loading-spinner"></span>}
          {loading ? 'Sending...' : 'Send to Messenger'}
        </button>
      </form>

      {messages.length > 0 && (
        <div className="message-history">
          <h2>Recent Messages</h2>
          {messages.slice(0, 10).map((msg) => (
            <div key={msg._id} className="message-item">
              <div>
                <strong>{msg.text}</strong>
                <span className={`message-status ${msg.status}`}>{msg.status}</span>
              </div>
              {msg.imageUrl && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={`http://localhost:5000${msg.imageUrl}`} 
                    alt="Message attachment" 
                    style={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </div>
              )}
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
