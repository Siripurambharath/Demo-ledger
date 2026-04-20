// Profile.js
import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      
      <div className="profile-header">
        <p className="profile-description">Manage your account information</p>
      </div>
      
      <div className="profile-card">
        <div className="user-info-section">
          <div className="avatar-section">
            <div className="avatar">RK</div>
            <div className="user-details">
              <h3 className="user-name">Rajesh Kumar</h3>
              <p className="store-name">ABC Electronics Store</p>
            </div>
          </div>
          
          <div className="verified-badge">
            <span className="verified-icon">✓</span>
            Verified Retailer
          </div>
        </div>
      </div>
      
      {/* Performance Summary Section */}
      <div className="performance-section">
        <h3 className="section-title">Performance Summary</h3>
        
        <div className="performance-cards">
          <div className="performance-card">
            <div className="performance-content">
              <div className="score-circle">
                <span className="score">24</span>
              </div>
              <div className="performance-info">
                <p className="performance-value">Current Score</p>
                <p className="performance-label">Total Orders</p>
              </div>
            </div>
          </div>
          
          <div className="performance-card">
            <div className="performance-content">
              <div className="score-circle success">
                <span className="score">98%</span>
              </div>
              <div className="performance-info">
                <p className="performance-value">Total Purchase</p>
                <p className="performance-label">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="business-details-section">
        <h3 className="section-title">Business Details</h3>
        
        <div className="details-card">
          <div className="detail-item">
            <span className="detail-label">Store Name</span>
            <span className="detail-value">ABC Electronics Store</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value">
              Shop No. 45, Electronics Market,<br />
              New Delhi - 110001
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">January 2023</span>
          </div>
        </div>
      </div>
      
      {/* Account Settings Section */}
      <div className="account-settings-section">
        <h3 className="section-title">Account Settings</h3>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-icon">⚙️</span>
            <span className="settings-text">General Settings</span>
            <span className="settings-arrow">›</span>
          </div>
          <div className="settings-item">
            <span className="settings-icon">🔒</span>
            <span className="settings-text">Privacy & Security</span>
            <span className="settings-arrow">›</span>
          </div>
          <div className="settings-item">
            <span className="settings-icon">🔔</span>
            <span className="settings-text">Notifications</span>
            <span className="settings-arrow">›</span>
          </div>
          <div className="settings-item">
            <span className="settings-icon">🔄</span>
            <span className="settings-text">Update Profile</span>
            <span className="settings-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;