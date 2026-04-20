// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// import "./Retailers.css";

// function Retailers() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [retailersData, setRetailersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Fetch data from API
//   useEffect(() => {
//     const fetchRetailers = async () => {
//       try {
//         const response = await fetch(`${baseurl}/accounts`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
        
//         // Transform API data to match table structure
//         const transformedData = data.map(item => ({
//           id: item.id,
//           retailer: item.business_name || item.name,
//           contact: `${item.mobile_number || ''}\n${item.email || ''}`,
//           typeLocation: `${item.entity_type || 'Customer'}\n${item.billing_city || item.shipping_city || 'N/A'}`,
//           assignedStaff: "Not Assigned", // This field doesn't exist in API
//           performance: "0/10\n₹ 0", // Default performance data
//           status: "Active" // Default status
//         }));
        
//         setRetailersData(transformedData);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchRetailers();
//   }, []);

//   // Custom renderers
//   const renderRetailerCell = (item) => (
//     <div className="retailers-table__retailer-cell">
//       <strong className="retailers-table__retailer-name">{item.retailer}</strong>
//       <span className="retailers-table__retailer-id">ID: {item.id}</span>
//     </div>
//   );

//   const renderContactCell = (item) => (
//     <div className="retailers-table__contact-cell">
//       <div className="retailers-table__contact-item">
//         <span className="retailers-table__contact-icon">📞</span>
//         {item.contact.split("\n")[0]}
//       </div>
//       <div className="retailers-table__contact-email">
//         {item.contact.split("\n")[1]}
//       </div>
//     </div>
//   );

//   const renderTypeLocationCell = (item) => (
//     <div className="retailers-table__type-location-cell">
//       <strong className="retailers-table__type">
//         {item.typeLocation.split("\n")[0]}
//       </strong>
//       <div className="retailers-table__location">
//         <span className="retailers-table__location-icon">📍</span>
//         {item.typeLocation.split("\n")[1]}
//       </div>
//     </div>
//   );

//   const renderPerformanceCell = (item) => (
//     <div className="retailers-table__performance-cell">
//       <div className="retailers-table__rating">
//         <span className="retailers-table__rating-icon">⭐</span>
//         {item.performance.split("\n")[0]}
//       </div>
//       <div className="retailers-table__revenue">
//         {item.performance.split("\n")[1]}
//       </div>
//     </div>
//   );

//   const renderStatusCell = (item) => (
//     <span
//       className={`retailers-table__status retailers-table__status--${item.status.toLowerCase()}`}
//     >
//       {item.status}
//     </span>
//   );

//   const columns = [
//     { key: "retailer", title: "Retailer", render: renderRetailerCell },
//     { key: "contact", title: "Contact", render: renderContactCell },
//     { key: "typeLocation", title: "Type & Location", render: renderTypeLocationCell },
//     { key: "assignedStaff", title: "Assigned Staff" },
//     { key: "performance", title: "Performance", render: renderPerformanceCell },
//     { key: "status", title: "Status", render: renderStatusCell }
//   ];

//   const handleAddRetailerClick = () => {
//     navigate("/retailers/add");
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="retailers-wrapper">
//         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <AdminHeader isCollapsed={isCollapsed} />
//           <div className="retailers-main-content">
//             <div className="retailers-loading">Loading retailers...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="retailers-wrapper">
//         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <AdminHeader isCollapsed={isCollapsed} />
//           <div className="retailers-main-content">
//             <div className="retailers-error">Error: {error}</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="retailers-wrapper">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
//       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="retailers-main-content">
//           <div className="retailers-content-section">
//             {/* Page Title and Add Button */}
//             <div className="retailers-header-top">
//               <div className="retailers-title-section">
//                 <h1 className="retailers-main-title">All Retailers</h1>
//                 <p className="retailers-subtitle">
//                   Manage retailer relationships and track performance
//                 </p>
//               </div>
//               <button
//                 className="retailers-add-button retailers-add-button--top"
//                 onClick={handleAddRetailerClick}
//               >
//                 <span className="retailers-add-icon">+</span>
//                 Add Retailer
//               </button>
//             </div>

//             {/* Search Bar */}
//             <div className="retailers-search-container">
//               <div className="retailers-search-box">
//                 <span className="retailers-search-icon">🔍</span>
//                 <input
//                   type="text"
//                   placeholder="Search retailers..."
//                   className="retailers-search-input"
//                 />
//               </div>
//             </div>

//             {/* Retailers List Section */}
//             <div className="retailers-list-section">
//               <div className="retailers-section-header">
//                 <h2 className="retailers-section-title">
//                   Retailers ({retailersData.length})
//                 </h2>
//                 <p className="retailers-section-description">
//                   Track retailer performance and manage relationships
//                 </p>
//               </div>

//               {/* Table Section */}
//               <div className="retailers-table-container">
//                 {retailersData.length > 0 ? (
//                   <ReusableTable
//                     data={retailersData}
//                     columns={columns}
//                     initialEntriesPerPage={10}
//                     searchPlaceholder="Search retailers..."
//                     showSearch={false}
//                     showEntriesSelector={true}
//                     showPagination={true}
//                   />
//                 ) : (
//                   <div className="retailers-no-data">
//                     No retailers found. Click "Add Retailer" to get started.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Retailers;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import ReusableTable from "../../../Layouts/TableLayout/DataTable";
// import "./Retailers.css";
// import {baseurl} from "../../"

// function Retailers() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [retailersData, setRetailersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Fetch data from API
//   const fetchRetailers = async () => {
//     try {
//       const response = await fetch(`${baseurl}/accounts`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch data');
//       }
//       const data = await response.json();
      
//       // Transform API data to match table structure
//       const transformedData = data.map(item => ({
//         id: item.id,
//         retailer: item.business_name || item.name,
//         contact: `${item.mobile_number || ''}\n${item.email || ''}`,
//         typeLocation: `${item.entity_type || 'Customer'}\n${item.billing_city || item.shipping_city || 'N/A'}`,
//         assignedStaff: "Not Assigned",
//         performance: "0/10\n₹ 0",
//         status: "Active",
//         // Include original data for edit/view
//         originalData: item
//       }));
      
//       setRetailersData(transformedData);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRetailers();
//   }, []);

//   // Handle Edit
//   const handleEdit = (retailer) => {
//     navigate(`/retailers/edit/${retailer.id}`, { 
//       state: { retailerData: retailer.originalData } 
//     });
//   };

//   // Handle View
//   const handleView = (retailer) => {
//     navigate(`/retailers/view/${retailer.id}`, { 
//       state: { retailerData: retailer.originalData } 
//     });
//   };

//   // Handle Delete
//   const handleDelete = async (retailer) => {
//     if (window.confirm(`Are you sure you want to delete ${retailer.retailer}?`)) {
//       try {
//         const response = await fetch(`${baseurl}/accounts/${retailer.id}`, {
//           method: 'DELETE'
//         });

//         if (!response.ok) {
//           throw new Error('Failed to delete retailer');
//         }

//         // Refresh the data
//         await fetchRetailers();
//         alert('Retailer deleted successfully!');
//       } catch (err) {
//         alert('Error deleting retailer: ' + err.message);
//       }
//     }
//   };

//   // Action buttons renderer
//   const renderActionsCell = (item) => (
//     <div className="retailers-table__actions">
//       <button 
//         className="retailers-table__action-btn retailers-table__action-btn--view"
//         onClick={() => handleView(item)}
//         title="View Details"
//       >
//         👁️
//       </button>
//       <button 
//         className="retailers-table__action-btn retailers-table__action-btn--edit"
//         onClick={() => handleEdit(item)}
//         title="Edit"
//       >
//         ✏️
//       </button>
//       <button 
//         className="retailers-table__action-btn retailers-table__action-btn--delete"
//         onClick={() => handleDelete(item)}
//         title="Delete"
//       >
//         🗑️
//       </button>
//     </div>
//   );

//   // Custom renderers
//   const renderRetailerCell = (item) => (
//     <div className="retailers-table__retailer-cell">
//       <strong className="retailers-table__retailer-name">{item.retailer}</strong>
//       <span className="retailers-table__retailer-id">ID: {item.id}</span>
//     </div>
//   );

//   const renderContactCell = (item) => (
//     <div className="retailers-table__contact-cell">
//       <div className="retailers-table__contact-item">
//         <span className="retailers-table__contact-icon">📞</span>
//         {item.contact.split("\n")[0]}
//       </div>
//       <div className="retailers-table__contact-email">
//         {item.contact.split("\n")[1]}
//       </div>
//     </div>
//   );

//   const renderTypeLocationCell = (item) => (
//     <div className="retailers-table__type-location-cell">
//       <strong className="retailers-table__type">
//         {item.typeLocation.split("\n")[0]}
//       </strong>
//       <div className="retailers-table__location">
//         <span className="retailers-table__location-icon">📍</span>
//         {item.typeLocation.split("\n")[1]}
//       </div>
//     </div>
//   );

//   const renderPerformanceCell = (item) => (
//     <div className="retailers-table__performance-cell">
//       <div className="retailers-table__rating">
//         <span className="retailers-table__rating-icon">⭐</span>
//         {item.performance.split("\n")[0]}
//       </div>
//       <div className="retailers-table__revenue">
//         {item.performance.split("\n")[1]}
//       </div>
//     </div>
//   );

//   const renderStatusCell = (item) => (
//     <span
//       className={`retailers-table__status retailers-table__status--${item.status.toLowerCase()}`}
//     >
//       {item.status}
//     </span>
//   );

//   const columns = [
//     { key: "retailer", title: "Retailer", render: renderRetailerCell },
//     { key: "contact", title: "Contact", render: renderContactCell },
//     { key: "typeLocation", title: "Type & Location", render: renderTypeLocationCell },
//     { key: "assignedStaff", title: "Assigned Staff" },
//     { key: "performance", title: "Performance", render: renderPerformanceCell },
//     { key: "status", title: "Status", render: renderStatusCell },
//     { key: "actions", title: "Actions", render: renderActionsCell }
//   ];

//   const handleAddRetailerClick = () => {
//     navigate("/retailers/add");
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="retailers-wrapper">
//         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <AdminHeader isCollapsed={isCollapsed} />
//           <div className="retailers-main-content">
//             <div className="retailers-loading">Loading retailers...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="retailers-wrapper">
//         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//         <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//           <AdminHeader isCollapsed={isCollapsed} />
//           <div className="retailers-main-content">
//             <div className="retailers-error">Error: {error}</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="retailers-wrapper">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
//       <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="retailers-main-content">
//           <div className="retailers-content-section">
//             {/* Page Title and Add Button */}
//             <div className="retailers-header-top">
//               <div className="retailers-title-section">
//                 <h1 className="retailers-main-title">All Retailers</h1>
//                 <p className="retailers-subtitle">
//                   Manage retailer relationships and track performance
//                 </p>
//               </div>
//               <button
//                 className="retailers-add-button retailers-add-button--top"
//                 onClick={handleAddRetailerClick}
//               >
//                 <span className="retailers-add-icon">+</span>
//                 Add Retailer
//               </button>
//             </div>

//             {/* Search Bar */}
//             <div className="retailers-search-container">
//               <div className="retailers-search-box">
//                 <span className="retailers-search-icon">🔍</span>
//                 <input
//                   type="text"
//                   placeholder="Search retailers..."
//                   className="retailers-search-input"
//                 />
//               </div>
//             </div>

//             {/* Retailers List Section */}
//             <div className="retailers-list-section">
//               <div className="retailers-section-header">
//                 <h2 className="retailers-section-title">
//                   Retailers ({retailersData.length})
//                 </h2>
//                 <p className="retailers-section-description">
//                   Track retailer performance and manage relationships
//                 </p>
//               </div>

//               {/* Table Section */}
//               <div className="retailers-table-container">
//                 {retailersData.length > 0 ? (
//                   <ReusableTable
//                     data={retailersData}
//                     columns={columns}
//                     initialEntriesPerPage={10}
//                     searchPlaceholder="Search retailers..."
//                     showSearch={false}
//                     showEntriesSelector={true}
//                     showPagination={true}
//                   />
//                 ) : (
//                   <div className="retailers-no-data">
//                     No retailers found. Click "Add Retailer" to get started.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
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
import { FaSearch } from "react-icons/fa";

function Retailers() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [retailersData, setRetailersData] = useState([]);
  const [filteredRetailersData, setFilteredRetailersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("retailer"); // Default to retailer

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
          // Convert fields to lowercase for case-insensitive search
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
        fetchRetailers(); // Refresh the list
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

  // Handle add supplier

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
        Target: ₹ {item.Target ? parseInt(item.Target).toLocaleString() : "100,000"}
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

  const renderActionsCell = (item) => (
    <div className="retailers-table__actions">
      <button 
        className="retailers-table__action-btn retailers-table__action-btn--view"
        onClick={() => handleView(item.id)}
        title="View"
      >
        👁️
      </button>
      <button 
        className="retailers-table__action-btn retailers-table__action-btn--edit"
        onClick={() => handleEdit(item.id)}
        title="Edit"
      >
        ✏️
      </button>
      <button 
        className="retailers-table__action-btn retailers-table__action-btn--delete"
        onClick={() => handleDelete(item.id, item.business_name || item.name)}
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );

  const columns = [
    { key: "__item", title: selectedRole === "retailer" ? "Retailer" : "Supplier", render: (value, item) => renderRetailerCell(item) },
    { key: "__item", title: "Contact", render: (value, item) => renderContactCell(item) },
    { key: "__item", title: "Type & Location", render: (value, item) => renderTypeLocationCell(item) },
    { key: "display_name", title: "Display Name" },
    { key: "__item", title: "Group Type", render: (value, item) => renderGroupTypeCell(item) },
    { key: "__item", title: "Performance", render: (value, item) => renderPerformanceCell(item) },
    { key: "__item", title: "Status", render: (value, item) => renderStatusCell(item) },
    { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
  ];

  const getTitle = () => {
    return selectedRole === "retailer" ? "All Retailers" : "All Suppliers";
  };

  const getSubtitle = () => {
    return selectedRole === "retailer" 
      ? "Manage retailer relationships and track performance" 
      : "Manage supplier relationships and track performance";
  };

  const getSectionTitle = () => {
    return selectedRole === "retailer" ? "Retailers" : "Suppliers";
  };

  const getSectionDescription = () => {
    return selectedRole === "retailer" 
      ? "Track retailer performance and manage relationships"
      : "Track supplier performance and manage relationships";
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
  {/* Role Selection Dropdown */}
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

  {/* Add Buttons */}
  <div className="retailers-add-buttons">
    <button
      className="retailers-add-button retailers-add-button--retailer"
      onClick={handleAddRetailer}
    >
      <span className="retailers-add-icon">+</span>
      Add Retailer
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