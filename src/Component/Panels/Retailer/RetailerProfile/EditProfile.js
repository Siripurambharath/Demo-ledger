import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { baseurl } from "../../../BaseURL/BaseURL";

const EditProfile = () => {
  const [account, setAccount] = useState(null);
  const [editedAccount, setEditedAccount] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
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
      setEditedAccount({...accountData});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching account:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedAccount(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  // Validate data before sending
  const validateData = (data) => {
    const validatedData = { ...data };
    
    // Remove id field
    delete validatedData.id;
    
    // Handle numeric fields
    const numericFields = ['opening_balance', 'tds_slab_rate'];
    numericFields.forEach(field => {
      if (validatedData[field] === '' || validatedData[field] === null) {
        validatedData[field] = 0;
      } else {
        validatedData[field] = parseFloat(validatedData[field]) || 0;
      }
    });

    // Convert empty strings to null for database consistency
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] === '') {
        validatedData[key] = null;
      }
    });

    return validatedData;
  };

  // Save edited account
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const userString = localStorage.getItem('user');
      const user = JSON.parse(userString);
      if (!user?.id) {
        throw new Error('Invalid user data');
      }
      
      // Validate and prepare data
      const dataToSend = validateData(editedAccount);
      
      console.log('Sending update data:', dataToSend);
      
      const response = await fetch(`${baseurl}/accounts/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || `Server error: ${response.status}`);
      }
      
      alert('Profile updated successfully!');
      navigate('/profile');
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating account:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/profile');
    }
  };

  // Format value for input fields
  const formatInputValue = (value) => {
    if (value === null || value === undefined) return '';
    return value;
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
      <div className="profile-header">
        <h1 className="profile-title">Edit Profile</h1>
        <p className="profile-description">Update your account information</p>
        
        {error && (
          <div className="error-message" style={{marginBottom: '20px'}}>
            <h4>Update Error:</h4>
            <p>{error}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleSave} 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
      
      <div className="profile-content">
        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            Business Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'banking' ? 'active' : ''}`}
            onClick={() => setActiveTab('banking')}
          >
            Banking Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            Address Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="info-section">
              <h3>Basic Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.display_name)}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter display name"
                  />
                </div>
                <div className="info-item">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.name)}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="info-item">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.title)}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="edit-input"
                    placeholder="Enter title"
                  />
                </div>
                <div className="info-item">
                  <label>Entity Type</label>
                  <select
                    value={formatInputValue(editedAccount.entity_type)}
                    onChange={(e) => handleInputChange('entity_type', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Entity Type</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="partnership">Partnership</option>
                    <option value="llp">LLP</option>
                  </select>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <select
                    value={formatInputValue(editedAccount.role)}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Role</option>
                    <option value="retailer">Retailer</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="distributor">Distributor</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="info-item">
                  <label>Account Status</label>
                  <select
                    value={formatInputValue(editedAccount.status)}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="edit-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="info-item">
                  <label>Account Group</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.group)}
                    onChange={(e) => handleInputChange('group', e.target.value)}
                    className="edit-input"
                    placeholder="Enter group"
                  />
                </div>
                <div className="info-item">
                  <label>Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formatInputValue(editedAccount.opening_balance)}
                    onChange={(e) => handleInputChange('opening_balance', e.target.value)}
                    className="edit-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="info-item">
                  <label>Currency</label>
                  <select
                    value={formatInputValue(editedAccount.currency)}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="edit-select"
                  >
                    <option value="INR">Indian Rupee (INR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === 'contact' && (
            <div className="info-section">
              <h3>Contact Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={formatInputValue(editedAccount.email)}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="edit-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="info-item">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    value={formatInputValue(editedAccount.mobile_number)}
                    onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                    className="edit-input"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formatInputValue(editedAccount.phone_number)}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="edit-input"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="info-item">
                  <label>Fax</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.fax)}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className="edit-input"
                    placeholder="Enter fax number"
                  />
                </div>
                <div className="info-item">
                  <label>Assigned Staff</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.assigned_staff)}
                    onChange={(e) => handleInputChange('assigned_staff', e.target.value)}
                    className="edit-input"
                    placeholder="Enter assigned staff"
                  />
                </div>
                <div className="info-item">
                  <label>Staff ID</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.staffid)}
                    onChange={(e) => handleInputChange('staffid', e.target.value)}
                    className="edit-input"
                    placeholder="Enter staff ID"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Information Tab */}
          {activeTab === 'business' && (
            <div className="info-section">
              <h3>Business Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Business Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.business_name)}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter business name"
                  />
                </div>
                <div className="info-item">
                  <label>Additional Business Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.additional_business_name)}
                    onChange={(e) => handleInputChange('additional_business_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter additional business name"
                  />
                </div>
                <div className="info-item">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.gstin)}
                    onChange={(e) => handleInputChange('gstin', e.target.value)}
                    className="edit-input"
                    placeholder="Enter GSTIN"
                  />
                </div>
                <div className="info-item">
                  <label>GST Registered Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.gst_registered_name)}
                    onChange={(e) => handleInputChange('gst_registered_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter GST registered name"
                  />
                </div>
                <div className="info-item">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.pan)}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
                    className="edit-input"
                    placeholder="Enter PAN number"
                  />
                </div>
                <div className="info-item">
                  <label>TAN Number</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.tan)}
                    onChange={(e) => handleInputChange('tan', e.target.value)}
                    className="edit-input"
                    placeholder="Enter TAN number"
                  />
                </div>
                <div className="info-item">
                  <label>TDS Slab Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formatInputValue(editedAccount.tds_slab_rate)}
                    onChange={(e) => handleInputChange('tds_slab_rate', e.target.value)}
                    className="edit-input"
                    placeholder="Enter TDS slab rate"
                  />
                </div>
                <div className="info-item">
                  <label>Terms of Payment</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.terms_of_payment)}
                    onChange={(e) => handleInputChange('terms_of_payment', e.target.value)}
                    className="edit-input"
                    placeholder="Enter terms of payment"
                  />
                </div>
                <div className="info-item">
                  <label>Reverse Charge</label>
                  <select
                    value={formatInputValue(editedAccount.reverse_charge)}
                    onChange={(e) => handleInputChange('reverse_charge', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="info-item">
                  <label>Export/SEZ</label>
                  <select
                    value={formatInputValue(editedAccount.export_sez)}
                    onChange={(e) => handleInputChange('export_sez', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Option</option>
                    <option value="export">Export</option>
                    <option value="sez">SEZ</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Banking Details Tab */}
          {activeTab === 'banking' && (
            <div className="info-section">
              <h3>Banking Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.bank_name)}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="info-item">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.account_number)}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                    className="edit-input"
                    placeholder="Enter account number"
                  />
                </div>
                <div className="info-item">
                  <label>Account Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.account_name)}
                    onChange={(e) => handleInputChange('account_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter account name"
                  />
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <select
                    value={formatInputValue(editedAccount.account_type)}
                    onChange={(e) => handleInputChange('account_type', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="salary">Salary</option>
                    <option value="fixed_deposit">Fixed Deposit</option>
                  </select>
                </div>
                <div className="info-item">
                  <label>Branch Name</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.branch_name)}
                    onChange={(e) => handleInputChange('branch_name', e.target.value)}
                    className="edit-input"
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="info-item">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={formatInputValue(editedAccount.ifsc_code)}
                    onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                    className="edit-input"
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Information Tab */}
          {activeTab === 'address' && (
            <div className="info-section">
              <div className="address-section">
                <h3>Shipping Address</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_address_line1)}
                      onChange={(e) => handleInputChange('shipping_address_line1', e.target.value)}
                      className="edit-input"
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div className="info-item">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_address_line2)}
                      onChange={(e) => handleInputChange('shipping_address_line2', e.target.value)}
                      className="edit-input"
                      placeholder="Enter address line 2"
                    />
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_city)}
                      onChange={(e) => handleInputChange('shipping_city', e.target.value)}
                      className="edit-input"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="info-item">
                    <label>Pin Code</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_pin_code)}
                      onChange={(e) => handleInputChange('shipping_pin_code', e.target.value)}
                      className="edit-input"
                      placeholder="Enter pin code"
                    />
                  </div>
                  <div className="info-item">
                    <label>State</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_state)}
                      onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                      className="edit-input"
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="info-item">
                    <label>Country</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_country)}
                      onChange={(e) => handleInputChange('shipping_country', e.target.value)}
                      className="edit-input"
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="info-item">
                    <label>Branch Name</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_branch_name)}
                      onChange={(e) => handleInputChange('shipping_branch_name', e.target.value)}
                      className="edit-input"
                      placeholder="Enter branch name"
                    />
                  </div>
                  <div className="info-item">
                    <label>GSTIN</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.shipping_gstin)}
                      onChange={(e) => handleInputChange('shipping_gstin', e.target.value)}
                      className="edit-input"
                      placeholder="Enter GSTIN"
                    />
                  </div>
                </div>
              </div>

              <div className="address-section">
                <h3>Billing Address</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_address_line1)}
                      onChange={(e) => handleInputChange('billing_address_line1', e.target.value)}
                      className="edit-input"
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div className="info-item">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_address_line2)}
                      onChange={(e) => handleInputChange('billing_address_line2', e.target.value)}
                      className="edit-input"
                      placeholder="Enter address line 2"
                    />
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_city)}
                      onChange={(e) => handleInputChange('billing_city', e.target.value)}
                      className="edit-input"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="info-item">
                    <label>Pin Code</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_pin_code)}
                      onChange={(e) => handleInputChange('billing_pin_code', e.target.value)}
                      className="edit-input"
                      placeholder="Enter pin code"
                    />
                  </div>
                  <div className="info-item">
                    <label>State</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_state)}
                      onChange={(e) => handleInputChange('billing_state', e.target.value)}
                      className="edit-input"
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="info-item">
                    <label>Country</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_country)}
                      onChange={(e) => handleInputChange('billing_country', e.target.value)}
                      className="edit-input"
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="info-item">
                    <label>Branch Name</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_branch_name)}
                      onChange={(e) => handleInputChange('billing_branch_name', e.target.value)}
                      className="edit-input"
                      placeholder="Enter branch name"
                    />
                  </div>
                  <div className="info-item">
                    <label>GSTIN</label>
                    <input
                      type="text"
                      value={formatInputValue(editedAccount.billing_gstin)}
                      onChange={(e) => handleInputChange('billing_gstin', e.target.value)}
                      className="edit-input"
                      placeholder="Enter GSTIN"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;