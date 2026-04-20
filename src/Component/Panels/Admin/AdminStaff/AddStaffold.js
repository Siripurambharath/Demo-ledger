import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./AddStaff.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function AddStaff() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get the staff ID from URL params for edit mode
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    role: "staff", // Default value set to "Staff"
    status: "Active"
  });

  // Check if we're in edit mode and fetch staff data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchStaffData();
    }
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`${baseurl}/api/staff/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const staffData = await response.json();
      
      // Map backend fields to form data
      setFormData({
        fullName: staffData.full_name || "",
        mobileNumber: staffData.mobile_number || "",
        email: staffData.email || "",
        role: staffData.role || "Staff",
        status: staffData.status || "Active"
      });
    } catch (error) {
      console.error("Error fetching staff data:", error);
      setError("Failed to load staff data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    const { fullName, mobileNumber, email, role } = formData;
    
    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    
    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!role) {
      setError("Role is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isEditMode) {
        // Update existing staff (PUT request)
        const response = await fetch(`${baseurl}/api/staff/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update staff account");
        }

        console.log("Staff updated successfully:", result);
        
        // Show success message and redirect
        alert("Staff account updated successfully!");
        navigate("/staff");
      } else {
        // Create new staff (POST request)
        const response = await fetch(`${baseurl}/api/staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create staff account");
        }

        console.log("Staff created successfully:", result);
        
        // Show success message and redirect
        alert("Staff account created successfully! Default password is their mobile number.");
        navigate("/staff");
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} staff:`, err);
      setError(err.message || `An error occurred while ${isEditMode ? "updating" : "creating"} staff`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/staff");
  };

  if (isEditMode && isFetching) {
    return (
      <div className="add-staff-page-wrapper">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <div className="add-staff-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading staff data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area */}
      <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="add-staff-container">
          
          {/* Page Header */}
          <div className="page-header-section">
            <h1 className="page-title">
              {isEditMode ? "Edit Staff Member" : "Add New Staff"}
            </h1>
            <p className="page-subtitle">
              {isEditMode 
                ? "Update staff account information and permissions" 
                : "Create a new staff account with appropriate permissions"
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          {/* Add/Edit Staff Form */}
          <div className="add-staff-form-section">
            <form onSubmit={handleSubmit} className="staff-form">
              
              {/* Full Name */}
              <div className="form-row">
                <div className="adminform-group half-width">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter full name"
                    disabled={isLoading}
                  />
                </div>

                 <div className="adminform-group half-width">
                  <label htmlFor="mobileNumber" className="form-label">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter 10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    disabled={isLoading || isEditMode} // Disable mobile number in edit mode
                  />
                  {isEditMode && (
                    <small className="field-note">
                      Mobile number cannot be changed
                    </small>
                  )}
                </div>


              </div>

              {/* Email and Status */}
              <div className="form-row">
                
                <div className="adminform-group half-width">
                  <label htmlFor="email" className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter email address"
                    disabled={isLoading}
                  />
                </div>

                <div className="adminform-group half-width">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>


              {/* Action Buttons */}
            
            {/* Action Buttons */}
            <div className="add-staff-form-actions">
              <button 
                type="button" 
                className="add-staff-cancel-btn" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="add-staff-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="add-staff-loading-spinner"></span>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update" : "Submit"
                )}
              </button>
            </div>


            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStaff;