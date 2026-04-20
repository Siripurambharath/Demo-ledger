import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./CreditPeriodFix.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function CreditPeriodTable() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [creditPeriodData, setCreditPeriodData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch credit period data from backend
  const fetchCreditPeriodData = async () => {
    try {
      setLoading(true);
      console.log('Fetching credit period data from:', `${baseurl}/api/credit-period-fix/credit`);
      
      const response = await fetch(`${baseurl}/api/credit-period-fix/credit`);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Full API response:', result);
      
      if (result.success && result.data) {
        console.log('Raw data received:', result.data);
        
        // Add serial numbers and format data with "days" and "%"
        const formattedData = result.data.map((item, index) => ({
          id: item.id,
          serial: index + 1,
          creditPeriod: item.credit_period ? `${item.credit_period} days` : "N/A",
          creditPercentage: item.credit_percentage ? `${item.credit_percentage}%` : "N/A",
          // Keep raw values for search functionality
          rawCreditPeriod: item.credit_period || "",
          rawCreditPercentage: item.credit_percentage || ""
        }));
        
        console.log('Formatted data:', formattedData);
        
        setCreditPeriodData(formattedData);
        setFilteredData(formattedData);
      } else {
        console.log('API returned success:false or no data');
        throw new Error(result.message || 'No data received');
      }
    } catch (error) {
      console.error("Error fetching credit period data:", error);
      alert("Error loading credit period data: " + error.message);
      // Set empty arrays on error
      setCreditPeriodData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditPeriodData();
  }, []);

  // Handle search functionality - search on raw values for better accuracy
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(creditPeriodData);
    } else {
      const filtered = creditPeriodData.filter(item =>
        (item.rawCreditPeriod && item.rawCreditPeriod.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.rawCreditPercentage && item.rawCreditPercentage.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, creditPeriodData]);

  const handleAddCreditPeriod = () => {
    navigate("/credit-period-fix/add");
  };

  const handleEditCreditPeriod = (itemId) => {
    navigate(`/credit-period-fix/edit/${itemId}`);
  };

  const handleDeleteCreditPeriod = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this credit period entry?")) {
      try {
        const response = await fetch(`${baseurl}/api/credit-period-fix/${itemId}`, {
          method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {
          alert("Credit period entry deleted successfully");
          fetchCreditPeriodData(); // Refresh the data
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error("Error deleting credit period entry:", error);
        alert("Error deleting credit period entry");
      }
    }
  };

  // Columns configuration for reusable table
  const columns = [
    {
      key: "serial",
      title: "S.No",
      style: { width: "60px", textAlign: "center" }
    },
    {
      key: "creditPeriod",
      title: "Credit Period",
      render: (value, row) => <div className="credit-period">{row?.creditPeriod || "N/A"}</div>
    },
    {
      key: "creditPercentage",
      title: "Credit Percentage",
      render: (value, row) => <div className="credit-percentage">{row?.creditPercentage || "N/A"}</div>
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => {
        if (!row) return null;
        return (
          <div className="credit-period-actions">
            <button 
              className="credit-period-action-btn credit-period-edit-btn" 
              title="Edit"
              onClick={() => handleEditCreditPeriod(row.id)}
            >
              <FaEdit size={16} />
            </button>
            <button 
              className="credit-period-action-btn credit-period-delete-btn" 
              title="Delete"
              onClick={() => handleDeleteCreditPeriod(row.id)}
            >
              <FaTrash size={16} />
            </button>
          </div>
        );
      },
      style: { width: "150px", textAlign: "center" }
    }
  ];

  if (loading) {
    return (
      <div className="credit-period-page-wrapper">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`credit-period-content-with-header ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader isCollapsed={isCollapsed} />
          <div className="credit-period-main-content">
            <div className="credit-period-container">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading credit period data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-period-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area with Header */}
      <div className={`credit-period-content-with-header ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="credit-period-main-content">
          <div className="credit-period-container">
            
            {/* Page Header */}
            <div className="page-header-section">
              <h1 className="page-title">Credit Period Management</h1>
              <p className="page-subtitle">Manage credit periods and their percentages</p>
            </div>

            {/* Controls Section */}
            <div className="credit-period-controls-section">
              <div className="search-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by credit period (days) or percentage"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="search-icon" size={18} />
                </div>
              </div>
              
              <div className="action-controls">
                <button className="add-credit-period-btn" onClick={handleAddCreditPeriod}>
                  <FaPlus size={18} />
                  Add Credit Period
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
              {filteredData.length === 0 ? (
                <div className="no-data-message">
                  <p>No credit period entries found.</p>
                </div>
              ) : (
                <ReusableTable
                  data={filteredData}
                  columns={columns}
                  searchPlaceholder="Search credit periods..."
                  initialEntriesPerPage={10}
                  showSearch={false}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditPeriodTable;