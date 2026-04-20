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
      
      // Ensure we have proper discount values
      const retailersWithDiscount = response.data.map(item => ({
        ...item,
        discount: parseFloat(item.discount) || 0 // Ensure discount is a number
      }));
      
      setRetailersData(retailersWithDiscount);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch retailers:', err);
      setError('Failed to load retailers data');
    } finally {
      setLoading(false);
    }
  };
const handleStatusToggle = async (item) => {
  const newStatus = item.status === 1 ? 0 : 1; // toggle

  try {
    await axios.put(`${baseurl}/accounts/${item.id}/status`, {
      status: newStatus
    });

    // Update UI immediately
    setRetailersData((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, status: Number(newStatus) } : r
      )
    );
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Failed to update status");
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

  // Handle place order - UPDATED to pass retailer discount
  const handlePlaceOrder = (retailer) => {
    navigate("/retailers/place-order", {
      state: {
        retailerId: retailer.id,
        retailerName: retailer.business_name || retailer.name,
        displayName: retailer.display_name,
        retailerDiscount: retailer.discount || 0 // Changed from discount to retailerDiscount
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
      "Opening Balance": item.opening_balance || 0,
      "Opening Balance Type": item.opening_balance_type || "",
      "Dual Account": item.is_dual_account === 1 ? "Yes" : "No",
      "Status": Number(item.status) === 1 ? "Active" : "Inactive",
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

    // Set column widths - updated with new columns
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
      { wch: 15 }, // Opening Balance
      { wch: 18 }, // Opening Balance Type
      { wch: 12 }, // Dual Account
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
  <div className="retailers-status-toggle">
    <label className="switch">
      <input
        type="checkbox"
        checked={Number(item.status) === 1} // convert to number
        onChange={() => handleStatusToggle(item)}
      />
      <span className="slider round"></span>
    </label>
    <span className={`status-text ${Number(item.status) === 1 ? "active" : "inactive"}`}>
      {Number(item.status) === 1 ? "Active" : "Inactive"}
    </span>
  </div>
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