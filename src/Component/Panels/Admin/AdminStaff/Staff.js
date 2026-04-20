import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Staff.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function Staff() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch staff data from backend
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/staff`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add serial numbers and format data
      const formattedData = data.map((staff, index) => ({
        id: staff.id,
        serial: index + 1,
        name: staff.full_name || staff.name || "N/A",
        email: staff.email || "N/A",
        mobile: staff.mobile_number || staff.mobile || "N/A",
        role: staff.role || "Staff",
        status: staff.status || "Active",
        lastLogin: staff.last_login || staff.lastLogin || "Never"
      }));
      
      setStaffData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      // Fallback to sample data if API fails
      const sampleData = [
        {
          id: 1,
          serial: 1,
          name: "Ravi Kumar",
          email: "ravi@example.com",
          mobile: "9876543210",
          role: "Staff",
          status: "Active",
          lastLogin: "18 Sep 2025"
        },
        {
          id: 2,
          serial: 2,
          name: "Abc",
          email: "abc@example.com",
          mobile: "xxxxxxxxxxxx",
          role: "Staff",
          status: "Active",
          lastLogin: "18 Sep 2025"
        }
      ];
      setStaffData(sampleData);
      setFilteredData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(staffData);
    } else {
      const filtered = staffData.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.mobile.includes(searchTerm)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, staffData]);

  const handleAddStaff = () => {
    navigate("/staff/add");
  };

  const handleViewStaff = (staffId) => {
    navigate(`/staff/view/${staffId}`);
  };

  const handleEditStaff = (staffId) => {
    navigate(`/staff/edit/${staffId}`);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const response = await fetch(`${baseurl}/api/staff/${staffId}`, {
          method: "DELETE"
        });

        if (response.ok) {
          alert("Staff deleted successfully");
          fetchStaffData(); // Refresh the data
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Error deleting staff member");
      }
    }
  };

  // Columns configuration for reusable table
const columns = [
  {
    key: "serial",
    title: "#",
    style: { width: "60px", textAlign: "center" }
  },
  {
    key: "name",
    title: "Name",
    render: (value, row) => <div className="staff-name">{row?.name || "N/A"}</div>
  },
  {
    key: "email",
    title: "Email",
    render: (value, row) => <div className="staff-email">{row?.email || "N/A"}</div>
  },
  {
    key: "mobile",
    title: "Mobile",
    render: (value, row) => <div className="staff-mobile">{row?.mobile || "N/A"}</div>
  },
  {
    key: "role",
    title: "Role",
    render: (value, row) => <span className="role-badge">{row?.role || "Staff"}</span>
  },
  {
    key: "status",
    title: "Status",
    render: (value, row) => {
      const status = row?.status || "Active";
      return (
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {status}
        </span>
      );
    }
  },
  {
    key: "lastLogin",
    title: "Last Login",
    render: (value, row) => <div className="last-login">{row?.lastLogin || "Never"}</div>
  },
  {
    key: "actions",
    title: "Actions",
    render: (value, row) => {
      if (!row) return null;
      return (
        <div className="staff-actions">
          <button 
            className="staff-action-btn staff-edit-btn" 
            title="Edit"
            onClick={() => handleEditStaff(row.id)}
          >
            <FaEdit size={16} />
          </button>
          <button 
            className="staff-action-btn staff-delete-btn" 
            title="Delete"
            onClick={() => handleDeleteStaff(row.id)}
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
      <div className="staff-page-wrapper">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`staff-content-with-header ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader isCollapsed={isCollapsed} />
          <div className="staff-main-content">
            <div className="staff-container">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading staff data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area with Header */}
      <div className={`staff-content-with-header ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="staff-main-content">
          <div className="staff-container">
            
            {/* Page Header */}
            <div className="page-header-section">
              <h1 className="page-title">Staff Management</h1>
              {/* <p className="page-subtitle">Manage staff members with role 'Staff'</p> */}
            </div>

            {/* Controls Section */}
            <div className="staff-controls-section">
              <div className="search-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by name, email, or mobile"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="search-icon" size={18} />
                </div>
              </div>
              
              <div className="action-controls">
                <button className="add-staff-btn" onClick={handleAddStaff}>
                  <FaPlus size={18} />
                  Add Staff
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
              {filteredData.length === 0 ? (
                <div className="no-data-message">
                  <p>No staff members found.</p>
                </div>
              ) : (
                <ReusableTable
                  data={filteredData}
                  columns={columns}
                  searchPlaceholder="Search staff..."
                  initialEntriesPerPage={10}
                  showSearch={false} // We're using our own search
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

export default Staff;