
// // Profile.js
// import React, { useState, useEffect } from 'react';
// import './Profile.css';
// import { baseurl } from "../../../BaseURL/BaseURL";

// const Profile = () => {
//   const [account, setAccount] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'contact', 'business', 'banking', 'address'

//   useEffect(() => {
//     const fetchAccount = async () => {
//       try {
//         setLoading(true);
        
//         // Get ID from localStorage
//         const userString = localStorage.getItem('user');
//         if (!userString) {
//           throw new Error('User not found in localStorage');
//         }
        
//         const user = JSON.parse(userString);
//         if (!user || !user.id) {
//           throw new Error('Invalid user data');
//         }
        
//         const response = await fetch(`${baseurl}/accounts/${user.id}`);
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch account data: ${response.status}`);
//         }
        
//         const accountData = await response.json();
//         setAccount(accountData);
//       } catch (err) {
//         setError(err.message);
//         console.error('Error fetching account:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAccount();
//   }, []);

//   // Function to generate avatar initials from name or display_name
//   const getAvatarInitials = (name = '', displayName = '') => {
//     if (name) {
//       const names = name.split(' ');
//       const first = names[0]?.charAt(0) || '';
//       const last = names[1]?.charAt(0) || '';
//       return (first + last).toUpperCase();
//     }
//     if (displayName) {
//       return displayName.substring(0, 2).toUpperCase();
//     }
//     return 'U';
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     if (!amount || isNaN(amount)) return '₹0.00';
//     return `₹${parseFloat(amount).toFixed(2)}`;
//   };

//   // Check if value is empty
//   const isEmpty = (value) => {
//     return value === null || value === undefined || value === '' || value === 0;
//   };

//   // Get display value with fallback
//   const getDisplayValue = (value, fallback = 'Not provided') => {
//     return !isEmpty(value) ? value : fallback;
//   };

//   if (loading) {
//     return (
//       <div className="profile-container">
//         <div className="loading-spinner">Loading profile...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="profile-container">
//         <div className="error-message">
//           <h3>Error Loading Profile</h3>
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()} className="retry-btn">
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!account) {
//     return (
//       <div className="profile-container">
//         <div className="error-message">Account not found</div>
//       </div>
//     );
//   }

//   return (
//     <div className="profile-container">
//       <div className="profile-header">
//         <h1 className="profile-title">My Profile</h1>
//         <p className="profile-description">Manage your account information and settings</p>
//       </div>
      
//       <div className="profile-content">
//         {/* User Card */}
//         <div className="profile-card">
//           <div className="user-header">
//             <div className="avatar-section">
//               <div className="avatar-large">
//                 {getAvatarInitials(account.name, account.display_name)}
//               </div>
//               <div className="user-info">
//                 <h2 className="user-name">
//                   {getDisplayValue(account.display_name, account.name)}
//                 </h2>
//                 <p className="user-role">{getDisplayValue(account.role, 'Retailer')}</p>
//                 <div className={`status-badge ${account.status || 'inactive'}`}>
//                   <span className="status-dot"></span>
//                   {account.status === 'active' ? 'Active Account' : 
//                    account.status === 'inactive' ? 'Inactive Account' : 
//                    'Pending Activation'}
//                 </div>
//               </div>
//             </div>
            
//             <div className="account-meta">
//               <div className="meta-item">
//                 <span className="meta-label">Account ID</span>
//                 <span className="meta-value">#{account.id}</span>
//               </div>
//               <div className="meta-item">
//                 <span className="meta-label">Opening Balance</span>
//                 <span className="meta-value">{formatCurrency(account.opening_balance)}</span>
//               </div>
//               <div className="meta-item">
//                 <span className="meta-label">Group</span>
//                 <span className="meta-value">{getDisplayValue(account.group)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="profile-tabs">
//           <button 
//             className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
//             onClick={() => setActiveTab('basic')}
//           >
//             Basic Info
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
//             onClick={() => setActiveTab('contact')}
//           >
//             Contact Details
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
//             onClick={() => setActiveTab('business')}
//           >
//             Business Info
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'banking' ? 'active' : ''}`}
//             onClick={() => setActiveTab('banking')}
//           >
//             Banking Details
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
//             onClick={() => setActiveTab('address')}
//           >
//             Address Info
//           </button>
//         </div>

//         {/* Tab Content */}
//         <div className="tab-content">
//           {/* Basic Information Tab */}
//           {activeTab === 'basic' && (
//             <div className="info-section">
//               <h3>Basic Information</h3>
//               <div className="info-grid">
//                 <div className="info-item">
//                   <label>Display Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.display_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Full Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Title</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.title)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Entity Type</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.entity_type)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Role</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.role)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Account Status</label>
//                   <div className="info-value">
//                     <span className={`status-tag ${account.status}`}>
//                       {getDisplayValue(account.status, 'unknown')}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Account Group</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.group)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Opening Balance</label>
//                   <div className="info-value">
//                     {formatCurrency(account.opening_balance)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Currency</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.currency, 'INR')}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Contact Details Tab */}
//           {activeTab === 'contact' && (
//             <div className="info-section">
//               <h3>Contact Details</h3>
//               <div className="info-grid">
//                 <div className="info-item">
//                   <label>Email Address</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.email)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Mobile Number</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.mobile_number)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Phone Number</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.phone_number)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Fax</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.fax)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Assigned Staff</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.assigned_staff)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Staff ID</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.staffid)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Business Information Tab */}
//           {activeTab === 'business' && (
//             <div className="info-section">
//               <h3>Business Information</h3>
//               <div className="info-grid">
//                 <div className="info-item">
//                   <label>Business Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.business_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Additional Business Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.additional_business_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>GSTIN</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.gstin)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>GST Registered Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.gst_registered_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>PAN Number</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.pan)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>TAN Number</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.tan)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>TDS Slab Rate</label>
//                   <div className="info-value">
//                     {!isEmpty(account.tds_slab_rate) ? `${account.tds_slab_rate}%` : 'Not set'}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Terms of Payment</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.terms_of_payment)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Reverse Charge</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.reverse_charge)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Export/SEZ</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.export_sez)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Banking Details Tab */}
//           {activeTab === 'banking' && (
//             <div className="info-section">
//               <h3>Banking Details</h3>
//               <div className="info-grid">
//                 <div className="info-item">
//                   <label>Bank Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.bank_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Account Number</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.account_number)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Account Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.account_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Account Type</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.account_type)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>Branch Name</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.branch_name)}
//                   </div>
//                 </div>
//                 <div className="info-item">
//                   <label>IFSC Code</label>
//                   <div className="info-value">
//                     {getDisplayValue(account.ifsc_code)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Address Information Tab */}
//           {activeTab === 'address' && (
//             <div className="info-section">
//               <div className="address-section">
//                 <h3>Shipping Address</h3>
//                 <div className="info-grid">
//                   <div className="info-item">
//                     <label>Address Line 1</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_address_line1)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Address Line 2</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_address_line2)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>City</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_city)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Pin Code</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_pin_code)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>State</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_state)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Country</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_country)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Branch Name</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_branch_name)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>GSTIN</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.shipping_gstin)}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="address-section">
//                 <h3>Billing Address</h3>
//                 <div className="info-grid">
//                   <div className="info-item">
//                     <label>Address Line 1</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_address_line1)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Address Line 2</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_address_line2)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>City</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_city)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Pin Code</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_pin_code)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>State</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_state)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Country</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_country)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>Branch Name</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_branch_name)}
//                     </div>
//                   </div>
//                   <div className="info-item">
//                     <label>GSTIN</label>
//                     <div className="info-value">
//                       {getDisplayValue(account.billing_gstin)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { baseurl } from "../../../BaseURL/BaseURL";
import RetailerMobileLayout from '../RetailerMobileLayout';

const Profile = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      setError(err.message);
      console.error('Error fetching account:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate avatar initials from name or display_name
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

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Check if value is empty
  const isEmpty = (value) => {
    return value === null || value === undefined || value === '' || value === 0;
  };

  // Get display value with fallback
  const getDisplayValue = (value, fallback = 'Not provided') => {
    return !isEmpty(value) ? value : fallback;
  };

  // Navigate to edit page
  const handleEdit = () => {
    navigate('/profile/edit');
  };

  // Navigate to delete confirmation page
  const handleDelete = () => {
    navigate('/profile/delete');
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

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchAccount} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Go Home
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
          <button onClick={fetchAccount} className="btn btn-primary">
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <RetailerMobileLayout>
    
   
    <div className="profile-container">
      <div className="profile-header" >
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-description">Manage your account information and settings</p>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleEdit} className="btn btn-primary">
            Edit Profile
          </button>
          {/* <button onClick={handleDelete} className="btn btn-danger">
            Delete Account
          </button> */}
        </div>
      </div>
      
      <div className="profile-content">
        {/* User Card */}
        <div className="profile-card">
          <div className="user-header">
            <div className="avatar-section">
              <div className="avatar-large">
                {getAvatarInitials(account.name, account.display_name)}
              </div>
              <div className="user-info">
                <h2 className="user-name">
                  {getDisplayValue(account.display_name, account.name)}
                </h2>
                <p className="user-role">{getDisplayValue(account.role, 'Retailer')}</p>
                <div className={`status-badge ${account.status || 'inactive'}`}>
                  <span className="status-dot"></span>
                  {account.status === 'active' ? 'Active Account' : 
                   account.status === 'inactive' ? 'Inactive Account' : 
                   'Pending Activation'}
                </div>
              </div>
            </div>
            
            <div className="account-meta">
              <div className="meta-item">
                <span className="meta-label">Account ID</span>
                <span className="meta-value">#{account.id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Opening Balance</span>
                <span className="meta-value">{formatCurrency(account.opening_balance)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Group</span>
                <span className="meta-value">{getDisplayValue(account.group)}</span>
              </div>
            </div>
          </div>
        </div>

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
                  <div className="info-value">
                    {getDisplayValue(account.display_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Full Name</label>
                  <div className="info-value">
                    {getDisplayValue(account.name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Title</label>
                  <div className="info-value">
                    {getDisplayValue(account.title)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Entity Type</label>
                  <div className="info-value">
                    {getDisplayValue(account.entity_type)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <div className="info-value">
                    {getDisplayValue(account.role)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Account Status</label>
                  <div className="info-value">
                    <span className={`status-tag ${account.status}`}>
                      {getDisplayValue(account.status, 'unknown')}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Account Group</label>
                  <div className="info-value">
                    {getDisplayValue(account.group)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Opening Balance</label>
                  <div className="info-value">
                    {formatCurrency(account.opening_balance)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Currency</label>
                  <div className="info-value">
                    {getDisplayValue(account.currency, 'INR')}
                  </div>
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
                  <label>Email Address</label>
                  <div className="info-value">
                    {getDisplayValue(account.email)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Mobile Number</label>
                  <div className="info-value">
                    {getDisplayValue(account.mobile_number)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <div className="info-value">
                    {getDisplayValue(account.phone_number)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Fax</label>
                  <div className="info-value">
                    {getDisplayValue(account.fax)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Assigned Staff</label>
                  <div className="info-value">
                    {getDisplayValue(account.assigned_staff)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Staff ID</label>
                  <div className="info-value">
                    {getDisplayValue(account.staffid)}
                  </div>
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
                  <div className="info-value">
                    {getDisplayValue(account.business_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Additional Business Name</label>
                  <div className="info-value">
                    {getDisplayValue(account.additional_business_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>GSTIN</label>
                  <div className="info-value">
                    {getDisplayValue(account.gstin)}
                  </div>
                </div>
                <div className="info-item">
                  <label>GST Registered Name</label>
                  <div className="info-value">
                    {getDisplayValue(account.gst_registered_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>PAN Number</label>
                  <div className="info-value">
                    {getDisplayValue(account.pan)}
                  </div>
                </div>
                <div className="info-item">
                  <label>TAN Number</label>
                  <div className="info-value">
                    {getDisplayValue(account.tan)}
                  </div>
                </div>
                <div className="info-item">
                  <label>TDS Slab Rate</label>
                  <div className="info-value">
                    {!isEmpty(account.tds_slab_rate) ? `${account.tds_slab_rate}%` : 'Not set'}
                  </div>
                </div>
                <div className="info-item">
                  <label>Terms of Payment</label>
                  <div className="info-value">
                    {getDisplayValue(account.terms_of_payment)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Reverse Charge</label>
                  <div className="info-value">
                    {getDisplayValue(account.reverse_charge)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Export/SEZ</label>
                  <div className="info-value">
                    {getDisplayValue(account.export_sez)}
                  </div>
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
                  <div className="info-value">
                    {getDisplayValue(account.bank_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Account Number</label>
                  <div className="info-value">
                    {getDisplayValue(account.account_number)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Account Name</label>
                  <div className="info-value">
                    {getDisplayValue(account.account_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <div className="info-value">
                    {getDisplayValue(account.account_type)}
                  </div>
                </div>
                <div className="info-item">
                  <label>Branch Name</label>
                  <div className="info-value">
                    {getDisplayValue(account.branch_name)}
                  </div>
                </div>
                <div className="info-item">
                  <label>IFSC Code</label>
                  <div className="info-value">
                    {getDisplayValue(account.ifsc_code)}
                  </div>
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
                    <div className="info-value">
                      {getDisplayValue(account.shipping_address_line1)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Address Line 2</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_address_line2)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_city)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Pin Code</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_pin_code)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>State</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_state)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Country</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_country)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Branch Name</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_branch_name)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>GSTIN</label>
                    <div className="info-value">
                      {getDisplayValue(account.shipping_gstin)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="address-section">
                <h3>Billing Address</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Address Line 1</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_address_line1)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Address Line 2</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_address_line2)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_city)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Pin Code</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_pin_code)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>State</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_state)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Country</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_country)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Branch Name</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_branch_name)}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>GSTIN</label>
                    <div className="info-value">
                      {getDisplayValue(account.billing_gstin)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </RetailerMobileLayout>
     </>
  );
};

export default Profile;