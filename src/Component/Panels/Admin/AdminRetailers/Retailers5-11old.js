// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// // import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// // import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// // import "./Retailers.css";

// // function Retailers() {
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   const [retailersData, setRetailersData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const navigate = useNavigate();

// //   // Fetch data from API
// //   useEffect(() => {
// //     const fetchRetailers = async () => {
// //       try {
// //         const response = await fetch(`${baseurl}/accounts`);
// //         if (!response.ok) {
// //           throw new Error('Failed to fetch data');
// //         }
// //         const data = await response.json();
        
// //         // Transform API data to match table structure
// //         const transformedData = data.map(item => ({
// //           id: item.id,
// //           retailer: item.business_name || item.name,
// //           contact: `${item.mobile_number || ''}\n${item.email || ''}`,
// //           typeLocation: `${item.entity_type || 'Customer'}\n${item.billing_city || item.shipping_city || 'N/A'}`,
// //           assignedStaff: "Not Assigned", // This field doesn't exist in API
// //           performance: "0/10\n₹ 0", // Default performance data
// //           status: "Active" // Default status
// //         }));
        
// //         setRetailersData(transformedData);
// //         setLoading(false);
// //       } catch (err) {
// //         setError(err.message);
// //         setLoading(false);
// //       }
// //     };

// //     fetchRetailers();
// //   }, []);

// //   // Custom renderers
// //   const renderRetailerCell = (item) => (
// //     <div className="retailers-table__retailer-cell">
// //       <strong className="retailers-table__retailer-name">{item.retailer}</strong>
// //       <span className="retailers-table__retailer-id">ID: {item.id}</span>
// //     </div>
// //   );

// //   const renderContactCell = (item) => (
// //     <div className="retailers-table__contact-cell">
// //       <div className="retailers-table__contact-item">
// //         <span className="retailers-table__contact-icon">📞</span>
// //         {item.contact.split("\n")[0]}
// //       </div>
// //       <div className="retailers-table__contact-email">
// //         {item.contact.split("\n")[1]}
// //       </div>
// //     </div>
// //   );

// //   const renderTypeLocationCell = (item) => (
// //     <div className="retailers-table__type-location-cell">
// //       <strong className="retailers-table__type">
// //         {item.typeLocation.split("\n")[0]}
// //       </strong>
// //       <div className="retailers-table__location">
// //         <span className="retailers-table__location-icon">📍</span>
// //         {item.typeLocation.split("\n")[1]}
// //       </div>
// //     </div>
// //   );

// //   const renderPerformanceCell = (item) => (
// //     <div className="retailers-table__performance-cell">
// //       <div className="retailers-table__rating">
// //         <span className="retailers-table__rating-icon">⭐</span>
// //         {item.performance.split("\n")[0]}
// //       </div>
// //       <div className="retailers-table__revenue">
// //         {item.performance.split("\n")[1]}
// //       </div>
// //     </div>
// //   );

// //   const renderStatusCell = (item) => (
// //     <span
// //       className={`retailers-table__status retailers-table__status--${item.status.toLowerCase()}`}
// //     >
// //       {item.status}
// //     </span>
// //   );

// //   const columns = [
// //     { key: "retailer", title: "Retailer", render: renderRetailerCell },
// //     { key: "contact", title: "Contact", render: renderContactCell },
// //     { key: "typeLocation", title: "Type & Location", render: renderTypeLocationCell },
// //     { key: "assignedStaff", title: "Assigned Staff" },
// //     { key: "performance", title: "Performance", render: renderPerformanceCell },
// //     { key: "status", title: "Status", render: renderStatusCell }
// //   ];

// //   const handleAddRetailerClick = () => {
// //     navigate("/retailers/add");
// //   };

// //   // Loading state
// //   if (loading) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <AdminHeader isCollapsed={isCollapsed} />
// //           <div className="retailers-main-content">
// //             <div className="retailers-loading">Loading retailers...</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Error state
// //   if (error) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <AdminHeader isCollapsed={isCollapsed} />
// //           <div className="retailers-main-content">
// //             <div className="retailers-error">Error: {error}</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="retailers-wrapper">
// //       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
// //       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //         <AdminHeader isCollapsed={isCollapsed} />

// //         <div className="retailers-main-content">
// //           <div className="retailers-content-section">
// //             {/* Page Title and Add Button */}
// //             <div className="retailers-header-top">
// //               <div className="retailers-title-section">
// //                 <h1 className="retailers-main-title">All Retailers</h1>
// //                 <p className="retailers-subtitle">
// //                   Manage retailer relationships and track performance
// //                 </p>
// //               </div>
// //               <button
// //                 className="retailers-add-button retailers-add-button--top"
// //                 onClick={handleAddRetailerClick}
// //               >
// //                 <span className="retailers-add-icon">+</span>
// //                 Add Retailer
// //               </button>
// //             </div>

// //             {/* Search Bar */}
// //             <div className="retailers-search-container">
// //               <div className="retailers-search-box">
// //                 <span className="retailers-search-icon">🔍</span>
// //                 <input
// //                   type="text"
// //                   placeholder="Search retailers..."
// //                   className="retailers-search-input"
// //                 />
// //               </div>
// //             </div>

// //             {/* Retailers List Section */}
// //             <div className="retailers-list-section">
// //               <div className="retailers-section-header">
// //                 <h2 className="retailers-section-title">
// //                   Retailers ({retailersData.length})
// //                 </h2>
// //                 <p className="retailers-section-description">
// //                   Track retailer performance and manage relationships
// //                 </p>
// //               </div>

// //               {/* Table Section */}
// //               <div className="retailers-table-container">
// //                 {retailersData.length > 0 ? (
// //                   <ReusableTable
// //                     data={retailersData}
// //                     columns={columns}
// //                     initialEntriesPerPage={10}
// //                     searchPlaceholder="Search retailers..."
// //                     showSearch={false}
// //                     showEntriesSelector={true}
// //                     showPagination={true}
// //                   />
// //                 ) : (
// //                   <div className="retailers-no-data">
// //                     No retailers found. Click "Add Retailer" to get started.
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Retailers;





// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// // import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// // import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// // import "./Retailers.css";
// // import {baseurl} from "../../"

// // function Retailers() {
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   const [retailersData, setRetailersData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const navigate = useNavigate();

// //   // Fetch data from API
// //   const fetchRetailers = async () => {
// //     try {
// //       const response = await fetch(`${baseurl}/accounts`);
// //       if (!response.ok) {
// //         throw new Error('Failed to fetch data');
// //       }
// //       const data = await response.json();
      
// //       // Transform API data to match table structure
// //       const transformedData = data.map(item => ({
// //         id: item.id,
// //         retailer: item.business_name || item.name,
// //         contact: `${item.mobile_number || ''}\n${item.email || ''}`,
// //         typeLocation: `${item.entity_type || 'Customer'}\n${item.billing_city || item.shipping_city || 'N/A'}`,
// //         assignedStaff: "Not Assigned",
// //         performance: "0/10\n₹ 0",
// //         status: "Active",
// //         // Include original data for edit/view
// //         originalData: item
// //       }));
      
// //       setRetailersData(transformedData);
// //       setLoading(false);
// //     } catch (err) {
// //       setError(err.message);
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchRetailers();
// //   }, []);

// //   // Handle Edit
// //   const handleEdit = (retailer) => {
// //     navigate(`/retailers/edit/${retailer.id}`, { 
// //       state: { retailerData: retailer.originalData } 
// //     });
// //   };

// //   // Handle View
// //   const handleView = (retailer) => {
// //     navigate(`/retailers/view/${retailer.id}`, { 
// //       state: { retailerData: retailer.originalData } 
// //     });
// //   };

// //   // Handle Delete
// //   const handleDelete = async (retailer) => {
// //     if (window.confirm(`Are you sure you want to delete ${retailer.retailer}?`)) {
// //       try {
// //         const response = await fetch(`${baseurl}/accounts/${retailer.id}`, {
// //           method: 'DELETE'
// //         });

// //         if (!response.ok) {
// //           throw new Error('Failed to delete retailer');
// //         }

// //         // Refresh the data
// //         await fetchRetailers();
// //         alert('Retailer deleted successfully!');
// //       } catch (err) {
// //         alert('Error deleting retailer: ' + err.message);
// //       }
// //     }
// //   };

// //   // Action buttons renderer
// //   const renderActionsCell = (item) => (
// //     <div className="retailers-table__actions">
// //       <button 
// //         className="retailers-table__action-btn retailers-table__action-btn--view"
// //         onClick={() => handleView(item)}
// //         title="View Details"
// //       >
// //         👁️
// //       </button>
// //       <button 
// //         className="retailers-table__action-btn retailers-table__action-btn--edit"
// //         onClick={() => handleEdit(item)}
// //         title="Edit"
// //       >
// //         ✏️
// //       </button>
// //       <button 
// //         className="retailers-table__action-btn retailers-table__action-btn--delete"
// //         onClick={() => handleDelete(item)}
// //         title="Delete"
// //       >
// //         🗑️
// //       </button>
// //     </div>
// //   );

// //   // Custom renderers
// //   const renderRetailerCell = (item) => (
// //     <div className="retailers-table__retailer-cell">
// //       <strong className="retailers-table__retailer-name">{item.retailer}</strong>
// //       <span className="retailers-table__retailer-id">ID: {item.id}</span>
// //     </div>
// //   );

// //   const renderContactCell = (item) => (
// //     <div className="retailers-table__contact-cell">
// //       <div className="retailers-table__contact-item">
// //         <span className="retailers-table__contact-icon">📞</span>
// //         {item.contact.split("\n")[0]}
// //       </div>
// //       <div className="retailers-table__contact-email">
// //         {item.contact.split("\n")[1]}
// //       </div>
// //     </div>
// //   );

// //   const renderTypeLocationCell = (item) => (
// //     <div className="retailers-table__type-location-cell">
// //       <strong className="retailers-table__type">
// //         {item.typeLocation.split("\n")[0]}
// //       </strong>
// //       <div className="retailers-table__location">
// //         <span className="retailers-table__location-icon">📍</span>
// //         {item.typeLocation.split("\n")[1]}
// //       </div>
// //     </div>
// //   );

// //   const renderPerformanceCell = (item) => (
// //     <div className="retailers-table__performance-cell">
// //       <div className="retailers-table__rating">
// //         <span className="retailers-table__rating-icon">⭐</span>
// //         {item.performance.split("\n")[0]}
// //       </div>
// //       <div className="retailers-table__revenue">
// //         {item.performance.split("\n")[1]}
// //       </div>
// //     </div>
// //   );

// //   const renderStatusCell = (item) => (
// //     <span
// //       className={`retailers-table__status retailers-table__status--${item.status.toLowerCase()}`}
// //     >
// //       {item.status}
// //     </span>
// //   );

// //   const columns = [
// //     { key: "retailer", title: "Retailer", render: renderRetailerCell },
// //     { key: "contact", title: "Contact", render: renderContactCell },
// //     { key: "typeLocation", title: "Type & Location", render: renderTypeLocationCell },
// //     { key: "assignedStaff", title: "Assigned Staff" },
// //     { key: "performance", title: "Performance", render: renderPerformanceCell },
// //     { key: "status", title: "Status", render: renderStatusCell },
// //     { key: "actions", title: "Actions", render: renderActionsCell }
// //   ];

// //   const handleAddRetailerClick = () => {
// //     navigate("/retailers/add");
// //   };

// //   // Loading state
// //   if (loading) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <AdminHeader isCollapsed={isCollapsed} />
// //           <div className="retailers-main-content">
// //             <div className="retailers-loading">Loading retailers...</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Error state
// //   if (error) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <AdminHeader isCollapsed={isCollapsed} />
// //           <div className="retailers-main-content">
// //             <div className="retailers-error">Error: {error}</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="retailers-wrapper">
// //       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
// //       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //         <AdminHeader isCollapsed={isCollapsed} />

// //         <div className="retailers-main-content">
// //           <div className="retailers-content-section">
// //             {/* Page Title and Add Button */}
// //             <div className="retailers-header-top">
// //               <div className="retailers-title-section">
// //                 <h1 className="retailers-main-title">All Retailers</h1>
// //                 <p className="retailers-subtitle">
// //                   Manage retailer relationships and track performance
// //                 </p>
// //               </div>
// //               <button
// //                 className="retailers-add-button retailers-add-button--top"
// //                 onClick={handleAddRetailerClick}
// //               >
// //                 <span className="retailers-add-icon">+</span>
// //                 Add Retailer
// //               </button>
// //             </div>

// //             {/* Search Bar */}
// //             <div className="retailers-search-container">
// //               <div className="retailers-search-box">
// //                 <span className="retailers-search-icon">🔍</span>
// //                 <input
// //                   type="text"
// //                   placeholder="Search retailers..."
// //                   className="retailers-search-input"
// //                 />
// //               </div>
// //             </div>

// //             {/* Retailers List Section */}
// //             <div className="retailers-list-section">
// //               <div className="retailers-section-header">
// //                 <h2 className="retailers-section-title">
// //                   Retailers ({retailersData.length})
// //                 </h2>
// //                 <p className="retailers-section-description">
// //                   Track retailer performance and manage relationships
// //                 </p>
// //               </div>

// //               {/* Table Section */}
// //               <div className="retailers-table-container">
// //                 {retailersData.length > 0 ? (
// //                   <ReusableTable
// //                     data={retailersData}
// //                     columns={columns}
// //                     initialEntriesPerPage={10}
// //                     searchPlaceholder="Search retailers..."
// //                     showSearch={false}
// //                     showEntriesSelector={true}
// //                     showPagination={true}
// //                   />
// //                 ) : (
// //                   <div className="retailers-no-data">
// //                     No retailers found. Click "Add Retailer" to get started.
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Retailers;



// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// // import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// // import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// // import "./Retailers.css";
// // import axios from "axios";
// // import { baseurl } from "../../../BaseURL/BaseURL";
// // import { FaSearch } from "react-icons/fa";

// // function Retailers() {
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   const [isMobileOpen, setIsMobileOpen] = useState(false);
// //   const navigate = useNavigate();
// //   const [retailersData, setRetailersData] = useState([]);
// //   const [filteredRetailersData, setFilteredRetailersData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState("");

// //   // Fetch retailers data from API
// //   useEffect(() => {
// //     fetchRetailers();
// //   }, []);

// //   // Filter retailers by role when data changes
// //   useEffect(() => {
// //     if (retailersData.length > 0) {
// //       const filteredData = retailersData
// //         .filter(item => item.role === "retailer")
// //         .filter(item =>
// //           (item.business_name || item.name || "")
// //             .toLowerCase()
// //             .includes(searchTerm.toLowerCase()) ||
// //           (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
// //           (item.mobile_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
// //           (item.group || "").toLowerCase().includes(searchTerm.toLowerCase())
// //         );
// //       setFilteredRetailersData(filteredData);
// //     }
// //   }, [retailersData, searchTerm]);

// //   const fetchRetailers = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await axios.get(`${baseurl}/accounts`);
// //       setRetailersData(response.data);
// //       setError(null);
// //     } catch (err) {
// //       console.error('Failed to fetch retailers:', err);
// //       setError('Failed to load retailers data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle delete retailer
// //   const handleDelete = async (id, retailerName) => {
// //     if (window.confirm(`Are you sure you want to delete ${retailerName}?`)) {
// //       try {
// //         await axios.delete(`${baseurl}/accounts/${id}`);
// //         alert('Retailer deleted successfully!');
// //         fetchRetailers(); // Refresh the list
// //       } catch (err) {
// //         console.error('Failed to delete retailer:', err);
// //         alert('Failed to delete retailer');
// //       }
// //     }
// //   };

// //   // Handle edit retailer
// //   const handleEdit = (id) => {
// //     navigate(`/retailers/edit/${id}`);
// //   };

// //   // Handle view retailer
// //   const handleView = (id) => {
// //     navigate(`/retailers/view/${id}`);
// //   };

// //   // Handle mobile toggle
// //   const handleToggleMobile = () => {
// //     setIsMobileOpen(!isMobileOpen);
// //   };

// //   // Custom renderers
// //   const renderRetailerCell = (item) => (
// //     <div className="retailers-table__retailer-cell">
// //       <strong className="retailers-table__retailer-name">{item.business_name || item.name}</strong>
// //       <span className="retailers-table__retailer-id">ID: {item.id}</span>
// //     </div>
// //   );

// //   const renderContactCell = (item) => (
// //     <div className="retailers-table__contact-cell">
// //       <div className="retailers-table__contact-item">
// //         <span className="retailers-table__contact-icon">📞</span>
// //         {item.mobile_number}
// //       </div>
// //       <div className="retailers-table__contact-email">
// //         {item.email}
// //       </div>
// //     </div>
// //   );

// //   const renderTypeLocationCell = (item) => (
// //     <div className="retailers-table__type-location-cell">
// //       <strong className="retailers-table__type">
// //         {item.entity_type}
// //       </strong>
// //       <div className="retailers-table__location">
// //         <span className="retailers-table__location-icon">📍</span>
// //         {item.shipping_city}, {item.shipping_state}
// //       </div>
// //     </div>
// //   );

// //   const renderPerformanceCell = (item) => (
// //     <div className="retailers-table__performance-cell">
// //       <div className="retailers-table__rating">
// //         <span className="retailers-table__rating-icon">⭐</span>
// //         Discount: {item.discount || 0}%
// //       </div>
// //       <div className="retailers-table__revenue">
// //         Target: ₹ {item.Target ? parseInt(item.Target).toLocaleString() : "100,000"}
// //       </div>
// //     </div>
// //   );

// //   const renderGroupTypeCell = (item) => (
// //     <div className="retailers-table__group-type-cell">
// //       <span className="retailers-table__group-type">
// //         {item.group || "N/A"}
// //       </span>
// //     </div>
// //   );

// //   const renderStatusCell = (item) => (
// //     <span className={`retailers-table__status retailers-table__status--active`}>
// //       Active
// //     </span>
// //   );

// //   const renderActionsCell = (item) => (
// //     <div className="retailers-table__actions">
// //       <button 
// //         className="retailers-table__action-btn retailers-table__action-btn--view"
// //         onClick={() => handleView(item.id)}
// //         title="View"
// //       >
// //         👁️
// //       </button>
// //       <button 
// //         className="retailers-table__action-btn retailers-table__action-btn--edit"
// //         onClick={() => handleEdit(item.id)}
// //         title="Edit"
// //       >
// //         ✏️
// //       </button>
// //       <button 
// //         className="retailers-table__action-btn retailers-table__action-btn--delete"
// //         onClick={() => handleDelete(item.id, item.business_name || item.name)}
// //         title="Delete"
// //       >
// //         🗑️
// //       </button>
// //     </div>
// //   );

// //   const columns = [
// //     { key: "__item", title: "Retailer", render: (value, item) => renderRetailerCell(item) },
// //     { key: "__item", title: "Contact", render: (value, item) => renderContactCell(item) },
// //     { key: "__item", title: "Type & Location", render: (value, item) => renderTypeLocationCell(item) },
// //     { key: "display_name", title: "Display Name" },
// //     { key: "__item", title: "Group Type", render: (value, item) => renderGroupTypeCell(item) },
// //     { key: "__item", title: "Performance", render: (value, item) => renderPerformanceCell(item) },
// //     { key: "__item", title: "Status", render: (value, item) => renderStatusCell(item) },
// //     { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
// //   ];

// //   const handleAddRetailerClick = () => {
// //     navigate("/retailers/add");
// //   };

// //   if (loading) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar 
// //           isCollapsed={isCollapsed} 
// //           setIsCollapsed={setIsCollapsed}
// //           onToggleMobile={isMobileOpen}
// //         />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <div className="retailers-main-content">
// //             <div className="loading-spinner">Loading retailers...</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar 
// //           isCollapsed={isCollapsed} 
// //           setIsCollapsed={setIsCollapsed}
// //           onToggleMobile={isMobileOpen}
// //         />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <div className="retailers-main-content">
// //             <div className="error-message">
// //               <p>{error}</p>
// //               <button onClick={fetchRetailers} className="retry-button">
// //                 Try Again
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="retailers-wrapper">
// //       <AdminSidebar 
// //         isCollapsed={isCollapsed} 
// //         setIsCollapsed={setIsCollapsed}
// //         onToggleMobile={isMobileOpen}
// //       />
      
// //       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //         <AdminHeader 
// //           isCollapsed={isCollapsed} 
// //           onToggleSidebar={handleToggleMobile}
// //         />

// //         <div className="retailers-main-content">
// //           <div className="retailers-content-section">
// //             <div className="retailers-header-top">
// //               <div className="retailers-title-section">
// //                 <h1 className="retailers-main-title">All Retailers</h1>
// //                 <p className="retailers-subtitle">
// //                   Manage retailer relationships and track performance
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="d-flex justify-content-between align-items-center retailers-search-add-container">
// //               <div className="retailers-search-container">
// //                 <div className="retailers-search-box">
// //                   <input
// //                     type="text"
// //                     placeholder="Search retailers ..."
// //                     className="retailers-search-input"
// //                     value={searchTerm}
// //                     onChange={(e) => setSearchTerm(e.target.value)}
// //                   />
// //                   <FaSearch className="retailers-search-icon" size={18} />
// //                 </div>
// //               </div>

// //               <button
// //                 className="retailers-add-button retailers-add-button--top"
// //                 onClick={handleAddRetailerClick}
// //               >
// //                 <span className="retailers-add-icon">+</span>
// //                 Add Retailer
// //               </button>
// //             </div>

// //             <div className="retailers-list-section">
// //               <div className="retailers-section-header">
// //                 <h2 className="retailers-section-title">
// //                   Retailers ({filteredRetailersData.length})
// //                 </h2>
// //                 <p className="retailers-section-description">
// //                   Track retailer performance and manage relationships
// //                 </p>
// //               </div>

// //               <div className="retailers-table-container">
// //                 <ReusableTable
// //                   data={filteredRetailersData}
// //                   columns={columns}
// //                   initialEntriesPerPage={10}
// //                   searchPlaceholder="Search retailers..."
// //                   showSearch={true}
// //                   showEntriesSelector={true}
// //                   showPagination={true}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Retailers;


// //30-dec: before bulk uploads old code :

// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// // import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// // import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// // import "./Retailers.css";
// // import axios from "axios";
// // import { baseurl } from "../../../BaseURL/BaseURL";
// // import { FaSearch } from "react-icons/fa";

// // function Retailers() {
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   const [isMobileOpen, setIsMobileOpen] = useState(false);
// //   const navigate = useNavigate();
// //   const [retailersData, setRetailersData] = useState([]);
// //   const [filteredRetailersData, setFilteredRetailersData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [selectedRole, setSelectedRole] = useState("retailer");

// //   // Fetch retailers data from API
// //   useEffect(() => {
// //     fetchRetailers();
// //   }, []);

// //   // Filter retailers by role when data changes or role selection changes
// //   useEffect(() => {
// //     if (retailersData.length > 0) {
// //       const filteredData = retailersData
// //         .filter(item => {
// //           if (selectedRole === "retailer") {
// //             return item.role === "retailer";
// //           } else if (selectedRole === "supplier") {
// //             return item.role === "supplier";
// //           }
// //           return false;
// //         })
// //         .filter(item =>
// //           (item.business_name || item.name || "")
// //             .toLowerCase()
// //             .includes(searchTerm.toLowerCase()) ||
// //           (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
// //           (item.mobile_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
// //           (item.group || "").toLowerCase().includes(searchTerm.toLowerCase())
// //         );
// //       setFilteredRetailersData(filteredData);
// //     }
// //   }, [retailersData, searchTerm, selectedRole]);

// //   const fetchRetailers = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await axios.get(`${baseurl}/accounts`);
// //       setRetailersData(response.data);
// //       setError(null);
// //     } catch (err) {
// //       console.error('Failed to fetch retailers:', err);
// //       setError('Failed to load retailers data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle delete retailer/supplier
// //   const handleDelete = async (id, name) => {
// //     if (window.confirm(`Are you sure you want to delete ${name}?`)) {
// //       try {
// //         await axios.delete(`${baseurl}/accounts/${id}`);
// //         alert(`${selectedRole === 'retailer' ? 'Retailer' : 'Supplier'} deleted successfully!`);
// //         fetchRetailers();
// //       } catch (err) {
// //         console.error('Failed to delete:', err);
// //         alert(`Failed to delete ${selectedRole === 'retailer' ? 'retailer' : 'supplier'}`);
// //       }
// //     }
// //   };

// //   // Handle edit retailer/supplier
// //   const handleEdit = (id) => {
// //     navigate(`/retailers/edit/${id}`);
// //   };

// //   // Handle view retailer/supplier
// //   const handleView = (id) => {
// //     navigate(`/retailers/view/${id}`);
// //   };

// //   // Handle mobile toggle
// //   const handleToggleMobile = () => {
// //     setIsMobileOpen(!isMobileOpen);
// //   };

// //   // Handle add retailer
// //   const handleAddRetailer = () => {
// //     navigate("/retailers/add");
// //   };

// //   // Handle place order - UPDATED VERSION
// //   const handlePlaceOrder = (retailer) => {
// //     navigate("/retailers/place-order", {
// //       state: {
// //         retailerId: retailer.id,
// //         retailerName: retailer.business_name || retailer.name,
// //         displayName: retailer.display_name, // Add this line
// //         discount: retailer.discount || 0
// //       }
// //     });
// //   };

// //   // Custom renderers
// //   const renderRetailerCell = (item) => (
// //     <div className="retailers-table__retailer-cell">
// //       <strong className="retailers-table__retailer-name">{item.business_name || item.name}</strong>
// //       <span className="retailers-table__retailer-id">ID: {item.id}</span>
// //     </div>
// //   );

// //   const renderContactCell = (item) => (
// //     <div className="retailers-table__contact-cell">
// //       <div className="retailers-table__contact-item">
// //         <span className="retailers-table__contact-icon">📞</span>
// //         {item.mobile_number}
// //       </div>
// //       <div className="retailers-table__contact-email">
// //         {item.email}
// //       </div>
// //     </div>
// //   );

// //   const renderTypeLocationCell = (item) => (
// //     <div className="retailers-table__type-location-cell">
// //       <strong className="retailers-table__type">
// //         {item.entity_type}
// //       </strong>
// //       <div className="retailers-table__location">
// //         <span className="retailers-table__location-icon">📍</span>
// //         {item.shipping_city}, {item.shipping_state}
// //       </div>
// //     </div>
// //   );

// //   const renderPerformanceCell = (item) => (
// //     <div className="retailers-table__performance-cell">
// //       <div className="retailers-table__rating">
// //         <span className="retailers-table__rating-icon">⭐</span>
// //         Discount: {item.discount || 0}%
// //       </div>
// //       <div className="retailers-table__revenue">
// //         Target: ₹ {item.Target ? parseInt(item.Target).toLocaleString() : "100,000"}
// //       </div>
// //     </div>
// //   );

// //   const renderGroupTypeCell = (item) => (
// //     <div className="retailers-table__group-type-cell">
// //       <span className="retailers-table__group-type">
// //         {item.group || "N/A"}
// //       </span>
// //     </div>
// //   );

// //   const renderStatusCell = (item) => (
// //     <span className={`retailers-table__status retailers-table__status--active`}>
// //       Active
// //     </span>
// //   );

// // const renderActionsCell = (item) => (
// //     <div className="retailers-table__actions">
// //         <button
// //             className="retailers-table__action-btn retailers-table__action-btn--view"
// //             onClick={() => handleView(item.id)}
// //             title="View"
// //         >
// //             👁️
// //         </button>
// //         <button
// //             className="retailers-table__action-btn retailers-table__action-btn--edit"
// //             onClick={() => handleEdit(item.id)}
// //             title="Edit"
// //         >
// //             ✏️
// //         </button>
// //         <button
// //             className="retailers-table__action-btn retailers-table__action-btn--delete"
// //             onClick={() => handleDelete(item.id, item.business_name || item.name)}
// //             title="Delete"
// //         >
// //             🗑️
// //         </button>
// //     </div>
// // );

// // const columns = [
// //     { key: "__item", title: selectedRole === "retailer" ? "Retailer" : "Supplier", render: (value, item) => renderRetailerCell(item) },
// //     { key: "__item", title: "Contact", render: (value, item) => renderContactCell(item) },
// //     { key: "__item", title: "Type & Location", render: (value, item) => renderTypeLocationCell(item) },
// //     { key: "display_name", title: "Display Name" },
// //     { key: "__item", title: "Group Type", render: (value, item) => renderGroupTypeCell(item) },
// //     { key: "__item", title: "Performance", render: (value, item) => renderPerformanceCell(item) },
// //     { key: "__item", title: "Status", render: (value, item) => renderStatusCell(item) },
// //     { 
// //         key: "__item", 
// //         title: "Place Order", 
// //         render: (value, item) => (
// //             <button
// //                 className="retailers-table__order-btn"
// //                 onClick={() => handlePlaceOrder(item)}
// //                 title="Place Order"
// //             >
// //                 🛒 Order
// //             </button>
// //         )
// //     },
// //     { 
// //         key: "__item", 
// //         title: "Actions", 
// //         render: (value, item) => (
// //             <div className="retailers-table__actions">
// //                 <button
// //                     className="retailers-table__action-btn retailers-table__action-btn--view"
// //                     onClick={() => handleView(item.id)}
// //                     title="View"
// //                 >
// //                     👁️
// //                 </button>
// //                 <button
// //                     className="retailers-table__action-btn retailers-table__action-btn--edit"
// //                     onClick={() => handleEdit(item.id)}
// //                     title="Edit"
// //                 >
// //                     ✏️
// //                 </button>
// //                 <button
// //                     className="retailers-table__action-btn retailers-table__action-btn--delete"
// //                     onClick={() => handleDelete(item.id, item.business_name || item.name)}
// //                     title="Delete"
// //                 >
// //                     🗑️
// //                 </button>
// //             </div>
// //         )
// //     }
// // ];

// //   const getTitle = () => {
// //     return selectedRole === "retailer" ? "All Contacts" : "All Suppliers";
// //   };

// //   const getSubtitle = () => {
// //     return selectedRole === "retailer"
// //       ? ""
// //       : "";
// //   };

// //   const getSectionTitle = () => {
// //     return selectedRole === "retailer" ? "Retailers" : "Suppliers";
// //   };

// //   const getSectionDescription = () => {
// //     return selectedRole === "retailer"
// //       ? ""
// //       : "";
// //   };

// //   if (loading) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar
// //           isCollapsed={isCollapsed}
// //           setIsCollapsed={setIsCollapsed}
// //           onToggleMobile={isMobileOpen}
// //         />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <div className="retailers-main-content">
// //             <div className="loading-spinner">Loading {selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="retailers-wrapper">
// //         <AdminSidebar
// //           isCollapsed={isCollapsed}
// //           setIsCollapsed={setIsCollapsed}
// //           onToggleMobile={isMobileOpen}
// //         />
// //         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //           <div className="retailers-main-content">
// //             <div className="error-message">
// //               <p>{error}</p>
// //               <button onClick={fetchRetailers} className="retry-button">
// //                 Try Again
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="retailers-wrapper">
// //       <AdminSidebar
// //         isCollapsed={isCollapsed}
// //         setIsCollapsed={setIsCollapsed}
// //         onToggleMobile={isMobileOpen}
// //       />

// //       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
// //         <AdminHeader
// //           isCollapsed={isCollapsed}
// //           onToggleSidebar={handleToggleMobile}
// //         />

// //         <div className="retailers-main-content">
// //           <div className="retailers-content-section">
// //             <div className="retailers-header-top">
// //               <div className="retailers-title-section">
// //                 <h1 className="retailers-main-title">{getTitle()}</h1>
// //                 <p className="retailers-subtitle">
// //                   {getSubtitle()}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="d-flex justify-content-between align-items-center retailers-search-add-container">
// //               <div className="retailers-search-container">
// //                 <div className="retailers-search-box">
// //                   <input
// //                     type="text"
// //                     placeholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
// //                     className="retailers-search-input"
// //                     value={searchTerm}
// //                     onChange={(e) => setSearchTerm(e.target.value)}
// //                   />
// //                   <FaSearch className="retailers-search-icon" size={18} />
// //                 </div>
// //               </div>

// //               <div className="retailers-buttons-container">
// //                 <div className="retailers-role-selector">
// //                   <select
// //                     className="retailers-role-dropdown"
// //                     value={selectedRole}
// //                     onChange={(e) => setSelectedRole(e.target.value)}
// //                   >
// //                     <option value="retailer">Retailers</option>
// //                     <option value="supplier">Suppliers</option>
// //                   </select>
// //                 </div>

// //                 <div className="retailers-add-buttons">
// //                   <button
// //                     className="retailers-add-button retailers-add-button--retailer"
// //                     onClick={handleAddRetailer}
// //                   >
// //                     <span className="retailers-add-icon">+</span>
// //                     Add Contact
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="retailers-list-section">
// //               <div className="retailers-section-header">
// //                 <h2 className="retailers-section-title">
// //                   {getSectionTitle()} ({filteredRetailersData.length})
// //                 </h2>
// //                 <p className="retailers-section-description">
// //                   {getSectionDescription()}
// //                 </p>
// //               </div>

// //               <div className="retailers-table-container">
// //                 <ReusableTable
// //                   data={filteredRetailersData}
// //                   columns={columns}
// //                   initialEntriesPerPage={10}
// //                   searchPlaceholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
// //                   showSearch={true}
// //                   showEntriesSelector={true}
// //                   showPagination={true}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Retailers;



// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// import "./Retailers.css";
// import axios from "axios";
// import { baseurl } from "../../../BaseURL/BaseURL";
// import { FaSearch, FaUpload, FaFileExcel } from "react-icons/fa";
// import * as XLSX from "xlsx";

// function Retailers() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const navigate = useNavigate();
//   const [retailersData, setRetailersData] = useState([]);
//   const [filteredRetailersData, setFilteredRetailersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedRole, setSelectedRole] = useState("retailer");
//   const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
//   const [bulkUploadFile, setBulkUploadFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadError, setUploadError] = useState("");
//   const [uploadSuccess, setUploadSuccess] = useState("");
//   const [previewData, setPreviewData] = useState([]);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const fileInputRef = useRef(null);

//   // Fetch retailers data from API
//   useEffect(() => {
//     fetchRetailers();
//   }, []);

//   // Filter retailers by role when data changes or role selection changes
//   useEffect(() => {
//     if (retailersData.length > 0) {
//       const filteredData = retailersData
//         .filter(item => {
//           if (selectedRole === "retailer") {
//             return item.role === "retailer";
//           } else if (selectedRole === "supplier") {
//             return item.role === "supplier";
//           }
//           return false;
//         })
//         .filter(item =>
//           (item.business_name || item.name || "")
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (item.mobile_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (item.group || "").toLowerCase().includes(searchTerm.toLowerCase())
//         );
//       setFilteredRetailersData(filteredData);
//     }
//   }, [retailersData, searchTerm, selectedRole]);

//   const fetchRetailers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${baseurl}/accounts`);
//       setRetailersData(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Failed to fetch retailers:', err);
//       setError('Failed to load retailers data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle delete retailer/supplier
//   const handleDelete = async (id, name) => {
//     if (window.confirm(`Are you sure you want to delete ${name}?`)) {
//       try {
//         await axios.delete(`${baseurl}/accounts/${id}`);
//         alert(`${selectedRole === 'retailer' ? 'Retailer' : 'Supplier'} deleted successfully!`);
//         fetchRetailers();
//       } catch (err) {
//         console.error('Failed to delete:', err);
//         alert(`Failed to delete ${selectedRole === 'retailer' ? 'retailer' : 'supplier'}`);
//       }
//     }
//   };

//   // Handle edit retailer/supplier
//   const handleEdit = (id) => {
//     navigate(`/retailers/edit/${id}`);
//   };

//   // Handle view retailer/supplier
//   const handleView = (id) => {
//     navigate(`/retailers/view/${id}`);
//   };

//   // Handle mobile toggle
//   const handleToggleMobile = () => {
//     setIsMobileOpen(!isMobileOpen);
//   };

//   // Handle add retailer
//   const handleAddRetailer = () => {
//     navigate("/retailers/add");
//   };

//   // Handle place order
//   const handlePlaceOrder = (retailer) => {
//     navigate("/retailers/place-order", {
//       state: {
//         retailerId: retailer.id,
//         retailerName: retailer.business_name || retailer.name,
//         displayName: retailer.display_name,
//         discount: retailer.discount || 0
//       }
//     });
//   };

//   // Bulk Upload Functions
//   const handleBulkUploadClick = () => {
//     setShowBulkUploadModal(true);
//     setUploadError("");
//     setUploadSuccess("");
//     setPreviewData([]);
//     setIsPreviewMode(false);
//     setBulkUploadFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const validExtensions = [".xlsx", ".xls", ".csv"];
//     const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
//     if (!validExtensions.includes(fileExtension)) {
//       setUploadError("Please select an Excel file (.xlsx, .xls, .csv)");
//       return;
//     }

//     setBulkUploadFile(file);
//     setUploadError("");
//     setUploadSuccess("");
    
//     // Preview the file
//     previewExcelFile(file);
//   };

// const previewExcelFile = (file) => {
//   const reader = new FileReader();
  
//   reader.onload = (e) => {
//     try {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

//       if (jsonData.length < 2) {
//         setUploadError("Excel file is empty or has no data");
//         return;
//       }

//       // Get headers
//       const headers = jsonData[0];
      
//       // Check required headers
//       const requiredHeaders = ["name", "business_name", "display_name"];
//       const missingHeaders = requiredHeaders.filter(header => 
//         !headers.some(h => h && h.toString().toLowerCase().replace(/\s+/g, '_') === header)
//       );

//       if (missingHeaders.length > 0) {
//         setUploadError(`Missing required columns: ${missingHeaders.join(", ")}`);
//         return;
//       }

//       // Process data rows
//       const processedData = jsonData.slice(1).map((row, index) => {
//         const rowData = {};
//         headers.forEach((header, colIndex) => {
//           if (header) {
//             const key = header.toString().toLowerCase().replace(/\s+/g, '_');
//             // Ensure target is always lowercase
//             if (key === 'target') {
//               rowData['target'] = row[colIndex] || "";
//             } else {
//               rowData[key] = row[colIndex] || "";
//             }
//           }
//         });
        
//         // Set role based on selectedRole
//         rowData.role = selectedRole;
        
//         // Set group based on role
//         if (selectedRole === "retailer") {
//           rowData.group = rowData.group || "Retailer";
//           rowData.entity_type = rowData.entity_type || "Individual";
//         } else {
//           rowData.group = rowData.group || "SUPPLIERS";
//         }
        
//         // Set default values for required fields
//         rowData.status = "Active";
//         rowData.password = rowData.name ? 
//           `${rowData.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}@123` : "";
//         rowData.discount = rowData.discount || 0;
        
//         // Ensure target is set and remove any uppercase Target
//         rowData.target = rowData.target || 100000;
//         if (rowData.Target) {
//           delete rowData.Target;
//         }
        
//         return {
//           ...rowData,
//           __id: index + 1,
//           __status: "pending"
//         };
//       });

//       setPreviewData(processedData);
//       setIsPreviewMode(true);
//       setUploadError("");
//     } catch (error) {
//       console.error("Error parsing Excel file:", error);
//       setUploadError("Error parsing Excel file. Please check the format.");
//     }
//   };

//   reader.onerror = () => {
//     setUploadError("Error reading file");
//   };

//   reader.readAsArrayBuffer(file);
// };

//   const handleBulkUpload = async () => {
//     if (!bulkUploadFile || previewData.length === 0) {
//       setUploadError("Please select a valid Excel file first");
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);
//     setUploadError("");
//     setUploadSuccess("");

//     try {
//       const totalRecords = previewData.length;
//       let successfulUploads = 0;
//       let failedUploads = 0;
//       const errors = [];

//       for (let i = 0; i < previewData.length; i++) {
//         const record = previewData[i];
        
//         // Calculate progress
//         const progress = Math.round(((i + 1) / totalRecords) * 100);
//         setUploadProgress(progress);

//         try {
//           // Prepare data for API
//           const uploadData = {
//             ...record,
//             // Remove internal fields
//             __id: undefined,
//             __status: undefined
//           };

//           // Send to API
//           await axios.post(`${baseurl}/accounts`, uploadData);
//           successfulUploads++;

//           // Update preview status
//           setPreviewData(prev => prev.map(item => 
//             item.__id === record.__id 
//               ? { ...item, __status: "success" }
//               : item
//           ));

//         } catch (error) {
//           failedUploads++;
//           errors.push(`Row ${i + 2}: ${error.response?.data?.message || error.message}`);
          
//           // Update preview status
//           setPreviewData(prev => prev.map(item => 
//             item.__id === record.__id 
//               ? { ...item, __status: "error", __error: error.response?.data?.message || "Upload failed" }
//               : item
//           ));
//         }

//         // Small delay to show progress
//         await new Promise(resolve => setTimeout(resolve, 100));
//       }

//       // Complete upload
//       setUploadProgress(100);
      
//       if (failedUploads === 0) {
//         setUploadSuccess(`Successfully uploaded ${successfulUploads} ${selectedRole}(s)!`);
//         // Refresh retailers list
//         setTimeout(() => {
//           fetchRetailers();
//           setShowBulkUploadModal(false);
//         }, 2000);
//       } else {
//         setUploadError(
//           `Uploaded ${successfulUploads} out of ${totalRecords} records. ${failedUploads} failed.`
//         );
//       }

//     } catch (error) {
//       console.error("Bulk upload error:", error);
//       setUploadError("Bulk upload failed. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const downloadTemplate = () => {
//     // Create template data based on selected role
//     const templateHeaders = selectedRole === "retailer" 
//       ? [
//           "name", "business_name", "display_name", "email", "mobile_number", 
//           "phone_number", "entity_type", "gstin", "discount", "target",
//           "credit_limit", "shipping_address_line1", "shipping_city", 
//           "shipping_state", "shipping_pin_code", "shipping_country",
//           "billing_address_line1", "billing_city", "billing_state", 
//           "billing_pin_code", "billing_country"
//         ]
//       : [
//           "name", "business_name", "display_name", "email", "mobile_number", 
//           "phone_number", "gstin", "discount", "target", 
//           "shipping_address_line1", "shipping_city", "shipping_state", 
//           "shipping_pin_code", "shipping_country", "billing_address_line1", 
//           "billing_city", "billing_state", "billing_pin_code", "billing_country"
//         ];

//     // Create sample data
//     const sampleData = selectedRole === "retailer"
//       ? ["John Doe", "ABC Traders", "John's Store", "john@example.com", "9876543210", 
//          "0441234567", "Individual", "27ABCDE1234F1Z5", "10", "100000", 
//          "50000", "123 Main Street", "Chennai", "Tamil Nadu", "600001", 
//          "India", "123 Main Street", "Chennai", "Tamil Nadu", "600001", "India"]
//       : ["Supplier Corp", "Supplier Corp", "Supplier Corp Display", "supplier@example.com", 
//          "9876543210", "0441234567", "27ABCDE1234F1Z5", "5", "500000", 
//          "456 Supplier Street", "Mumbai", "Maharashtra", "400001", 
//          "India", "456 Supplier Street", "Mumbai", "Maharashtra", "400001", "India"];

//     const ws = XLSX.utils.aoa_to_sheet([templateHeaders, sampleData]);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Template");
    
//     // Generate and download file
//     const fileName = `${selectedRole}_bulk_upload_template.xlsx`;
//     XLSX.writeFile(wb, fileName);
//   };

//   const closeBulkUploadModal = () => {
//     setShowBulkUploadModal(false);
//     setBulkUploadFile(null);
//     setUploading(false);
//     setUploadProgress(0);
//     setUploadError("");
//     setUploadSuccess("");
//     setPreviewData([]);
//     setIsPreviewMode(false);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Custom renderers
//   const renderRetailerCell = (item) => (
//     <div className="retailers-table__retailer-cell">
//       <strong className="retailers-table__retailer-name">{item.business_name || item.name}</strong>
//       <span className="retailers-table__retailer-id">ID: {item.id}</span>
//     </div>
//   );

//   const renderContactCell = (item) => (
//     <div className="retailers-table__contact-cell">
//       <div className="retailers-table__contact-item">
//         <span className="retailers-table__contact-icon">📞</span>
//         {item.mobile_number}
//       </div>
//       <div className="retailers-table__contact-email">
//         {item.email}
//       </div>
//     </div>
//   );

//   const renderTypeLocationCell = (item) => (
//     <div className="retailers-table__type-location-cell">
//       <strong className="retailers-table__type">
//         {item.entity_type}
//       </strong>
//       <div className="retailers-table__location">
//         <span className="retailers-table__location-icon">📍</span>
//         {item.shipping_city}, {item.shipping_state}
//       </div>
//     </div>
//   );

// const renderPerformanceCell = (item) => (
//   <div className="retailers-table__performance-cell">
//     <div className="retailers-table__rating">
//       <span className="retailers-table__rating-icon">⭐</span>
//       Discount: {item.discount || 0}%
//     </div>
//     <div className="retailers-table__revenue">
//       Target: ₹ {((item.target || item.Target || 100000) ? parseInt(item.target || item.Target || 100000).toLocaleString() : "100,000")}
//     </div>
//   </div>
// );

//   const renderGroupTypeCell = (item) => (
//     <div className="retailers-table__group-type-cell">
//       <span className="retailers-table__group-type">
//         {item.group || "N/A"}
//       </span>
//     </div>
//   );

//   const renderStatusCell = (item) => (
//     <span className={`retailers-table__status retailers-table__status--active`}>
//       Active
//     </span>
//   );

//   const renderActionsCell = (item) => (
//     <div className="retailers-table__actions">
//       <button
//         className="retailers-table__action-btn retailers-table__action-btn--view"
//         onClick={() => handleView(item.id)}
//         title="View"
//       >
//         👁️
//       </button>
//       <button
//         className="retailers-table__action-btn retailers-table__action-btn--edit"
//         onClick={() => handleEdit(item.id)}
//         title="Edit"
//       >
//         ✏️
//       </button>
//       <button
//         className="retailers-table__action-btn retailers-table__action-btn--delete"
//         onClick={() => handleDelete(item.id, item.business_name || item.name)}
//         title="Delete"
//       >
//         🗑️
//       </button>
//     </div>
//   );

//   const columns = [
//     { key: "__item", title: selectedRole === "retailer" ? "Retailer" : "Supplier", render: (value, item) => renderRetailerCell(item) },
//     { key: "__item", title: "Contact", render: (value, item) => renderContactCell(item) },
//     { key: "__item", title: "Type & Location", render: (value, item) => renderTypeLocationCell(item) },
//     { key: "display_name", title: "Display Name" },
//     { key: "__item", title: "Group Type", render: (value, item) => renderGroupTypeCell(item) },
//     { key: "__item", title: "Performance", render: (value, item) => renderPerformanceCell(item) },
//     { key: "__item", title: "Status", render: (value, item) => renderStatusCell(item) },
//     { 
//       key: "__item", 
//       title: "Place Order", 
//       render: (value, item) => (
//         <button
//           className="retailers-table__order-btn"
//           onClick={() => handlePlaceOrder(item)}
//           title="Place Order"
//         >
//           🛒 Order
//         </button>
//       )
//     },
//     { 
//       key: "__item", 
//       title: "Actions", 
//       render: (value, item) => (
//         <div className="retailers-table__actions">
//           <button
//             className="retailers-table__action-btn retailers-table__action-btn--view"
//             onClick={() => handleView(item.id)}
//             title="View"
//           >
//             👁️
//           </button>
//           <button
//             className="retailers-table__action-btn retailers-table__action-btn--edit"
//             onClick={() => handleEdit(item.id)}
//             title="Edit"
//           >
//             ✏️
//           </button>
//           <button
//             className="retailers-table__action-btn retailers-table__action-btn--delete"
//             onClick={() => handleDelete(item.id, item.business_name || item.name)}
//             title="Delete"
//           >
//             🗑️
//           </button>
//         </div>
//       )
//     }
//   ];

//   const getTitle = () => {
//     return selectedRole === "retailer" ? "All Contacts" : "All Suppliers";
//   };

//   const getSubtitle = () => {
//     return selectedRole === "retailer"
//       ? ""
//       : "";
//   };

//   const getSectionTitle = () => {
//     return selectedRole === "retailer" ? "Retailers" : "Suppliers";
//   };

//   const getSectionDescription = () => {
//     return selectedRole === "retailer"
//       ? ""
//       : "";
//   };

//   if (loading) {
//     return (
//       <div className="retailers-wrapper">
//         <AdminSidebar
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//           onToggleMobile={isMobileOpen}
//         />
//         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <div className="retailers-main-content">
//             <div className="loading-spinner">Loading {selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="retailers-wrapper">
//         <AdminSidebar
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//           onToggleMobile={isMobileOpen}
//         />
//         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <div className="retailers-main-content">
//             <div className="error-message">
//               <p>{error}</p>
//               <button onClick={fetchRetailers} className="retry-button">
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="retailers-wrapper">
//       <AdminSidebar
//         isCollapsed={isCollapsed}
//         setIsCollapsed={setIsCollapsed}
//         onToggleMobile={isMobileOpen}
//       />

//       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader
//           isCollapsed={isCollapsed}
//           onToggleSidebar={handleToggleMobile}
//         />

//         <div className="retailers-main-content">
//           <div className="retailers-content-section">
//             <div className="retailers-header-top">
//               <div className="retailers-title-section">
//                 <h1 className="retailers-main-title">{getTitle()}</h1>
//                 <p className="retailers-subtitle">
//                   {getSubtitle()}
//                 </p>
//               </div>
//             </div>

//             <div className="d-flex justify-content-between align-items-center retailers-search-add-container">
//               <div className="retailers-search-container">
//                 <div className="retailers-search-box">
//                   <input
//                     type="text"
//                     placeholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
//                     className="retailers-search-input"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                   <FaSearch className="retailers-search-icon" size={18} />
//                 </div>
//               </div>

//               <div className="retailers-buttons-container">
//                 <div className="retailers-role-selector">
//                   <select
//                     className="retailers-role-dropdown"
//                     value={selectedRole}
//                     onChange={(e) => setSelectedRole(e.target.value)}
//                   >
//                     <option value="retailer">Retailers</option>
//                     <option value="supplier">Suppliers</option>
//                   </select>
//                 </div>

//                 <div className="retailers-add-buttons">
//                   <button
//                     className="retailers-add-button retailers-add-button--upload"
//                     onClick={handleBulkUploadClick}
//                     title="Bulk Upload"
//                   >
//                     <FaUpload className="retailers-add-icon" />
//                     Bulk Upload
//                   </button>
//                   <button
//                     className="retailers-add-button retailers-add-button--retailer"
//                     onClick={handleAddRetailer}
//                   >
//                     <span className="retailers-add-icon">+</span>
//                     Add Contact
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="retailers-list-section">
//               <div className="retailers-section-header">
//                 <h2 className="retailers-section-title">
//                   {getSectionTitle()} ({filteredRetailersData.length})
//                 </h2>
//                 <p className="retailers-section-description">
//                   {getSectionDescription()}
//                 </p>
//               </div>

//               <div className="retailers-table-container">
//                 <ReusableTable
//                   data={filteredRetailersData}
//                   columns={columns}
//                   initialEntriesPerPage={10}
//                   searchPlaceholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
//                   showSearch={true}
//                   showEntriesSelector={true}
//                   showPagination={true}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bulk Upload Modal */}
//       {showBulkUploadModal && (
//         <div className="modal-overlay">
//           <div className="modal-container">
//             <div className="modal-header">
//               <h2 className="modal-title">
//                 <FaFileExcel style={{ marginRight: '10px', color: '#1d6f42' }} />
//                 Bulk Upload {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}
//               </h2>
//               <button className="modal-close-btn" onClick={closeBulkUploadModal}>
//                 &times;
//               </button>
//             </div>

//             <div className="modal-body">
//               {!isPreviewMode ? (
//                 <>
//                   <div className="upload-instructions">
//                     <h4>Instructions:</h4>
//                     <ul>
//                       <li>Download the template file to see the required format</li>
//                       <li>Fill in the data following the template structure</li>
//                       <li>Upload the completed Excel file (.xlsx, .xls, .csv)</li>
//                       <li>Required fields: <strong>name, business_name, display_name</strong></li>
//                       <li>Each record will be added as a <strong>{selectedRole}</strong></li>
//                     </ul>
//                   </div>

//                   <div className="upload-actions">
//                     <button
//                       className="btn-template-download"
//                       onClick={downloadTemplate}
//                     >
//                       <FaFileExcel /> Download Template
//                     </button>

//                     <div className="file-upload-area">
//                       <input
//                         type="file"
//                         ref={fileInputRef}
//                         accept=".xlsx,.xls,.csv"
//                         onChange={handleFileSelect}
//                         style={{ display: 'none' }}
//                         id="bulk-upload-file"
//                       />
//                       <label htmlFor="bulk-upload-file" className="file-upload-label">
//                         <FaUpload size={24} />
//                         <span>Choose Excel File</span>
//                         {bulkUploadFile && (
//                           <span className="selected-file">{bulkUploadFile.name}</span>
//                         )}
//                       </label>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="preview-section">
//                     <h4>Preview ({previewData.length} records)</h4>
//                     <div className="preview-table-container">
//                       <table className="preview-table">
//                         <thead>
//                           <tr>
//                             <th>#</th>
//                             <th>Name</th>
//                             <th>Business Name</th>
//                             <th>Email</th>
//                             <th>Mobile</th>
//                             <th>Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {previewData.map((item, index) => (
//                             <tr key={item.__id} className={`preview-row ${item.__status}`}>
//                               <td>{index + 1}</td>
//                               <td>{item.name}</td>
//                               <td>{item.business_name}</td>
//                               <td>{item.email}</td>
//                               <td>{item.mobile_number}</td>
//                               <td>
//                                 <span className={`status-badge ${item.__status}`}>
//                                   {item.__status === 'success' ? '✓ Ready' : 
//                                    item.__status === 'error' ? '✗ Error' : '⏳ Pending'}
//                                 </span>
//                                 {item.__error && (
//                                   <div className="error-tooltip">{item.__error}</div>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                   {uploading && (
//                     <div className="upload-progress">
//                       <div className="progress-bar">
//                         <div 
//                           className="progress-fill" 
//                           style={{ width: `${uploadProgress}%` }}
//                         ></div>
//                       </div>
//                       <div className="progress-text">{uploadProgress}%</div>
//                     </div>
//                   )}
//                 </>
//               )}

//               {uploadError && (
//                 <div className="alert alert-error">
//                   {uploadError}
//                 </div>
//               )}

//               {uploadSuccess && (
//                 <div className="alert alert-success">
//                   {uploadSuccess}
//                 </div>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button
//                 className="btn-cancel"
//                 onClick={closeBulkUploadModal}
//                 disabled={uploading}
//               >
//                 Cancel
//               </button>
              
//               {isPreviewMode && (
//                 <button
//                   className="btn-back"
//                   onClick={() => setIsPreviewMode(false)}
//                   disabled={uploading}
//                 >
//                   Back
//                 </button>
//               )}
              
//               {isPreviewMode && (
//                 <button
//                   className="btn-upload"
//                   onClick={handleBulkUpload}
//                   disabled={uploading}
//                 >
//                   {uploading ? 'Uploading...' : `Upload ${previewData.length} ${selectedRole}(s)`}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Retailers; 


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Retailers.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch, FaUpload, FaFileExcel, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";

function Retailers() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [retailersData, setRetailersData] = useState([]);
  const [filteredRetailersData, setFilteredRetailersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("retailer");

  // Fetch retailers data from API
  useEffect(() => {
    fetchRetailers();
  }, []);

  // Filter retailers by role when data changes or role selection changes
  useEffect(() => {
    if (retailersData.length > 0) {
      const filteredData = retailersData
        .filter(item => {
          if (selectedRole === "retailer") {
            return item.role === "retailer";
          } else if (selectedRole === "supplier") {
            return item.role === "supplier";
          }
          return false;
        })
        .filter(item =>
          (item.business_name || item.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.mobile_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.group || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      setFilteredRetailersData(filteredData);
    }
  }, [retailersData, searchTerm, selectedRole]);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/accounts`);
      setRetailersData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch retailers:', err);
      setError('Failed to load retailers data');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete retailer/supplier
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`${baseurl}/accounts/${id}`);
        alert(`${selectedRole === 'retailer' ? 'Retailer' : 'Supplier'} deleted successfully!`);
        fetchRetailers();
      } catch (err) {
        console.error('Failed to delete:', err);
        alert(`Failed to delete ${selectedRole === 'retailer' ? 'retailer' : 'supplier'}`);
      }
    }
  };

  // Handle edit retailer/supplier
  const handleEdit = (id) => {
    navigate(`/retailers/edit/${id}`);
  };

  // Handle view retailer/supplier
  const handleView = (id) => {
    navigate(`/retailers/view/${id}`);
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Handle add retailer
  const handleAddRetailer = () => {
    navigate("/retailers/add");
  };

  // Handle import retailers - navigate to import page
  const handleImport = () => {
    navigate("/retailers/import", { state: { selectedRole } });
  };

  // Handle place order
  const handlePlaceOrder = (retailer) => {
    navigate("/retailers/place-order", {
      state: {
        retailerId: retailer.id,
        retailerName: retailer.business_name || retailer.name,
        displayName: retailer.display_name,
        discount: retailer.discount || 0
      }
    });
  };

  // Export to Excel functionality
  const exportToExcel = () => {
    if (filteredRetailersData.length === 0) {
      alert("No data to export!");
      return;
    }

    try {
      // Prepare data for export
      const exportData = filteredRetailersData.map(item => ({
        "ID": item.id || "",
        "Name": item.name || "",
        "Business Name": item.business_name || "",
        "Display Name": item.display_name || "",
        "Email": item.email || "",
        "Mobile Number": item.mobile_number || "",
        "Phone Number": item.phone_number || "",
        "Role": item.role || "",
        "Group": item.group || "",
        "Entity Type": item.entity_type || "",
        "GSTIN": item.gstin || "",
        "Discount (%)": item.discount || 0,
        "Target (₹)": item.target || 0,
        "Credit Limit": item.credit_limit || 0,
        "Status": item.status || "Active",
        "Shipping Address": item.shipping_address_line1 || "",
        "Shipping City": item.shipping_city || "",
        "Shipping State": item.shipping_state || "",
        "Shipping Pin Code": item.shipping_pin_code || "",
        "Shipping Country": item.shipping_country || "",
        "Billing Address": item.billing_address_line1 || "",
        "Billing City": item.billing_city || "",
        "Billing State": item.billing_state || "",
        "Billing Pin Code": item.billing_pin_code || "",
        "Billing Country": item.billing_country || "",
        "Created At": item.created_at || "",
        "Updated At": item.updated_at || ""
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const wscols = [
        { wch: 10 }, // ID
        { wch: 20 }, // Name
        { wch: 25 }, // Business Name
        { wch: 20 }, // Display Name
        { wch: 30 }, // Email
        { wch: 15 }, // Mobile Number
        { wch: 15 }, // Phone Number
        { wch: 15 }, // Role
        { wch: 15 }, // Group
        { wch: 15 }, // Entity Type
        { wch: 20 }, // GSTIN
        { wch: 12 }, // Discount (%)
        { wch: 15 }, // Target (₹)
        { wch: 15 }, // Credit Limit
        { wch: 12 }, // Status
        { wch: 30 }, // Shipping Address
        { wch: 15 }, // Shipping City
        { wch: 15 }, // Shipping State
        { wch: 15 }, // Shipping Pin Code
        { wch: 15 }, // Shipping Country
        { wch: 30 }, // Billing Address
        { wch: 15 }, // Billing City
        { wch: 15 }, // Billing State
        { wch: 15 }, // Billing Pin Code
        { wch: 15 }, // Billing Country
        { wch: 20 }, // Created At
        { wch: 20 }  // Updated At
      ];
      worksheet['!cols'] = wscols;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}`);

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `${selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);

      alert(`${selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'} data exported successfully!`);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Export filtered data (current view)
  const exportFilteredData = () => {
    exportToExcel();
  };

  // Export all data
  const exportAllData = () => {
    const currentFilteredData = filteredRetailersData;
    const allDataForRole = retailersData.filter(item => {
      if (selectedRole === "retailer") {
        return item.role === "retailer";
      } else if (selectedRole === "supplier") {
        return item.role === "supplier";
      }
      return false;
    });

    // Temporarily set filtered data to all data for export
    const originalFilteredData = filteredRetailersData;
    setFilteredRetailersData(allDataForRole);

    // Use setTimeout to ensure state update before export
    setTimeout(() => {
      exportToExcel();
      // Restore original filtered data
      setFilteredRetailersData(originalFilteredData);
    }, 100);
  };

  // Custom renderers
  const renderRetailerCell = (item) => (
    <div className="retailers-table__retailer-cell">
      <strong className="retailers-table__retailer-name">{item.business_name || item.name}</strong>
      <span className="retailers-table__retailer-id">ID: {item.id}</span>
    </div>
  );

  const renderContactCell = (item) => (
    <div className="retailers-table__contact-cell">
      <div className="retailers-table__contact-item">
        <span className="retailers-table__contact-icon">📞</span>
        {item.mobile_number}
      </div>
      <div className="retailers-table__contact-email">
        {item.email}
      </div>
    </div>
  );

  const renderTypeLocationCell = (item) => (
    <div className="retailers-table__type-location-cell">
      <strong className="retailers-table__type">
        {item.entity_type}
      </strong>
      <div className="retailers-table__location">
        <span className="retailers-table__location-icon">📍</span>
        {item.shipping_city}, {item.shipping_state}
      </div>
    </div>
  );

  const renderPerformanceCell = (item) => (
    <div className="retailers-table__performance-cell">
      <div className="retailers-table__rating">
        <span className="retailers-table__rating-icon">⭐</span>
        Discount: {item.discount || 0}%
      </div>
      <div className="retailers-table__revenue">
        Target: ₹ {((item.target || item.Target || 100000) ? parseInt(item.target || item.Target || 100000).toLocaleString() : "100,000")}
      </div>
    </div>
  );

  const renderGroupTypeCell = (item) => (
    <div className="retailers-table__group-type-cell">
      <span className="retailers-table__group-type">
        {item.group || "N/A"}
      </span>
    </div>
  );

  const renderStatusCell = (item) => (
    <span className={`retailers-table__status retailers-table__status--active`}>
      Active
    </span>
  );

  const columns = [
    { key: "__item", title: selectedRole === "retailer" ? "Retailer" : "Supplier", render: (value, item) => renderRetailerCell(item) },
    { key: "__item", title: "Contact", render: (value, item) => renderContactCell(item) },
    { key: "__item", title: "Type & Location", render: (value, item) => renderTypeLocationCell(item) },
    { key: "__item", title: "Group Type", render: (value, item) => renderGroupTypeCell(item) },
    { key: "__item", title: "Performance", render: (value, item) => renderPerformanceCell(item) },
    { key: "__item", title: "Status", render: (value, item) => renderStatusCell(item) },
    {
      key: "__item",
      title: "Place Order",
      render: (value, item) => (
        <button
          className="retailers-table__order-btn"
          onClick={() => handlePlaceOrder(item)}
          title="Place Order"
        >
          🛒 Order
        </button>
      )
    },
    {
      key: "__item",
      title: "Actions",
      render: (value, item) => (
        <div className="retailers-table__actions">
          <FaEye
            className="retailers-table__action-icon retailers-table__action-icon--view"
            onClick={() => handleView(item.id)}
            title="View"
          />
          <FaEdit
            className="retailers-table__action-icon retailers-table__action-icon--edit"
            onClick={() => handleEdit(item.id)}
            title="Edit"
          />
          <FaTrash
            className="retailers-table__action-icon retailers-table__action-icon--delete"
            onClick={() => handleDelete(item.id, item.business_name || item.name)}
            title="Delete"
          />
        </div>
      )
    }
  ];

  const getTitle = () => {
    return selectedRole === "retailer" ? "All Contacts" : "All Suppliers";
  };

  const getSubtitle = () => {
    return selectedRole === "retailer"
      ? ""
      : "";
  };

  const getSectionTitle = () => {
    return selectedRole === "retailer" ? "Retailers" : "Suppliers";
  };

  const getSectionDescription = () => {
    return selectedRole === "retailer"
      ? ""
      : "";
  };

  if (loading) {
    return (
      <div className="retailers-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="retailers-main-content">
            <div className="loading-spinner">Loading {selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="retailers-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="retailers-main-content">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchRetailers} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retailers-wrapper">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen}
      />

      <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={isCollapsed}
          onToggleSidebar={handleToggleMobile}
        />

        <div className="retailers-main-content">
          <div className="retailers-content-section">
            <div className="retailers-header-top">
              <div className="retailers-title-section">
                <h1 className="retailers-main-title">{getTitle()}</h1>
                <p className="retailers-subtitle">
                  {getSubtitle()}
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center retailers-search-add-container">
              <div className="retailers-search-container">
                <div className="retailers-search-box">
                  <input
                    type="text"
                    placeholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
                    className="retailers-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="retailers-search-icon" size={18} />
                </div>
              </div>

              <div className="retailers-buttons-container">
                <div className="retailers-role-selector">
                  <select
                    className="retailers-role-dropdown"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="retailer">Retailers</option>
                    <option value="supplier">Suppliers</option>
                  </select>
                </div>

                <div className="retailers-add-buttons">
                  <div className="retailers-export-dropdown">
                    <button
                      className="retailers-add-button retailers-add-button--export" style={{ color: 'white' }}
                      onClick={exportFilteredData}
                      title="Export Current View"
                    >
                      <FaFileExcel className="retailers-add-icon" />
                      Export
                    </button>
                    <div className="retailers-export-dropdown-content">
                      <button onClick={exportFilteredData}>
                        Export Current View ({filteredRetailersData.length} records)
                      </button>
                      <button onClick={exportAllData}>
                        Export All {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}
                        ({retailersData.filter(item => item.role === selectedRole).length} records)
                      </button>
                    </div>
                  </div>
                  <button
                    className="retailers-add-button retailers-add-button--upload"
                    onClick={handleImport}
                    title="Bulk Upload"
                  >
                    <FaUpload className="retailers-add-icon" />
                    Import
                  </button>
                  <button
                    className="retailers-add-button retailers-add-button--retailer"
                    onClick={handleAddRetailer}
                  >
                    <span className="retailers-add-icon">+</span>
                    Add Contact
                  </button>
                </div>
              </div>
            </div>

            <div className="retailers-list-section">
              <div className="retailers-section-header">
                <h2 className="retailers-section-title">
                  {getSectionTitle()} ({filteredRetailersData.length})
                </h2>
                <p className="retailers-section-description">
                  {getSectionDescription()}
                </p>
              </div>

              <div className="retailers-table-container">
                <ReusableTable
                  data={filteredRetailersData}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Retailers;