import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import "./SalesVisits.css";

function SalesVisits() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Sales Visits");
  const [searchTerm, setSearchTerm] = useState("");
  const [salesVisitsData, setSalesVisitsData] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRetailers, setLoadingRetailers] = useState(false);
  const [error, setError] = useState(null);
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Get logged-in user
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const staffId = user?.id || null;
  const role = user?.role || null;

  const tabs = ["Sales Visits", "Transactions"];

  // Fetch Sales Visits
  useEffect(() => {
    if (!staffId) return;

    const fetchSalesVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseurl}/api/salesvisits`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          const userVisits = (data.data || []).filter(
            (visit) => visit.staff_id === staffId
          );
          setSalesVisitsData(userVisits);
        } else {
          setError(data.error || "Failed to fetch sales visits");
        }
      } catch (err) {
        console.error("Error fetching sales visits:", err);
        setError("Server error while fetching sales visits");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesVisits();
  }, [staffId]);

  // Fetch Retailers for dropdown
  useEffect(() => {
    setLoadingRetailers(true);
    setError(null);

    fetch(`${baseurl}/api/retailers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          const filtered = result.data.map((r) => ({
            retailer_id: r.retailer_id,
            retailer_name: r.retailer_name,
          }));
          setRetailers(filtered);
        } else {
          throw new Error(result.error || "Failed to fetch retailers");
        }
      })
      .catch((err) => {
        console.error("Error fetching retailers:", err);
        setError("Failed to load retailers. Please check your connection.");
      })
      .finally(() => setLoadingRetailers(false));
  }, []);

  const filteredSalesVisits = salesVisitsData.filter(
    (visit) =>
      visit.retailer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogVisit = () => navigate("/staff/log-visit");

  const handleEditVisit = (visit) => {
    setEditingVisitId(visit.id);
    setEditFormData({
      retailer_id: visit.retailer_id,
      retailer_name: visit.retailer_name,
      visit_outcome: visit.visit_outcome,
      sales_amount: visit.sales_amount,
      transaction_type: visit.transaction_type,
      visit_type: visit.visit_type,
      location: visit.location || '',
      image_filename: visit.image_filename || ''
    });
  };

  const handleShowLocation = (location) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const handleUpdateVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to update this sales visit?")) {
      try {
        const originalVisit = salesVisitsData.find((v) => v.id === visitId);

        const updatedVisit = {
          ...originalVisit, // preserves non-editable fields
          ...editFormData,  // update only editable fields
        };

        const res = await fetch(`${baseurl}/api/salesvisits/${visitId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedVisit),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.success) {
          setSalesVisitsData((prev) =>
            prev.map((visit) => (visit.id === visitId ? updatedVisit : visit))
          );
          setEditingVisitId(null);
          alert(`Sales visit for ${updatedVisit.retailer_name} updated successfully!`);
        } else {
          alert(data.error || "Failed to update sales visit");
        }
      } catch (err) {
        console.error("Error updating sales visit:", err);
        alert("Server error while updating sales visit");
      }
    }
  };

  const handleDeleteVisit = async (visit) => {
    if (window.confirm(`Are you sure you want to delete sales visit for ${visit.retailer_name}?`)) {
      try {
        const res = await fetch(`${baseurl}/api/salesvisits/${visit.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setSalesVisitsData((prev) => prev.filter((v) => v.id !== visit.id));
          alert(`Sales visit for ${visit.retailer_name} deleted successfully!`);
        } else {
          alert(data.error || "Failed to delete sales visit");
        }
      } catch (err) {
        console.error("Error deleting sales visit:", err);
        alert("Server error while deleting sales visit");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <StaffMobileLayout>
        <div className="sales-visits-mobile">
          <p>Please log in to view sales visits.</p>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="sales-visits-mobile">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Sales Visits ({salesVisitsData.length})</h1>
              <p>Track your retailer visits and outcomes</p>
            </div>
            <button className="log-visit-btn" onClick={handleLogVisit}>
              + Log Visit
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-section">
          <input
            type="text"
            placeholder="Search visits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="tabs-section">
          <div className="tabs-container">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {activeTab === "Sales Visits" && (
          <div className="sales-visits-list">
            {loading ? (
              <p>Loading sales visits...</p>
            ) : filteredSalesVisits.length === 0 ? (
              <p>No sales visits found.</p>
            ) : (
              filteredSalesVisits.map((visit) => (
                <div key={visit.id} className="visit-card">
                  {editingVisitId === visit.id ? (
                    <div className="edit-form">
                      {/* Non-editable */}
                      <label>Visit ID</label>
                      <input type="text" value={visit.id} disabled className="edit-input" />
                      
                      <label>Staff Name</label>
                      <input type="text" value={visit.staff_name} disabled className="edit-input" />
                      
                      <label>Created At</label>
                      <input type="text" value={new Date(visit.created_at).toLocaleDateString("en-GB")} disabled className="edit-input" />
                      
                      <label>Retailer</label>
                      <select
                        name="retailer_id"
                        value={editFormData.retailer_id || visit.retailer_id}
                        onChange={(e) => {
                          const selectedRetailer = retailers.find(r => r.retailer_id === e.target.value);
                          setEditFormData(prev => ({
                            ...prev,
                            retailer_id: e.target.value,
                            retailer_name: selectedRetailer?.retailer_name || "",
                          }));
                        }}
                        className="edit-input"
                      >
                        <option value="">Select retailer</option>
                        {retailers.map(r => (
                          <option key={r.retailer_id} value={r.retailer_id}>{r.retailer_name}</option>
                        ))}
                      </select>

                      {/* Editable fields */}
                      <label>Visit Outcome</label>
                      <select
                        name="visit_outcome"
                        value={editFormData.visit_outcome}
                        onChange={handleInputChange}
                        className="edit-input"
                      >
                        <option value="">Select outcome</option>
                        <option value="Successful">Successful</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                        <option value="Rescheduled">Rescheduled</option>
                      </select>

                      <label>Sales Amount</label>
                      <input type="number" name="sales_amount" value={editFormData.sales_amount} onChange={handleInputChange} className="edit-input" />

                      <label>Transaction Type</label>
                      <select name="transaction_type" value={editFormData.transaction_type} onChange={handleInputChange} className="edit-input">
                        <option value="">Select transaction type</option>
                        <option value="Paikka">Paikka</option>
                        <option value="Kaccha">Kaccha</option>
                        <option value="Partial">Partial</option>
                        <option value="Full">Full</option>
                      </select>

                      <label>Visit Type</label>
                      <select name="visit_type" value={editFormData.visit_type} onChange={handleInputChange} className="edit-input">
                        <option value="">Select visit type</option>
                        <option value="Routine">Routine</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="New Retailer">New Retailer</option>
                        <option value="Issue Resolution">Issue Resolution</option>
                      </select>

                      {/* Location field in edit form */}
                      <label>Location</label>
                      <textarea
                        name="location"
                        value={editFormData.location || ''}
                        onChange={handleInputChange}
                        className="edit-input"
                        rows="2"
                        placeholder="Location"
                      />

                      {/* Image filename field in edit form */}
                      <label>Image Filename</label>
                      <input
                        type="text"
                        name="image_filename"
                        value={editFormData.image_filename || ''}
                        onChange={handleInputChange}
                        className="edit-input"
                        placeholder="Image filename"
                      />

                      <div className="edit-actions">
                        <button className="cancel-btn" onClick={() => setEditingVisitId(null)}>Cancel</button>
                        <button className="update-btn" onClick={() => handleUpdateVisit(visit.id)}>Update</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="visit-header">
                        <div className="visit-id">{visit.id}</div>
                        <span className={`outcome-badge ${visit.visit_outcome?.toLowerCase()}`}>{visit.visit_outcome}</span>
                      </div>
                      <div className="visit-retailer">
                        <div className="retailer-name">{visit.retailer_name}</div>
                        <div className="retailer-id">ID: {visit.retailer_id}</div>
                      </div>
                      <div className="visit-details">
                        <div className="detail-row">
                          <span className="detail-label">Date & Type:</span>
                          <span className="detail-value">{new Date(visit.created_at).toLocaleDateString("en-GB")} • {visit.visit_type}</span>
                        </div>
                        
                        {/* Location row - show only if exists */}
                        {visit.location && (
                          <div className="detail-row">
                            <span className="detail-label">Location:</span>
                            <span 
                              className="detail-value location-text" 
                              style={{cursor: 'pointer', color: '#007bff'}}
                              onClick={() => handleShowLocation(visit.location)}
                              title="Click to view full location"
                            >
                              {visit.location.length > 30 ? `${visit.location.substring(0, 30)}...` : visit.location}
                            </span>
                          </div>
                        )}
                        
                        <div className="detail-row">
                          <span className="detail-label">Sales Amount:</span>
                          <span className="detail-value">{visit.sales_amount}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Transaction Type:</span>
                          <span className="detail-value">{visit.transaction_type}</span>
                        </div>
                        
                        {/* Image row - show only if exists */}
                        {visit.image_filename && (
                          <div className="detail-row">
                            <span className="detail-label">Photo:</span>
                            <span className="detail-value">
                              <button 
                                className="view-image-btn"
                                onClick={() => window.open(`${baseurl}/uploads/visits/${visit.image_filename}`, '_blank')}
                              >
                                📸 View Photo
                              </button>
                            </span>
                          </div>
                        )}
                        
                        <div className="detail-row">
                          <span className="detail-label">Staff:</span>
                          <span className="detail-value">{visit.staff_name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Role:</span>
                          <span className="detail-value">{role}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="edit-icon" onClick={() => handleEditVisit(visit)}>✏️</button>
                        <button className="delete-icon" onClick={() => handleDeleteVisit(visit)}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Location Modal */}
        {showLocationModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Location Details</h3>
                <button className="modal-close" onClick={() => setShowLocationModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p className="full-location">{selectedLocation}</p>
              </div>
              <div className="modal-footer">
                <button className="modal-btn" onClick={() => setShowLocationModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffMobileLayout>
  );
}

export default SalesVisits;