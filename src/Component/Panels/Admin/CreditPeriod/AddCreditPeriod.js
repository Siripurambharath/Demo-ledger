import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./AddCreditPeriod.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function AddCreditPeriodFix() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    creditPeriod: "",
    creditPercentage: ""
  });

  // Check if we're in edit mode and fetch data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchCreditPeriodData();
    }
  }, [id]);

  const fetchCreditPeriodData = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`${baseurl}/api/credit-period-fix/credit/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const creditPeriodData = result.data;
        setFormData({
          creditPeriod: creditPeriodData.credit_period || "",
          creditPercentage: creditPeriodData.credit_percentage || ""
        });
      } else {
        throw new Error(result.message || 'No data received');
      }
    } catch (error) {
      console.error("Error fetching credit period data:", error);
      setError("Failed to load credit period data: " + error.message);
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
    const { creditPeriod, creditPercentage } = formData;
    
    if (!creditPeriod.trim()) {
      setError("Credit period is required");
      return false;
    }
    
    if (!creditPercentage.trim()) {
      setError("Credit percentage is required");
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
      const url = isEditMode 
        ? `${baseurl}/api/credit-period-fix/edit/${id}`
        : `${baseurl}/api/credit-period-fix/add`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Credit period ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate("/credit-period");
      } else {
        throw new Error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} credit period`);
      }
      
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} credit period:`, err);
      setError(err.message || `An error occurred while ${isEditMode ? "updating" : "creating"} credit period`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/credit-period");
  };

  if (isEditMode && isFetching) {
    return (
      <div className="add-credit-period-page-wrapper">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`add-credit-period-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <div className="add-credit-period-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading credit period data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-credit-period-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area */}
      <div className={`add-credit-period-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="add-credit-period-container">
          
          {/* Page Header */}
          <div className="page-header-section">
            <h1 className="page-title">
              {isEditMode ? "Edit Credit Period" : "Add New Credit Period"}
            </h1>
            <p className="page-subtitle">
              {isEditMode 
                ? "Update credit period information" 
                : "Create a new credit period entry"
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

          {/* Add/Edit Form */}
          <div className="add-credit-period-form-section">
            <form onSubmit={handleSubmit} className="credit-period-form">
              
              {/* Credit Period */}
              <div className="form-row">
                <div className="adminform-group half-width">
                  <label htmlFor="creditPeriod" className="form-label">
                    Credit Period <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="creditPeriod"
                    name="creditPeriod"
                    value={formData.creditPeriod}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., 30 Days, 60 Days"
                    disabled={isLoading}
                  />
                </div>

                <div className="adminform-group half-width">
                  <label htmlFor="creditPercentage" className="form-label">
                    Credit Percentage <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="creditPercentage"
                    name="creditPercentage"
                    value={formData.creditPercentage}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., 5%, 7.5%"
                    disabled={isLoading}
                  />
                  <small className="field-note">
                    Enter percentage value (e.g., 5, 7.5, 10)
                  </small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="add-credit-period-form-actions">
                <button 
                  type="button" 
                  className="add-credit-period-cancel-btn" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="add-credit-period-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="add-credit-period-loading-spinner"></span>
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

export default AddCreditPeriodFix;