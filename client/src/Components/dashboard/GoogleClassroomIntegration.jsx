import React, { useState, useEffect } from 'react';
import { googleClassroomAPI } from '../../services/api';
import './GoogleClassroomIntegration.css';

const GoogleClassroomIntegration = ({ userId, onSync }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check for OAuth callback success/error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('classroomConnected') === 'true') {
      setSuccessMessage('Successfully connected to Google Classroom!');
      checkConnectionStatus();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('classroomError') === 'true') {
      setError('Failed to connect to Google Classroom. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await googleClassroomAPI.getConnectionStatus();
      setIsConnected(response.isConnected);
      setLastSync(response.lastSync);
    } catch (err) {
      console.error('Error checking connection status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      const response = await googleClassroomAPI.getAuthUrl(userId);
      // Redirect to Google OAuth
      window.location.href = response.authUrl;
    } catch (err) {
      console.error('Error connecting to Google Classroom:', err);
      setError('Failed to initiate connection. Please try again.');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await googleClassroomAPI.manualSync();
      setSuccessMessage(`Synced ${response.assignmentsCount || 0} assignments from ${response.coursesCount || 0} courses`);
      setLastSync(new Date());
      
      // Notify parent component to refresh assignments
      if (onSync) {
        onSync();
      }
    } catch (err) {
      console.error('Error syncing Google Classroom:', err);
      setError('Failed to sync. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Classroom?')) {
      return;
    }

    try {
      setError(null);
      await googleClassroomAPI.disconnect();
      setIsConnected(false);
      setLastSync(null);
      setSuccessMessage('Successfully disconnected from Google Classroom');
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect. Please try again.');
    }
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="classroom-integration">
        <div className="classroom-loading">
          <div className="spinner"></div>
          <p>Checking Google Classroom connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="classroom-integration">
      <div className="classroom-header">
        <div className="classroom-title-section">
          <img 
            src="https://ssl.gstatic.com/classroom/favicon.png" 
            alt="Google Classroom" 
            className="classroom-icon"
          />
          <div>
            <h3 className="classroom-title">Google Classroom</h3>
            <p className="classroom-subtitle">
              {isConnected ? 'Sync your assignments automatically' : 'Connect to import your assignments'}
            </p>
          </div>
        </div>
        <div className="classroom-status">
          <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '✓ Connected' : '○ Not Connected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="classroom-message error-message">
          <span className="message-icon">⚠️</span>
          <span>{error}</span>
          <button className="message-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="classroom-message success-message">
          <span className="message-icon">✓</span>
          <span>{successMessage}</span>
          <button className="message-close" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      <div className="classroom-content">
        {isConnected ? (
          <>
            <div className="classroom-info">
              <div className="info-item">
                <span className="info-label">Last Synced:</span>
                <span className="info-value">{formatLastSync(lastSync)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Auto-Sync:</span>
                <span className="info-value">Every 30 minutes</span>
              </div>
            </div>
            <div className="classroom-actions">
              <button 
                className="btn-sync" 
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <span className="spinner-small"></span>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔄</span>
                    Sync Now
                  </>
                )}
              </button>
              <button 
                className="btn-disconnect" 
                onClick={handleDisconnect}
                disabled={syncing}
              >
                <span className="btn-icon">🔌</span>
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <div className="classroom-connect">
            <div className="connect-benefits">
              <h4>Benefits of connecting:</h4>
              <ul>
                <li>✓ Automatically import assignments from all your classes</li>
                <li>✓ Keep track of due dates in one place</li>
                <li>✓ Auto-sync every 30 minutes</li>
                <li>✓ View assignment details and links</li>
              </ul>
            </div>
            <button className="btn-connect" onClick={handleConnect}>
              <img 
                src="https://ssl.gstatic.com/classroom/favicon.png" 
                alt="Google Classroom" 
                className="btn-icon-img"
              />
              Connect Google Classroom
            </button>
            <p className="connect-note">
              You'll be redirected to Google to authorize access to your classroom data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleClassroomIntegration;

