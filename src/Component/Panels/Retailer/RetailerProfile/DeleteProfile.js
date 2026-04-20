import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { baseurl } from "../../../BaseURL/BaseURL";

const DeleteProfile = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('User not found in localStorage');
      }
      
      const user = JSON.parse(userString);
      if (!user || !user.id) {
        throw new Error('Invalid user data');
      }
      
      const response = await fetch(`${baseurl}/accounts/${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch account data: ${response.status}`);
      }
      
      const accountData = await response.json();
      setAccount(accountData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching account:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDelete = async () => {
    try {
      if (!confirmed) {
        alert('Please confirm deletion by checking the checkbox.');
        return;
      }

      setDeleting(true);
      setError(null);
      
      const userString = localStorage.getItem('user');
      const user = JSON.parse(userString);
      
      const response = await fetch(`${baseurl}/accounts/${user.id}`, {
        method: 'DELETE',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to delete account: ${response.status}`);
      }
      
      alert('Account deleted successfully!');
      
      // Clear localStorage and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
      
    } catch (err) {
      setError(err.message);
      console.error('Error deleting account:', err);
      alert(`Failed to delete account: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/profile');
  };

  // Function to generate avatar initials
  const getAvatarInitials = (name = '', displayName = '') => {
    if (name) {
      const names = name.split(' ');
      const first = names[0]?.charAt(0) || '';
      const last = names[1]?.charAt(0) || '';
      return (first + last).toUpperCase();
    }
    if (displayName) {
      return displayName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchAccount} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate('/profile')} className="btn btn-secondary">
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>Account not found</p>
          <button onClick={() => navigate('/profile')} className="btn btn-secondary">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="delete-profile">
        <div className="delete-header">
          <div className="warning-icon">⚠️</div>
          <h1 className="delete-title">Delete Account</h1>
          <p className="delete-description">
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </p>
        </div>

        <div className="account-summary">
          <div className="avatar-section">
            <div className="avatar-large">
              {getAvatarInitials(account.name, account.display_name)}
            </div>
            <div className="user-info">
              <h2 className="user-name">
                {account.display_name || account.name || 'Unknown User'}
              </h2>
              <p className="user-email">{account.email || 'No email provided'}</p>
              <div className="account-details">
                <span className="account-id">Account ID: #{account.id}</span>
                <span className={`status-badge ${account.status || 'inactive'}`}>
                  {account.status || 'inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="delete-warning">
          <h3>Before you proceed, please note:</h3>
          <ul className="warning-list">
            <li>All your personal information will be permanently deleted</li>
            <li>Your business data and transaction history will be lost</li>
            <li>This action cannot be reversed</li>
            <li>You will need to create a new account to use our services again</li>
          </ul>
        </div>

        <div className="confirmation-section">
          <label className="confirmation-label">
            <input 
              type="checkbox" 
              id="confirmDelete" 
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="checkmark"></span>
            I understand that this action cannot be undone and I want to proceed with deleting my account.
          </label>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="delete-actions">
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={deleting || !confirmed}
          >
            {deleting ? 'Deleting...' : 'Permanently Delete Account'}
          </button>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfile;