// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import "./AddRetailer.css";

// const RetailerForm = () => {
//   const navigate = useNavigate();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const [formData, setFormData] = useState({
//     businessName: "",
//     email: "contact@business.com",
//     phone: "+91 98765 43210",
//     businessType: "",
//     location: "",
//     notes: ""
//   });

//   const businessTypes = [
//     "Select business type",
//     "Retail Store",
//     "E-commerce",
//     "Wholesale",
//     "Franchise",
//     "Other"
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//     navigate("/admindashboard/retailers");
//   };

//   const handleCancel = () => {
//     navigate("/admindashboard/retailers");
//   };

//   return (
//     <>
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`form-container ${isCollapsed ? 'collapsed' : ''}`}>
//         <div className="form-wrapper">
//           <div className="formHeader">
//             <h1 className="title">Add New Retailer</h1>
//             <p className="subtitle">
//               Fill in the retailer details for onboarding approval
//             </p>
//           </div>

//           <form className="form" onSubmit={handleSubmit}>
//             <div className="form-row">
//               <div className="formGroup">
//                 <label htmlFor="businessName" className="label">
//                   Business Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="businessName"
//                   name="businessName"
//                   value={formData.businessName}
//                   onChange={handleChange}
//                   placeholder="Enter business name"
//                   className="input"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label htmlFor="email" className="label">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="contact@business.com"
//                   className="input"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label htmlFor="phone" className="label">
//                   Phone *
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="+91 98765 43210"
//                   className="input"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="formGroup">
//                 <label htmlFor="businessType" className="label">
//                   Business Type
//                 </label>
//                 <select
//                   id="businessType"
//                   name="businessType"
//                   value={formData.businessType}
//                   onChange={handleChange}
//                   className="select"
//                 >
//                   {businessTypes.map((type, index) => (
//                     <option key={index} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="formGroup">
//                 <label htmlFor="location" className="label">
//                   Location
//                 </label>
//                 <input
//                   type="text"
//                   id="location"
//                   name="location"
//                   value={formData.location}
//                   onChange={handleChange}
//                   placeholder="City, State"
//                   className="input"
//                 />
//               </div>

//               <div className="formGroup spacer">
//                 {/* Empty spacer to maintain 3-column layout */}
//               </div>
//             </div>

//             <div className="formGroup full-width">
//               <label htmlFor="notes" className="label">
//                 Notes
//               </label>
//               <textarea
//                 id="notes"
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 placeholder="Additional notes or comments"
//                 rows="4"
//                 className="textarea"
//               />
//             </div>

//             <div className="buttonGroup">
//               <button
//                 type="button"
//                 className="cancelButton"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="submitButton">
//                 Add Retailer
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default RetailerForm;


// import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import Sidebar from '../../Shared/Sidebar/Sidebar';
// import Header from '../../Shared/Header/Header';
// import './AddCustomerForm.css';

// const AddCustomerForm = ({ user }) => {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [sameAsShipping, setSameAsShipping] = useState(false);
//   const [activeTab, setActiveTab] = useState('information');

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <div className="dashboard-container">
//       <Header 
//         user={user} 
//         toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
//       />
//       <div className="content-wrapper">
//         <div className={`pcoded-navbar ${sidebarCollapsed ? 'navbar-collapsed' : ''}`}>
//           <Sidebar 
//             user={user} 
//             collapsed={sidebarCollapsed} 
//           />
//         </div>
//         <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
//           <div className="container customer-form-container">
//             <h1 className="customer-form-title">Add Customer</h1>

//             <div className="customer-form-tabs">
//               <div 
//                 className={`customer-tab ${activeTab === 'information' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('information')}
//               >
//                 Information
//               </div>
//               <div 
//                 className={`customer-tab ${activeTab === 'banking' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('banking')}
//               >
//                 Banking & Taxes
//               </div>
//               <div 
//                 className={`customer-tab ${activeTab === 'shipping' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('shipping')}
//               >
//                 Shipping Address
//               </div>
//               <div 
//                 className={`customer-tab ${activeTab === 'billing' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('billing')}
//               >
//                 Billing Address
//               </div>
//             </div>

//             {/* Information Section */}
//             <div className={`card customer-form-card ${activeTab === 'information' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Information</h2>
//                 <div className="row">
//                   {/* Left Column */}
//                   <div className="col-md-6">
//                     {/* Title and Name in same row */}
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Title</label>
//                           <select className="form-select customer-form-input">
//                             <option value="">Select</option>
//                             <option value="Mr.">Mr.</option>
//                             <option value="Mrs.">Mrs.</option>
//                             <option value="Ms.">Ms.</option>
//                             <option value="Dr.">Dr.</option>
//                           </select>
//                         </div>
//                       </div>
//                       <div className="col-md-8">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Name*</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Mobile Number*</label>
//                       <input type="tel" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Customer GSTIN</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Business Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Display Name*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Fax</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>

//                   {/* Right Column */}
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Entity Type</label>
//                       <select className="form-select customer-form-input">
//                         <option value="">Select an Entity Type</option>
//                         <option value="Individual">Individual</option>
//                         <option value="Company">Company</option>
//                         <option value="Partnership">Partnership</option>
//                       </select>
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Email*</label>
//                       <input type="email" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Customer GST Registered Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Additional Business Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Phone Number</label>
//                       <input type="tel" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-primary customer-submit-btn"
//                   onClick={() => handleTabClick('banking')}
//                 >
//                   Next: Banking & Taxes
//                 </button>
//               </div>
//             </div>

//             {/* Banking & Taxes Section */}
//             <div className={`card customer-form-card ${activeTab === 'banking' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Banking & Taxes</h2>

//                 {/* Account Information Section */}
//                 <div className="mb-4">
//                   <h3 className="customer-subsection-title">Account Information</h3>
//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Account Number</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Account Name</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Bank Name</label>
//                         <select className="form-select customer-form-input">
//                           <option>Select Bank Name</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">IFSC Code</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Account Type</label>
//                         <select className="form-select customer-form-input">
//                           <option>Savings Account</option>
//                           <option>Current Account</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Branch Name</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tax Information Section */}
//                 <div className="mb-4">
//                   <h3 className="customer-subsection-title">Tax Information</h3>
//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">PAN</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">TAN</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">TCS Slab Rate</label>
//                         <select className="form-select customer-form-input">
//                           <option>TCS Not Applicable</option>
//                           <option>0.1%</option>
//                           <option>1%</option>
//                           <option>5%</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Currency</label>
//                         <select className="form-select customer-form-input">
//                           <option>Indian Rupee</option>
//                           <option>US Dollar</option>
//                           <option>Euro</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Terms of Payment</label>
//                         <select className="form-select customer-form-input">
//                           <option>Select Terms of Payment</option>
//                           <option>Net 15</option>
//                           <option>Net 30</option>
//                           <option>Net 60</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Apply Reverse Charge</label>
//                         <select className="form-select customer-form-input">
//                           <option>Yes</option>
//                           <option>No</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Export or SEZ Developer</label>
//                         <select className="form-select customer-form-input">
//                           <option>Not Applicable</option>
//                           <option>Export</option>
//                           <option>SEZ Developer</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-outline-secondary customer-back-btn"
//                   onClick={() => handleTabClick('information')}
//                 >
//                   Back
//                 </button>
//                 <button 
//                   type="button" 
//                   className="btn btn-primary customer-submit-btn"
//                   onClick={() => handleTabClick('shipping')}
//                 >
//                   Next: Shipping Address
//                 </button>
//               </div>
//             </div>

//             {/* Shipping Address Section */}
//             <div className={`card customer-form-card ${activeTab === 'shipping' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Shipping Address</h2>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Address Line 1*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Address Line 2</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">City*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Pin Code*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">State*</label>
//                       <select className="form-select customer-form-input" required>
//                         <option>Select a State</option>
//                         <option value="Telangana">Telangana</option>
//                         <option value="Andra Pradesh">Andra Pradesh</option>
//                         <option value="Kerala">Kerala</option>
//                         <option value="Karnataka">Karnataka</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Country*</label>
//                       <select className="form-select customer-form-input" required>
//                         <option>Select a Country</option>
//                         <option value="India">India</option>
//                         <option value="Bangladesh">Bangladesh</option>
//                         <option value="Canada">Canada</option>
//                         <option value="Iraq">Iraq</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Branch Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">GSTIN</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-outline-secondary customer-back-btn"
//                   onClick={() => handleTabClick('banking')}
//                 >
//                   Back
//                 </button>
//                 <button 
//                   type="button" 
//                   className="btn btn-primary customer-submit-btn"
//                   onClick={() => handleTabClick('billing')}
//                 >
//                   Next: Billing Address
//                 </button>
//               </div>
//             </div>

//             {/* Billing Address Section */}
//             <div className={`card customer-form-card ${activeTab === 'billing' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Billing Address</h2>

//                 <div className="mb-3">
//                   <div className="form-check">
//                     <input 
//                       className="form-check-input" 
//                       type="checkbox" 
//                       id="sameAsShipping" 
//                       checked={sameAsShipping}
//                       onChange={(e) => setSameAsShipping(e.target.checked)}
//                     />
//                     <label className="form-check-label" htmlFor="sameAsShipping">
//                       Shipping address is same as billing address
//                     </label>
//                   </div>
//                 </div>

//                 {!sameAsShipping && (
//                   <>
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Address Line 1</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Address Line 2</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">City</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Pin Code</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">State</label>
//                           <select className="form-select customer-form-input">
//                             <option>Select a State</option>
//                             <option value="Telangana">Telangana</option>
//                             <option value="Andra Pradesh">Andra Pradesh</option>
//                             <option value="Kerala">Kerala</option>
//                             <option value="Karnataka">Karnataka</option>
//                           </select>
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Country</label>
//                           <select className="form-select customer-form-input">
//                             <option>Select a Country</option>
//                             <option value="India">India</option>
//                             <option value="Bangladesh">Bangladesh</option>
//                             <option value="Canada">Canada</option>
//                             <option value="Iraq">Iraq</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Branch Name</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">GSTIN</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-outline-secondary customer-back-btn"
//                   onClick={() => handleTabClick('shipping')}
//                 >
//                   Back
//                 </button>
//                 <button type="submit" className="btn btn-primary customer-submit-btn">
//                   Submit
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerForm;






// import React, { useState, useEffect } from 'react'; 
// import FormLayout, { FormSection } from '../../../Layouts/FormLayout/FormLayout';
// import "./AddRetailer.css";
// import axios from 'axios'; 
// import { useParams, useNavigate } from 'react-router-dom';
// import { baseurl } from './../../../BaseURL/BaseURL';

// const AddCustomerForm = ({ user }) => {
//   const { id } = useParams();
//   const [isEditing, setIsEditing] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [sameAsShipping, setSameAsShipping] = useState(false);
//   const [activeTab, setActiveTab] = useState('information');
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();
//   const [isLoadingGstin, setIsLoadingGstin] = useState(false);
//   const [gstinError, setGstinError] = useState(null);
//     const [accountGroups, setAccountGroups] = useState([]);
//   const [loadingGroups, setLoadingGroups] = useState(false);
//   const [formData, setFormData] = useState({
//     group: "customer",
//     title: "",
//     entity_type: "",
//     name: "",
//         group: "", // Added group field

//     mobile_number: "",

//     email: "",
//     gstin: "",
//     gst_registered_name: "",
//     business_name: "",
//     additional_business_name: "",
//     display_name: "",
//     phone_number: "",
//     fax: "",
//     account_number: "",
//     account_name: "",
//     bank_name: "",
//     account_type: "",
//     branch_name: "",
//     ifsc_code: "",
//     pan: "",
//     tan: "",
//     tds_slab_rate: "",
//     currency: "",
//     terms_of_payment: "",
//     reverse_charge: "",
//     export_sez: "",
//     shipping_address_line1: "",
//     shipping_address_line2: "",
//     shipping_city: "",
//     shipping_pin_code: "",
//     shipping_state: "",
//     shipping_country: "",
//     shipping_branch_name: "",
//     shipping_gstin: "",
//     billing_address_line1: "",
//     billing_address_line2: "",
//     billing_city: "",
//     billing_pin_code: "",
//     billing_state: "",
//     billing_country: "",
//     billing_branch_name: "",
//     billing_gstin: ""
//   });

//   useEffect(() => {
//       // Fetch account groups
//     const fetchAccountGroups = async () => {
//       try {
//         setLoadingGroups(true);
//         const response = await axios.get(`${baseurl}/accountgroup`);
//         setAccountGroups(response.data);
//       } catch (err) {
//         console.error('Failed to fetch account groups', err);
//         setAccountGroups([]);
//       } finally {
//         setLoadingGroups(false);
//       }
//     };

//     fetchAccountGroups();
//     if (id) {
//       const fetchCustomer = async () => {
//         try {
//           const response = await axios.get(`${baseurl}/accounts/${id}`);
//           setFormData(response.data);
//           setIsEditing(true);
          
//           const isSameAddress = 
//             response.data.billing_address_line1 === response.data.shipping_address_line1 &&
//             response.data.billing_address_line2 === response.data.shipping_address_line2 &&
//             response.data.billing_city === response.data.shipping_city &&
//             response.data.billing_pin_code === response.data.shipping_pin_code &&
//             response.data.billing_state === response.data.shipping_state &&
//             response.data.billing_country === response.data.shipping_country &&
//             response.data.billing_branch_name === response.data.shipping_branch_name &&
//             response.data.billing_gstin === response.data.shipping_gstin;
            
//           setSameAsShipping(isSameAddress);
//         } catch (err) {
//           console.error('Failed to fetch customer data', err);
//         }
//       };
//       fetchCustomer();
//     }
//   }, [id]);

//   const handleGstinChange = async (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }

//     // Only make API call if GSTIN is 15 characters (valid length)
//     if (name === 'gstin' && value.length === 15) {
//       try {
//         setIsLoadingGstin(true);
//         setGstinError(null);
        
//         const response = await axios.post(`${baseurl}/gstin-details`, { gstin: value });
        
//         if (response.data.success && response.data.result) {
//           const result = response.data.result;
//           const addr = result.pradr?.addr || {};
          
//           // Construct address lines
//           const addressLine1 = `${addr.bno || ''}${addr.bno && addr.flno ? ', ' : ''}${addr.flno || ''}`.trim();
//           const addressLine2 = `${addr.st || ''}${addr.st && addr.bnm ? ', ' : ''}${addr.bnm || ''}${(addr.st || addr.bnm) && addr.loc ? ', ' : ''}${addr.loc || ''}`.trim();
          
//           // Update form data with the fetched values
//           setFormData(prev => ({
//             ...prev,
//             gst_registered_name: result.lgnm || '',
//             business_name: result.tradeNam || '',
//             additional_business_name: result.tradeNam || '',
//             display_name: result.lgnm || '',
//             shipping_address_line1: addressLine1,
//             shipping_address_line2: addressLine2,
//             shipping_city: result.ctj || '',
//             shipping_pin_code: addr.pncd || '',
//             shipping_state: addr.stcd || '',
//             shipping_country: 'India',
//             // Also update billing address by default
//             billing_address_line1: addressLine1,
//             billing_address_line2: addressLine2,
//             billing_city: result.ctj || '',
//             billing_pin_code: addr.pncd || '',
//             billing_state: addr.stcd || '',
//             billing_country: 'India'
//           }));
          
//           // Set same as shipping address to true since we're populating both
//           setSameAsShipping(true);
//         }
//       } catch (error) {
//         setGstinError('Failed to fetch GSTIN details. Please enter manually.');
//         console.error('Error fetching GSTIN details:', error);
//       } finally {
//         setIsLoadingGstin(false);
//       }
//     }
//   };

//   const tabs = [
//     { id: 'information', label: 'Information' },
//     { id: 'banking', label: 'Banking & Taxes' },
//     { id: 'shipping', label: 'Shipping Address' },
//     { id: 'billing', label: 'Billing Address' }
//   ];

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateCurrentTab = () => {
//     const newErrors = {};
    
//     switch (activeTab) {
//       case 'information':
//         const infoFields = ['title', 'name', 'entity_type', 'group', 'mobile_number', 'email', 'display_name'];
//         infoFields.forEach(field => {
//           if (!formData[field]) {
//             newErrors[field] = 'This field is required';
//           }
//         });
        
//         // Email validation
//         if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//           newErrors.email = 'Invalid email format';
//         }

//         // Mobile validation
//         if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
//           newErrors.mobile_number = 'Invalid mobile number (10 digits required)';
//         }
//         break;
        
//       case 'banking':
//         const bankingFields = ['account_number', 'account_name', 'bank_name', 'account_type', 'ifsc_code', 'branch_name', 'pan', 'currency', 'terms_of_payment', 'reverse_charge', 'export_sez'];
//         bankingFields.forEach(field => {
//           if (!formData[field]) {
//             newErrors[field] = 'This field is required';
//           }
//         });
//         break;
        
//       case 'shipping':
//         const shippingFields = ['shipping_address_line1', 'shipping_city', 'shipping_pin_code', 'shipping_state', 'shipping_country'];
//         shippingFields.forEach(field => {
//           if (!formData[field]) {
//             newErrors[field] = 'This field is required';
//           }
//         });
        
//         // PIN code validation
//         if (formData.shipping_pin_code && !/^[0-9]{6}$/.test(formData.shipping_pin_code)) {
//           newErrors.shipping_pin_code = 'Invalid PIN code (6 digits required)';
//         }
//         break;
        
//       case 'billing':
//         if (!sameAsShipping) {
//           const billingFields = ['billing_address_line1', 'billing_city', 'billing_pin_code', 'billing_state', 'billing_country'];
//           billingFields.forEach(field => {
//             if (!formData[field]) {
//               newErrors[field] = 'This field is required';
//             }
//           });
          
//           if (formData.billing_pin_code && !/^[0-9]{6}$/.test(formData.billing_pin_code)) {
//             newErrors.billing_pin_code = 'Invalid PIN code (6 digits required)';
//           }
//         }
//         break;
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (!validateCurrentTab()) {
//       return;
//     }
    
//     const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
//     if (currentIndex < tabs.length - 1) {
//       setActiveTab(tabs[currentIndex + 1].id);
//     }
//   };

//   const handleBack = () => {
//     const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
//     if (currentIndex > 0) {
//       setActiveTab(tabs[currentIndex - 1].id);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateCurrentTab()) {
//       return;
//     }

//     let finalData = { ...formData };

//     if (sameAsShipping) {
//       finalData = {
//         ...finalData,
//         billing_address_line1: formData.shipping_address_line1,
//         billing_address_line2: formData.shipping_address_line2,
//         billing_city: formData.shipping_city,
//         billing_pin_code: formData.shipping_pin_code,
//         billing_state: formData.shipping_state,
//         billing_country: formData.shipping_country,
//         billing_branch_name: formData.shipping_branch_name,
//         billing_gstin: formData.shipping_gstin
//       };
//     }

//     try {
//       if (isEditing) {
//         await axios.put(`${baseurl}/accounts/${id}`, finalData);
//         alert('Customer updated successfully!');
//       } else {
//         await axios.post(`${baseurl}/accounts`, finalData);
//         alert('Customer added successfully!');
//       }
//       navigate('/view-customers');
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to ${isEditing ? 'update' : 'add'} customer`);
//     }
//   };

//   const renderError = (fieldName) => {
//     return errors[fieldName] ? (
//       <div className="invalid-feedback" style={{ display: 'block' }}>
//         {errors[fieldName]}
//       </div>
//     ) : null;
//   };

//   const getInputClass = (fieldName) => {
//     return `form-control customer-form-input ${errors[fieldName] ? 'is-invalid' : ''}`;
//   };

//   const getSelectClass = (fieldName) => {
//     return `form-select customer-form-input ${errors[fieldName] ? 'is-invalid' : ''}`;
//   };

//   // Function to render the current active tab content
//   const renderActiveTab = () => {
//     switch (activeTab) {
//       case 'information':
//         return (
//           <FormSection
//             id="information"
//             activeTab={activeTab}
//             title="Information"
//             onBack={null}
//             onNext={handleNext}
//             nextLabel="Banking & Taxes"
//           >
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="row">
//                   <div className="col-md-4">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Title*</label>
//                       <select className={getSelectClass('title')} name="title" value={formData.title} onChange={handleChange} required>
//                         <option value="">Select</option>
//                         <option value="Mr.">Mr.</option>
//                         <option value="Mrs.">Mrs.</option>
//                         <option value="Ms.">Ms.</option>
//                         <option value="Dr.">Dr.</option>
//                       </select>
//                       {renderError('title')}
//                     </div>
//                   </div>
//                   <div className="col-md-8">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Name*</label>
//                       <input type="text" name="name" value={formData.name} className={getInputClass('name')} onChange={handleChange} required />
//                       {renderError('name')}
//                     </div>
//                   </div>
//                 </div>

             
//                <div className="mb-3">
//                   <label className="customer-form-label">Group Type*</label>
//                   <select 
//                     className={getSelectClass('group')} 
//                     name="group" 
//                     value={formData.group} 
//                     onChange={handleChange} 
//                     required
//                   >
//                     <option value="">Select Group Type</option>
//                     {loadingGroups ? (
//                       <option value="" disabled>Loading groups...</option>
//                     ) : (
//                       accountGroups.map((group) => (
//                         <option key={group.accountgroup_id} value={group.AccountsGroupName}>
//                           {group.AccountsGroupName}
//                         </option>
//                       ))
//                     )}
//                   </select>
//                   {renderError('group')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Customer GSTIN*</label>
//                   <input 
//                     type="text" 
//                     name="gstin" 
//                     value={formData.gstin} 
//                     className={getInputClass('gstin')} 
//                     onChange={handleGstinChange} 
//                     required 
//                     maxLength="15"
//                   />
//                   {isLoadingGstin && <div className="text-muted small">Fetching details...</div>}
//                   {gstinError && <div className="text-danger small">{gstinError}</div>}
//                   {renderError('gstin')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Business Name*</label>
//                   <input type="text" name="business_name" value={formData.business_name} className={getInputClass('business_name')} onChange={handleChange} required />
//                   {renderError('business_name')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Display Name*</label>
//                   <input type="text" name="display_name" value={formData.display_name} className={getInputClass('display_name')} onChange={handleChange} required />
//                   {renderError('display_name')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Fax*</label>
//                   <input type="text" name="fax" value={formData.fax} className={getInputClass('fax')} onChange={handleChange} required />
//                   {renderError('fax')}
//                 </div>
//               </div>

//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">Entity Type*</label>
//                   <select className={getSelectClass('entity_type')} name="entity_type" value={formData.entity_type} onChange={handleChange} required>
//                     <option value="">Select an Entity Type</option>
//                     <option value="Individual">Individual</option>
//                     <option value="Company">Company</option>
//                     <option value="Partnership">Partnership</option>
//                   </select>
//                   {renderError('entity_type')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Email*</label>
//                   <input type="email" name="email" value={formData.email} className={getInputClass('email')} onChange={handleChange} required />
//                   {renderError('email')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Customer GST Registered Name*</label>
//                   <input type="text" name="gst_registered_name" value={formData.gst_registered_name} className={getInputClass('gst_registered_name')} onChange={handleChange} required />
//                   {renderError('gst_registered_name')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Additional Business Name*</label>
//                   <input type="text" name="additional_business_name" value={formData.additional_business_name} className={getInputClass('additional_business_name')} onChange={handleChange} required />
//                   {renderError('additional_business_name')}
//                 </div>

//                 <div className="mb-3">
//                   <label className="customer-form-label">Phone Number*</label>
//                   <input type="tel" name="phone_number" value={formData.phone_number} className={getInputClass('phone_number')} onChange={handleChange} required />
//                   {renderError('phone_number')}
//                 </div>
//     <div className="mb-3">
//                   <label className="customer-form-label">Mobile Number*</label>
//                   <input type="tel" name="mobile_number" value={formData.mobile_number} className={getInputClass('mobile_number')} onChange={handleChange} required />
//                   {renderError('mobile_number')}
//                 </div>

//               </div>


               
//             </div>
//           </FormSection>
//         );

//       case 'banking':
//         return (
//           <FormSection
//             id="banking"
//             activeTab={activeTab}
//             title="Banking & Taxes"
//             onBack={handleBack}
//             onNext={handleNext}
//             nextLabel="Shipping Address"
//           >
//             <div className="mb-4">
//               <h3 className="customer-subsection-title">Account Information</h3>
//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Account Number*</label>
//                     <input type="text" name="account_number" value={formData.account_number} className={getInputClass('account_number')} onChange={handleChange} required />
//                     {renderError('account_number')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Account Name*</label>
//                     <input type="text" name="account_name" value={formData.account_name} className={getInputClass('account_name')} onChange={handleChange} required />
//                     {renderError('account_name')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Bank Name*</label>
//                     <select className={getSelectClass('bank_name')} name="bank_name" value={formData.bank_name} onChange={handleChange} required>
//                       <option value="">Select Bank Name</option>
//                       <option value="SBI">SBI</option>
//                       <option value="ANDHRA">ANDHRA</option>
//                       <option value="HDFC">HDFC</option>
//                       <option value="ICICI">ICICI</option>
//                     </select>
//                     {renderError('bank_name')}
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">IFSC Code*</label>
//                     <input type="text" name="ifsc_code" value={formData.ifsc_code} className={getInputClass('ifsc_code')} onChange={handleChange} required />
//                     {renderError('ifsc_code')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Account Type*</label>
//                     <select className={getSelectClass('account_type')} name="account_type" value={formData.account_type} onChange={handleChange} required>
//                       <option value="">Select</option>
//                       <option value="Savings Account">Savings Account</option>
//                       <option value="Current Account">Current Account</option>
//                     </select>
//                     {renderError('account_type')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Branch Name*</label>
//                     <input type="text" name="branch_name" value={formData.branch_name} className={getInputClass('branch_name')} onChange={handleChange} required />
//                     {renderError('branch_name')}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mb-4">
//               <h3 className="customer-subsection-title">Tax Information</h3>
//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">PAN*</label>
//                     <input type="text" name="pan" value={formData.pan} className={getInputClass('pan')} onChange={handleChange} required />
//                     {renderError('pan')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">TAN*</label>
//                     <input type="text" name="tan" value={formData.tan} className={getInputClass('tan')} onChange={handleChange} required />
//                     {renderError('tan')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">TCS Slab Rate*</label>
//                     <select className={getSelectClass('tds_slab_rate')} name="tds_slab_rate" value={formData.tds_slab_rate} onChange={handleChange} required>
//                       <option value="">Select</option>
//                       <option value="Not Applicable">TCS Not Applicable</option>
//                       <option value="0.1%">0.1%</option>
//                       <option value="1%">1%</option>
//                       <option value="5%">5%</option>
//                     </select>
//                     {renderError('tds_slab_rate')}
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Currency*</label>
//                     <select className={getSelectClass('currency')} name="currency" value={formData.currency} onChange={handleChange} required>
//                       <option value="">Select</option>
//                       <option value="INR">INR</option>
//                       <option value="USD">US Dollar</option>
//                       <option value="EUR">Euro</option>
//                     </select>
//                     {renderError('currency')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Terms of Payment*</label>
//                     <select className={getSelectClass('terms_of_payment')} name="terms_of_payment" value={formData.terms_of_payment} onChange={handleChange} required>
//                       <option value="">Select Terms of Payment</option>
//                       <option value="Net 15">Net 15</option>
//                       <option value="Net 30">Net 30</option>
//                       <option value="Net 60">Net 60</option>
//                     </select>
//                     {renderError('terms_of_payment')}
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Apply Reverse Charge*</label>
//                     <select className={getSelectClass('reverse_charge')} name="reverse_charge" value={formData.reverse_charge} onChange={handleChange} required>
//                       <option value="">Select</option>
//                       <option value="Yes">Yes</option>
//                       <option value="No">No</option>
//                     </select>
//                     {renderError('reverse_charge')}
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="mb-3">
//                     <label className="customer-form-label">Export or SEZ Developer*</label>
//                     <select className={getSelectClass('export_sez')} name="export_sez" value={formData.export_sez} onChange={handleChange} required>
//                       <option value="">Select</option>
//                       <option value="Not Applicable">Not Applicable</option>
//                       <option value="Export">Export</option>
//                       <option value="SEZ Developer">SEZ Developer</option>
//                     </select>
//                     {renderError('export_sez')}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </FormSection>
//         );

//       case 'shipping':
//         return (
//           <FormSection
//             id="shipping"
//             activeTab={activeTab}
//             title="Shipping Address"
//             onBack={handleBack}
//             onNext={handleNext}
//             nextLabel="Billing Address"
//           >
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">Address Line 1*</label>
//                   <input type="text" name="shipping_address_line1" value={formData.shipping_address_line1} className={getInputClass('shipping_address_line1')} onChange={handleChange} required />
//                   {renderError('shipping_address_line1')}
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">Address Line 2*</label>
//                   <input type="text" name="shipping_address_line2" value={formData.shipping_address_line2} className={getInputClass('shipping_address_line2')} onChange={handleChange} required />
//                   {renderError('shipping_address_line2')}
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">City*</label>
//                   <input type="text" name="shipping_city" value={formData.shipping_city} className={getInputClass('shipping_city')} onChange={handleChange} required />
//                   {renderError('shipping_city')}
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">Pin Code*</label>
//                   <input type="text" name="shipping_pin_code" value={formData.shipping_pin_code} className={getInputClass('shipping_pin_code')} onChange={handleChange} required />
//                   {renderError('shipping_pin_code')}
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">State*</label>
//                   <select className={getSelectClass('shipping_state')} name="shipping_state" value={formData.shipping_state} onChange={handleChange} required>
//                     <option value="">Select a State</option>
//                     <option value="Telangana">Telangana</option>
//                     <option value="Andra Pradesh">Andra Pradesh</option>
//                     <option value="Kerala">Kerala</option>
//                     <option value="Karnataka">Karnataka</option>
//                   </select>
//                   {renderError('shipping_state')}
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">Country*</label>
//                   <select className={getSelectClass('shipping_country')} name="shipping_country" value={formData.shipping_country} onChange={handleChange} required>
//                     <option value="">Select a Country</option>
//                     <option value="India">India</option>
//                     <option value="Bangladesh">Bangladesh</option>
//                     <option value="Canada">Canada</option>
//                     <option value="Iraq">Iraq</option>
//                   </select>
//                   {renderError('shipping_country')}
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">Branch Name*</label>
//                   <input type="text" name="shipping_branch_name" value={formData.shipping_branch_name} className={getInputClass('shipping_branch_name')} onChange={handleChange} required />
//                   {renderError('shipping_branch_name')}
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="customer-form-label">GSTIN*</label>
//                   <input type="text" name="shipping_gstin" value={formData.shipping_gstin} className={getInputClass('shipping_gstin')} onChange={handleChange} required />
//                   {renderError('shipping_gstin')}
//                 </div>
//               </div>
//             </div>
//           </FormSection>
//         );

//       case 'billing':
//         return (
//           <FormSection
//             id="billing"
//             activeTab={activeTab}
//             title="Billing Address"
//             onBack={handleBack}
//             onSubmit={handleSubmit}
//             isLast={true}
//           >
//             <div className="mb-3">
//               <div className="form-check">
//                 <input
//                   className="form-check-input"
//                   type="checkbox"
//                   id="sameAsShipping"
//                   checked={sameAsShipping}
//                   onChange={(e) => setSameAsShipping(e.target.checked)}
//                 />
//                 <label className="form-check-label" htmlFor="sameAsShipping">
//                   Shipping address is same as billing address
//                 </label>
//               </div>
//             </div>

//             {!sameAsShipping && (
//               <>
//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Address Line 1*</label>
//                       <input type="text" name="billing_address_line1" value={formData.billing_address_line1} className={getInputClass('billing_address_line1')} onChange={handleChange} required />
//                       {renderError('billing_address_line1')}
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Address Line 2*</label>
//                       <input type="text" name="billing_address_line2" value={formData.billing_address_line2} className={getInputClass('billing_address_line2')} onChange={handleChange} required />
//                       {renderError('billing_address_line2')}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">City*</label>
//                       <input type="text" name="billing_city" value={formData.billing_city} className={getInputClass('billing_city')} onChange={handleChange} required />
//                       {renderError('billing_city')}
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Pin Code*</label>
//                       <input type="text" name="billing_pin_code" value={formData.billing_pin_code} className={getInputClass('billing_pin_code')} onChange={handleChange} required />
//                       {renderError('billing_pin_code')}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">State*</label>
//                       <select className={getSelectClass('billing_state')} name="billing_state" value={formData.billing_state} onChange={handleChange} required>
//                         <option value="">Select a State</option>
//                         <option value="Telangana">Telangana</option>
//                         <option value="Andra Pradesh">Andra Pradesh</option>
//                         <option value="Kerala">Kerala</option>
//                         <option value="Karnataka">Karnataka</option>
//                       </select>
//                       {renderError('billing_state')}
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Country*</label>
//                       <select className={getSelectClass('billing_country')} name="billing_country" value={formData.billing_country} onChange={handleChange} required>
//                         <option value="">Select a Country</option>
//                         <option value="India">India</option>
//                         <option value="Bangladesh">Bangladesh</option>
//                         <option value="Canada">Canada</option>
//                         <option value="Iraq">Iraq</option>
//                       </select>
//                       {renderError('billing_country')}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Branch Name*</label>
//                       <input type="text" name="billing_branch_name" value={formData.billing_branch_name} className={getInputClass('billing_branch_name')} onChange={handleChange} required />
//                       {renderError('billing_branch_name')}
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">GSTIN*</label>
//                       <input type="text" name="billing_gstin" value={formData.billing_gstin} className={getInputClass('billing_gstin')} onChange={handleChange} required />
//                       {renderError('billing_gstin')}
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </FormSection>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <FormLayout
//       user={user}
//       title={isEditing ? "Edit Customer" : "Add Customer"}
//       tabs={tabs}
//       activeTab={activeTab}
//       onTabClick={handleTabClick}
//       sidebarCollapsed={sidebarCollapsed}
//       setSidebarCollapsed={setSidebarCollapsed}
//     >
//       <form onSubmit={handleSubmit}>
//         {renderActiveTab()}
//       </form>
//     </FormLayout>
//   );
// };

// export default AddCustomerForm;





import React, { useState, useEffect } from 'react'; 
import FormLayout, { FormSection } from '../../../Layouts/FormLayout/FormLayout';
import "./AddRetailer.css";
import axios from 'axios'; 
import { useParams, useNavigate } from 'react-router-dom';
import { baseurl } from './../../../BaseURL/BaseURL';

const RetailerForm = ({ user, mode = 'add' }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [isViewing, setIsViewing] = useState(mode === 'view');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isLoadingGstin, setIsLoadingGstin] = useState(false);
  const [gstinError, setGstinError] = useState(null);
  const [accountGroups, setAccountGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loading, setLoading] = useState(mode !== 'add');
  const [staffList, setStaffList] = useState([]);
  
  const [formData, setFormData] = useState({
    group: "customer",
    title: "",
    entity_type: "",
    name: "",
    role: "retailer",
    status: "Active",
    group: "",
    mobile_number: "",
    email: "",
    assigned_staff: "",
    staffid: "",
    password: "",
    discount: 0, // Added discount field
    Target: 100000, // Added Target field
    gstin: "",
    gst_registered_name: "",
    business_name: "",
    additional_business_name: "",
    display_name: "",
    phone_number: "",
    fax: "",
    account_number: "",
    account_name: "",
    bank_name: "",
    account_type: "",
    branch_name: "",
    ifsc_code: "",
    pan: "",
    tan: "",
    tds_slab_rate: "",
    currency: "",
    terms_of_payment: "",
    reverse_charge: "",
    export_sez: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_pin_code: "",
    shipping_state: "",
    shipping_country: "",
    shipping_branch_name: "",
    shipping_gstin: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_pin_code: "",
    billing_state: "",
    billing_country: "",
    billing_branch_name: "",
    billing_gstin: ""
  });

  useEffect(() => {
    const fetchAccountGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await axios.get(`${baseurl}/accountgroup`);
        setAccountGroups(response.data);
      } catch (err) {
        console.error('Failed to fetch account groups', err);
        setAccountGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchAccountGroups();

    if (id && mode !== 'add') {
      const fetchRetailer = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${baseurl}/accounts/${id}`);
          const data = response.data;
          
          setFormData(data);
          setIsEditing(mode === 'edit');
          setIsViewing(mode === 'view');
          
          const isSameAddress = 
            data.billing_address_line1 === data.shipping_address_line1 &&
            data.billing_address_line2 === data.shipping_address_line2 &&
            data.billing_city === data.shipping_city &&
            data.billing_pin_code === data.shipping_pin_code &&
            data.billing_state === data.shipping_state &&
            data.billing_country === data.shipping_country &&
            data.billing_branch_name === data.shipping_branch_name &&
            data.billing_gstin === data.shipping_gstin;
            
          setSameAsShipping(isSameAddress);
        } catch (err) {
          console.error('Failed to fetch retailer data', err);
          alert('Failed to load retailer data');
        } finally {
          setLoading(false);
        }
      };
      fetchRetailer();
    }
  }, [id, mode]);

  // Sync assigned_staff name when staffid changes or staffList loads
  useEffect(() => {
    if (formData.staffid && staffList.length > 0) {
      const selectedOption = staffList.find(option => option.value == formData.staffid);
      if (selectedOption && formData.assigned_staff !== selectedOption.label) {
        setFormData(prev => ({ ...prev, assigned_staff: selectedOption.label }));
      }
    }
  }, [formData.staffid, staffList]);

  const handleGstinChange = async (e) => {
    const { name, value } = e.target;
    const gstin = value.toUpperCase();

    setFormData(prev => ({ ...prev, [name]: gstin }));

    if (gstin.length === 15) {
      setIsLoadingGstin(true);
      setGstinError(null);

      try {
        const response = await axios.post(`${baseurl}/gstin-details`, { gstin });

        if (response.data.success && response.data.result) {
          const result = response.data.result;

          setFormData(prev => ({
            ...prev,
            gst_registered_name: result.gst_registered_name || '',
            business_name: result.business_name || '',
            additional_business_name: result.additional_business_name || '',
            display_name: result.display_name || '',
            shipping_address_line1: result.shipping_address_line1 || '',
            shipping_address_line2: result.shipping_address_line2 || '',
            shipping_city: result.shipping_city || '',
            shipping_pin_code: result.shipping_pin_code || '',
            shipping_state: result.shipping_state || '',
            shipping_country: 'India',
            billing_address_line1: result.billing_address_line1 || '',
            billing_address_line2: result.billing_address_line2 || '',
            billing_city: result.billing_city || '',
            billing_pin_code: result.billing_pin_code || '',
            billing_state: result.billing_state || '',
            billing_country: 'India'
          }));

          setSameAsShipping(true);
        } else {
          setGstinError(response.data.message || "GSTIN details not found. Enter manually.");
        }
      } catch (err) {
        console.error("Error fetching GSTIN details:", err);
        setGstinError("Failed to fetch GSTIN details. Enter manually.");
      } finally {
        setIsLoadingGstin(false);
      }
    } else {
      setGstinError(null);
    }
  };

  const tabs = [
    { id: 'information', label: 'Information' },
    { id: 'banking', label: 'Banking & Taxes' },
    { id: 'shipping', label: 'Shipping Address' },
    { id: 'billing', label: 'Billing Address' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleChange = (e) => {
    if (isViewing) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Special handling for staffid
    if (name === 'staffid') {
      const selectedOption = staffList.find(option => option.value === value);
      if (selectedOption) {
        setFormData(prev => ({ ...prev, assigned_staff: selectedOption.label }));
      } else {
        setFormData(prev => ({ ...prev, assigned_staff: '' }));
      }
    }
  };

  const validateCurrentTab = () => {
    if (isViewing) return true;
    
    const newErrors = {};
    
    switch (activeTab) {
      case 'information':
        const infoFields = ['title', 'name', 'role', 'entity_type', 'group', 'mobile_number', 'email', 'assigned_staff', 'display_name', 'password'];
        infoFields.forEach(field => {
          if (!formData[field]) {
            newErrors[field] = 'This field is required';
          }
        });
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }

        if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
          newErrors.mobile_number = 'Invalid mobile number (10 digits required)';
        }
        break;
        
      case 'banking':
        const bankingFields = ['account_number', 'account_name', 'bank_name', 'account_type', 'ifsc_code', 'branch_name', 'pan', 'currency', 'terms_of_payment'];
        bankingFields.forEach(field => {
          if (!formData[field]) {
            newErrors[field] = 'This field is required';
          }
        });
        break;
        
      case 'shipping':
        const shippingFields = ['shipping_address_line1', 'shipping_city', 'shipping_pin_code', 'shipping_state', 'shipping_country'];
        shippingFields.forEach(field => {
          if (!formData[field]) {
            newErrors[field] = 'This field is required';
          }
        });
        
        if (formData.shipping_pin_code && !/^[0-9]{6}$/.test(formData.shipping_pin_code)) {
          newErrors.shipping_pin_code = 'Invalid PIN code (6 digits required)';
        }
        break;
        
      case 'billing':
        if (!sameAsShipping) {
          const billingFields = ['billing_address_line1', 'billing_city', 'billing_pin_code', 'billing_state', 'billing_country'];
          billingFields.forEach(field => {
            if (!formData[field]) {
              newErrors[field] = 'This field is required';
            }
          });
          
          if (formData.billing_pin_code && !/^[0-9]{6}$/.test(formData.billing_pin_code)) {
            newErrors.billing_pin_code = 'Invalid PIN code (6 digits required)';
          }
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentTab()) {
      alert('Please fill all required fields in the current tab.');
      return;
    }
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  useEffect(() => {
    // Auto-fill password when name changes
    setFormData(prev => ({
      ...prev,
      password: prev.name ? `${prev.name}@123` : ''
    }));
  }, [formData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewing) {
      navigate('/retailers');
      return;
    }
    
    if (!validateCurrentTab()) {
      return;
    }

    // Auto-generate password as Name@123
    let finalData = { 
      ...formData, 
      password: `${formData.name}@123` 
    };

    if (sameAsShipping) {
      finalData = {
        ...finalData,
        billing_address_line1: formData.shipping_address_line1,
        billing_address_line2: formData.shipping_address_line2,
        billing_city: formData.shipping_city,
        billing_pin_code: formData.shipping_pin_code,
        billing_state: formData.shipping_state,
        billing_country: formData.shipping_country,
        billing_branch_name: formData.shipping_branch_name,
        billing_gstin: formData.shipping_gstin
      };
    }

    try {
      if (isEditing) {
        await axios.put(`${baseurl}/accounts/${id}`, finalData);
        alert('Retailer updated successfully!');
      } else {
        await axios.post(`${baseurl}/accounts`, finalData);
        alert('Retailer added successfully!');
      }
      navigate('/retailers');
    } catch (err) {
      console.error(err);
      alert(`Failed to ${isEditing ? 'update' : 'add'} retailer`);
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${baseurl}/api/account`);
        if (res.data.success) {
          const options = res.data.staff.map((staff) => ({
            value: staff.id,
            label: staff.name,
          }));
          setStaffList(options);
        }
      } catch (err) {
        console.error("Failed to fetch staff data:", err);
      }
    };

    fetchStaff();
  }, []);

  const handleCancel = () => {
    navigate('/retailers');
  };

  const renderError = (fieldName) => {
    return errors[fieldName] ? (
      <div className="invalid-feedback" style={{ display: 'block' }}>
        {errors[fieldName]}
      </div>
    ) : null;
  };

  const getInputClass = (fieldName) => {
    return `form-control customer-form-input ${errors[fieldName] ? 'is-invalid' : ''} ${isViewing ? 'view-mode' : ''}`;
  };

  const getSelectClass = (fieldName) => {
    return `form-select customer-form-input ${errors[fieldName] ? 'is-invalid' : ''} ${isViewing ? 'view-mode' : ''}`;
  };

  const renderField = (fieldConfig) => {
    const { type = 'text', name, label, required = true, options, onChange: customOnChange, ...props } = fieldConfig;
    
    if (isViewing) {
      const displayValue = (name === 'staffid' && formData.assigned_staff) 
        ? formData.assigned_staff 
        : (formData[name] || 'N/A');
      
      return (
        <div className="mb-3">
          <label className="customer-form-label view-mode-label">{label}</label>
          <div className="view-mode-value">{displayValue}</div>
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div className="mb-3">
          <label className="customer-form-label">{label}{required && '*'}</label>
          <select 
            className={getSelectClass(name)} 
            name={name} 
            value={formData[name]} 
            onChange={handleChange} 
            required={required}
            {...props}
          >
            <option value="">Select</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderError(name)}
        </div>
      );
    }

    return (
      <div className="mb-3">
        <label className="customer-form-label">{label}{required && '*'}</label>
        <input 
          type={type} 
          name={name} 
          value={formData[name]} 
          className={getInputClass(name)} 
          onChange={customOnChange || handleChange} 
          required={required}
          {...props}
        />
        {renderError(name)}
      </div>
    );
  };

  const renderActiveTab = () => {
    if (loading) {
      return <div className="loading-spinner">Loading retailer data...</div>;
    }

    switch (activeTab) {
      case 'information':
        return (
          <FormSection
            id="information"
            activeTab={activeTab}
            title="Information"
            onBack={null}
            onNext={handleNext}
            nextLabel="Banking & Taxes"
            isViewing={isViewing}
            onCancel={handleCancel}
          >
            {/* First row - Title, Name, Entity Type */}
            <div className="row">
              <div className="col-md-6">
                <div className="row">
                  <div className="col-md-4">
                    {renderField({
                      type: 'select',
                      name: 'title',
                      label: 'Title',
                      options: [
                        { value: 'Mr.', label: 'Mr.' },
                        { value: 'Mrs.', label: 'Mrs.' },
                        { value: 'Ms.', label: 'Ms.' },
                        { value: 'Dr.', label: 'Dr.' }
                      ]
                    })}
                  </div>
                  <div className="col-md-8">
                    {renderField({
                      name: 'name',
                      label: 'Name'
                    })}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'entity_type',
                  label: 'Entity Type',
                  options: [
                    { value: 'Individual', label: 'Individual' },
                    { value: 'Company', label: 'Company' },
                    { value: 'Partnership', label: 'Partnership' }
                  ]
                })}
              </div>
            </div>

            {/* Second row - Group Type, GSTIN */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'group',
                  label: 'Group Type',
                  options: accountGroups.map(group => ({
                    value: group.AccountsGroupName,
                    label: group.AccountsGroupName
                  }))
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'gstin',
                  label: 'Customer GSTIN',
                  type: 'text',
                  maxLength: 15,
                  pattern: "^[0-9A-Z]{15}$",
                  title: "GSTIN must be exactly 15 characters (A-Z, 0-9 only)",
                  onChange: handleGstinChange
                })}
                {isLoadingGstin && <div className="text-muted small">Fetching GSTIN details...</div>}
                {gstinError && <div className="text-danger small">{gstinError}</div>}
              </div>
            </div>

            {/* Third row - Email, Assign Staff */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'email',
                  name: 'email',
                  label: 'Email'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'staffid',
                  label: 'Assign staff',
                  options: staffList
                })}
              </div>
            </div>

            {/* Fourth row - Business Name, Display Name */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'business_name',
                  label: 'Business Name'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'display_name',
                  label: 'Display Name'
                })}
              </div>
            </div>

            {/* Fifth row - GST Registered Name, Additional Business Name */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'gst_registered_name',
                  label: 'Customer GST Registered Name'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'additional_business_name',
                  label: 'Additional Business Name'
                })}
              </div>
            </div>

            {/* Sixth row - Phone Number, Fax */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'tel',
                  name: 'phone_number',
                  label: 'Phone Number'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'fax',
                  label: 'Fax'
                })}
              </div>
            </div>

            {/* Seventh row - Mobile Number, Password */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'tel',
                  name: 'mobile_number',
                  label: 'Mobile Number'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  type: 'text',
                  name: 'password',
                  label: 'Password',
                  value: formData.password,
                  disabled: true
                })}
              </div>
            </div>

            {/* Eighth row - Discount, Target */}
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'number',
                  name: 'discount',
                  label: 'Discount (%)',
                  min: 0,
                  max: 100,
                  step: 0.1
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  type: 'number',
                  name: 'Target',
                  label: 'Target (₹)',
                  min: 0,
                  step: 1000
                })}
              </div>
            </div>
          </FormSection>
        );

      case 'banking':
        return (
          <FormSection
            id="banking"
            activeTab={activeTab}
            title="Banking & Taxes"
            onBack={handleBack}
            onNext={handleNext}
            nextLabel="Shipping Address"
            isViewing={isViewing}
            onCancel={handleCancel}
          >
            <div className="mb-4">
              <h3 className="customer-subsection-title">Account Information</h3>
              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    name: 'account_number',
                    label: 'Account Number',
                    type: 'text',
                    maxLength: 18,
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    name: 'account_name',
                    label: 'Account Name'
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'bank_name',
                    label: 'Bank Name',
                    options: [
                      { value: 'SBI', label: 'SBI' },
                      { value: 'HDFC', label: 'HDFC' },
                      { value: 'ICICI', label: 'ICICI' },
                      { value: 'Axis Bank', label: 'Axis Bank' }
                    ]
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    name: 'ifsc_code',
                    label: 'IFSC Code',
                    type: 'text',
                    maxLength: 11,
                    pattern: "^[A-Z]{4}0[0-9A-Z]{6}$",
                    title: "IFSC Code format: 4 letters, 0, then 6 alphanumeric (e.g. SBIN0000123)",
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'account_type',
                    label: 'Account Type',
                    options: [
                      { value: 'Savings Account', label: 'Savings Account' },
                      { value: 'Current Account', label: 'Current Account' }
                    ]
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    name: 'branch_name',
                    label: 'Branch Name'
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="customer-subsection-title">Tax Information</h3>
              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    name: 'pan',
                    label: 'PAN',
                    type: 'text',
                    maxLength: 10,
                    pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
                    title: "PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)",
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    name: 'tan',
                    label: 'TAN'
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'tds_slab_rate',
                    label: 'TCS Slab Rate',
                    options: [
                      { value: 'Not Applicable', label: 'TCS Not Applicable' },
                      { value: '0.1%', label: '0.1%' },
                      { value: '1%', label: '1%' },
                      { value: '5%', label: '5%' }
                    ]
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'currency',
                    label: 'Currency',
                    options: [
                      { value: 'INR', label: 'INR' },
                      { value: 'USD', label: 'US Dollar' },
                      { value: 'EUR', label: 'Euro' }
                    ]
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'terms_of_payment',
                    label: 'Terms of Payment',
                    options: [
                      { value: 'Net 15', label: 'Net 15' },
                      { value: 'Net 30', label: 'Net 30' },
                      { value: 'Net 60', label: 'Net 60' }
                    ]
                  })}
                </div>
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'reverse_charge',
                    label: 'Apply Reverse Charge',
                    options: [
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  {renderField({
                    type: 'select',
                    name: 'export_sez',
                    label: 'Export or SEZ Developer',
                    options: [
                      { value: 'Not Applicable', label: 'Not Applicable' },
                      { value: 'Export', label: 'Export' },
                      { value: 'SEZ Developer', label: 'SEZ Developer' }
                    ]
                  })}
                </div>
              </div>
            </div>
          </FormSection>
        );

      case 'shipping':
        return (
          <FormSection
            id="shipping"
            activeTab={activeTab}
            title="Shipping Address"
            onBack={handleBack}
            onNext={handleNext}
            nextLabel="Billing Address"
            isViewing={isViewing}
            onCancel={handleCancel}
          >
            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_address_line1',
                  label: 'Address Line 1'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_address_line2',
                  label: 'Address Line 2'
                })}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_city',
                  label: 'City'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_pin_code',
                  label: 'Pin Code'
                })}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'shipping_state',
                  label: 'State',
                  options: [
                    { value: 'Telangana', label: 'Telangana' },
                    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                    { value: 'Kerala', label: 'Kerala' },
                    { value: 'Karnataka', label: 'Karnataka' }
                  ]
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  type: 'select',
                  name: 'shipping_country',
                  label: 'Country',
                  options: [
                    { value: 'India', label: 'India' },
                    { value: 'Bangladesh', label: 'Bangladesh' },
                    { value: 'Canada', label: 'Canada' },
                    { value: 'Iraq', label: 'Iraq' }
                  ]
                })}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_branch_name',
                  label: 'Branch Name'
                })}
              </div>
              <div className="col-md-6">
                {renderField({
                  name: 'shipping_gstin',
                  label: 'GSTIN',
                  type: 'text',
                  maxLength: 15,
                  pattern: "^[0-9A-Z]{15}$",
                  title: "GSTIN must be exactly 15 characters long (A-Z, 0-9 only)",
                  required: true
                })}
              </div>
            </div>
          </FormSection>
        );

      case 'billing':
        return (
          <FormSection
            id="billing"
            activeTab={activeTab}
            title="Billing Address"
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLast={true}
            isViewing={isViewing}
            onCancel={handleCancel}
            submitLabel={isEditing ? "Update Retailer" : "Add Retailer"}
          >
            {!isViewing && (
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    disabled={isViewing}
                  />
                  <label className="form-check-label" htmlFor="sameAsShipping">
                    Shipping address is same as billing address
                  </label>
                </div>
              </div>
            )}

            {!sameAsShipping || isViewing ? (
              <>
                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_address_line1',
                      label: 'Address Line 1'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_address_line2',
                      label: 'Address Line 2'
                    })}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_city',
                      label: 'City'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_pin_code',
                      label: 'Pin Code'
                    })}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      type: 'select',
                      name: 'billing_state',
                      label: 'State',
                      options: [
                        { value: 'Telangana', label: 'Telangana' },
                        { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                        { value: 'Kerala', label: 'Kerala' },
                        { value: 'Karnataka', label: 'Karnataka' }
                      ]
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      type: 'select',
                      name: 'billing_country',
                      label: 'Country',
                      options: [
                        { value: 'India', label: 'India' },
                        { value: 'Bangladesh', label: 'Bangladesh' },
                        { value: 'Canada', label: 'Canada' },
                        { value: 'Iraq', label: 'Iraq' }
                      ]
                    })}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_branch_name',
                      label: 'Branch Name'
                    })}
                  </div>
                  <div className="col-md-6">
                    {renderField({
                      name: 'billing_gstin',
                      label: 'GSTIN',
                      type: 'text',
                      maxLength: 15,
                      pattern: "^[0-9A-Z]{15}$",
                      title: "GSTIN must be exactly 15 characters long (A-Z, 0-9 only)",
                      required: true
                    })}
                  </div>
                </div>
              </>
            ) : (
              isViewing && (
                <div className="alert alert-info">
                  <strong>Note:</strong> Billing address is same as shipping address.
                </div>
              )
            )}
          </FormSection>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return "Add Retailer";
      case 'edit': return "Edit Retailer";
      case 'view': return "View Retailer";
      default: return "Retailer";
    }
  };

  return (
    <FormLayout
      user={user}
      title={getTitle()}
      tabs={tabs}
      activeTab={activeTab}
      onTabClick={handleTabClick}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      mode={mode}
    >
      <form onSubmit={handleSubmit}>
        {renderActiveTab()}
      </form>
    </FormLayout>
  );
};

export default RetailerForm;