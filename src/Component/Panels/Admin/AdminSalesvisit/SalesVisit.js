import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./SalesVisit.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { MdImage } from "react-icons/md";

const SalesVisit = ({ mode = "list" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [salesVisitsData, setSalesVisitsData] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredSalesVisits, setFilteredSalesVisits] = useState([]);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  
  const [formData, setFormData] = useState({
    retailer_id: "",
    retailer_name: "",
    staff_id: "",
    staff_name: "",
    visit_type: "",
    visit_outcome: "",
    sales_amount: "",
    transaction_type: "",
    description: "",
    location: "",
    image_filename: "",
    date: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // SIMPLE FIX: Extract YYYY-MM-DD directly from string without using Date object
  const extractDateFromString = (dateString) => {
    if (!dateString) return "";
    
    // If it's already YYYY-MM-DD format
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If it's ISO string like "2026-02-13T00:00:00.000Z"
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // If it's DD/MM/YYYY format
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    return "";
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    
    // Extract YYYY-MM-DD first
    let ymd = dateString;
    if (dateString.includes('T')) {
      ymd = dateString.split('T')[0];
    }
    
    // Convert YYYY-MM-DD to DD/MM/YYYY
    if (ymd.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = ymd.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  // Fetch sales visits data
  const fetchSalesVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${baseurl}/api/salesvisits`);
      if (res.data.success) {
        const mappedData = res.data.data.map((item) => ({
          ...item,
          sales_amount: parseFloat(item.sales_amount) || 0,
          // Store the date field directly from DB
          visit_date: item.date || item.created_at,
          // Format for display in list
          formatted_date: formatDateForDisplay(item.date || item.created_at),
          location: item.location || "No location",
          image_url: item.image_url || null,
        }));
        setSalesVisitsData(mappedData);

        if (id && (mode === "view" || mode === "edit")) {
          const visit = mappedData.find((v) => v.id.toString() === id);
          if (visit) {
            setSelectedVisit(visit);
            
            // DIRECT FIX: Get the date string from DB and extract YYYY-MM-DD
            const dbDateString = visit.date || visit.created_at;
            const yyyyMmDd = extractDateFromString(dbDateString);
            
            setFormData({
              ...visit,
              date: yyyyMmDd, // Direct string extraction, no Date object
            });
            
            // Set image preview if exists
            if (visit.image_url) {
              setImagePreview(visit.image_url);
            }
            setIsImageRemoved(false);
          } else {
            setError(`Sales visit with ID ${id} not found`);
          }
        }
      } else {
        setError(res.data.error || "Failed to fetch sales visits");
      }
    } catch (err) {
      console.error("Error fetching sales visits:", err);
      setError("Server error while fetching sales visits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesVisits();
  }, [id, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      formDataToSend.append('retailer_id', formData.retailer_id);
      formDataToSend.append('retailer_name', formData.retailer_name);
      formDataToSend.append('staff_id', formData.staff_id);
      formDataToSend.append('staff_name', formData.staff_name);
      formDataToSend.append('visit_type', formData.visit_type);
      formDataToSend.append('visit_outcome', formData.visit_outcome);
      formDataToSend.append('sales_amount', formData.sales_amount || '');
      formDataToSend.append('transaction_type', formData.transaction_type || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('date', formData.date); // Send the YYYY-MM-DD string
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      if (isImageRemoved || (formData.image_filename === "" && !imageFile && selectedVisit?.image_url)) {
        formDataToSend.append('remove_image', 'true');
        formDataToSend.append('image_filename', '');
      }
      
      const res = await axios.put(`${baseurl}/api/salesvisits/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        window.alert(`Sales Visit for ${formData.retailer_name} updated successfully`);
        navigate("/sales_visit");
      } else {
        window.alert("Failed to update Sales Visit ❌");
      }
    } catch (err) {
      console.error("Update error:", err);
      window.alert("Server error while updating ❌");
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `${baseurl}/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.address) {
            setFormData(prev => ({
              ...prev,
              location: data.address
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              location: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
            }));
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            alert("An unknown error occurred while getting location.");
            break;
        }
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle image change for editing
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert("Please select an image file (JPG, PNG, GIF)");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        image_filename: file.name
      }));
      
      setIsImageRemoved(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    
    setFormData(prev => ({
      ...prev,
      image_filename: "",
      image_url: null
    }));
    
    setIsImageRemoved(true);
    
    setSelectedVisit(prev => ({
      ...prev,
      image_url: null,
      image_filename: ""
    }));
    
    const fileInput = document.getElementById("asv-editImageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Function to view image in new tab
  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.alert("No image available for this visit");
    }
  };

  // Function to view location
  const handleViewLocation = (location) => {
    if (location && location !== "No location") {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(mapsUrl, '_blank');
    } else {
      window.alert("No location data available");
    }
  };

  const handleView = (id) => navigate(`/sales_visit/view/${id}`);
  const handleEdit = (id) => navigate(`/sales_visit/edit/${id}`);
  
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete visit by ${name}?`)) return;

    try {
      const res = await axios.delete(`${baseurl}/api/salesvisits/${id}`);
      if (res.data.success) {
        window.alert(`Sales Visit for ${name} deleted successfully ✅`);
        fetchSalesVisits();
      } else {
        window.alert(`Failed to delete Sales Visit for ${name} ❌`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      window.alert(`Server error while deleting Sales Visit for ${name} ❌`);
    }
  };

  // Filter data based on search input
  useEffect(() => {
    if (salesVisitsData.length > 0) {
      const filtered = salesVisitsData.filter((item) => 
        (item.id?.toString().includes(searchTerm)) ||
        (item.retailer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.visit_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.visit_outcome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSalesVisits(filtered);
    }
  }, [searchTerm, salesVisitsData]);

  // Table columns configuration
  const columns = [
    { 
      title: "RETAILER NAME", 
      key: "retailer_name", 
      width: "180px",
      className: "asv-rt-table__cell--retailer"
    },
    { 
      title: "STAFF NAME", 
      key: "staff_name", 
      width: "150px",
      className: "asv-rt-table__cell--staff"
    },
    { 
      title: "VISIT OUTCOME", 
      key: "visit_outcome", 
      width: "140px",
      className: "asv-rt-table__cell--outcome"
    },
    { 
      title: "SALES AMOUNT", 
      key: "sales_amount", 
      width: "140px",
      className: "asv-rt-table__cell--amount",
      render: (value) => `₹${value || 0}`
    },
    { 
      title: "TRANSACTION TYPE", 
      key: "transaction_type", 
      width: "160px",
      className: "asv-rt-table__cell--transaction"
    },
    { 
      title: "LOCATION", 
      key: "location",
      width: "220px",
      className: "asv-rt-table__cell--location",
      render: (value, row) => {
        if (!row) return "No location";
        return (
          <div className="asv-location-cell">
            <span className="asv-location-text">
              {value && value.length > 25 ? `${value.substring(0, 25)}...` : value || "No location"}
            </span>
            {value && value !== "No location" && (
              <button
                className="asv-rt-table__action-btn asv-rt-table__action-btn--location"
                onClick={() => handleViewLocation(value)}
                title="View on map"
              >
                <FaMapMarkerAlt />
              </button>
            )}
          </div>
        );
      }
    },
    { 
      title: "IMAGE", 
      key: "image_url",
      width: "120px",
      className: "asv-rt-table__cell--image",
      render: (value, row) => {
        if (!row || !value) return <span className="asv-no-image">No image</span>;
        
        return (
          <div className="asv-image-cell">
            <div 
              className="asv-image-thumbnail"
              onClick={() => handleViewImage(value)}
              title="Click to view image in new tab"
            >
              <img 
                src={value} 
                alt="Visit" 
                className="asv-thumbnail-img"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="asv-no-image">Error</span>';
                }}
              />
              <div className="asv-image-overlay">
                <MdImage className="asv-view-icon" />
                <span className="asv-view-text">View</span>
              </div>
            </div>
          </div>
        );
      }
    },
    { 
      title: "DATE", 
      key: "formatted_date",
      width: "120px",
      className: "asv-rt-table__cell--date",
      render: (value, row) => {
        return row?.formatted_date || formatDateForDisplay(row?.date || row?.created_at) || "N/A";
      }
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: "180px",
      className: "asv-rt-table__cell--actions",
      render: (value, row) => {
        if (!row) return null;
        return (
          <div className="asv-rt-table__actions">
            <button
              className="asv-rt-table__action-btn asv-rt-table__action-btn--view"
              onClick={() => handleView(row.id)}
              title="View"
            >
              👁️
            </button>
            <button
              className="asv-rt-table__action-btn asv-rt-table__action-btn--edit"
              onClick={() => handleEdit(row.id)}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="asv-rt-table__action-btn asv-rt-table__action-btn--delete"
              onClick={() => handleDelete(row.id, row.retailer_name || row.staff_name)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        );
      },
    }
  ];

  const renderViewMode = () => (
    <div className="asv-sales-visit-card">
      <h3>Sales Visit Details</h3>
      {selectedVisit ? (
        <div className="asv-card-content">
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>ID</label>
              <input type="text" value={selectedVisit.id} readOnly />
            </div>
            <div>
              <label>Retailer Name</label>
              <input type="text" value={selectedVisit.retailer_name} readOnly />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Staff Name</label>
              <input type="text" value={selectedVisit.staff_name} readOnly />
            </div>
            <div>
              <label>Visit Type</label>
              <input type="text" value={selectedVisit.visit_type} readOnly />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Visit Outcome</label>
              <input type="text" value={selectedVisit.visit_outcome} readOnly />
            </div>
            <div>
              <label>Sales Amount</label>
              <input type="number" value={selectedVisit.sales_amount} readOnly />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Transaction Type</label>
              <input type="text" value={selectedVisit.transaction_type} readOnly />
            </div>
            <div>
              <label>Date (DD/MM/YYYY)</label>
              <input 
                type="text" 
                value={formatDateForDisplay(selectedVisit.date || selectedVisit.created_at)} 
                readOnly 
              />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div className="asv-full-width">
              <label>Location</label>
              <div className="asv-location-display">
                <input 
                  type="text" 
                  value={selectedVisit.location || "No location"} 
                  readOnly 
                />
                {selectedVisit.location && selectedVisit.location !== "No location" && (
                  <button
                    type="button"
                    className="asv-location-view-btn"
                    onClick={() => handleViewLocation(selectedVisit.location)}
                    title="View on map"
                  >
                    <FaMapMarkerAlt />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div className="asv-full-width">
              <label>Visit Image</label>
              <div className="asv-image-display">
                {selectedVisit.image_url ? (
                  <>
                    <img
                      src={selectedVisit.image_url}
                      alt="Visit"
                      className="asv-visit-image-preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </>
                ) : (
                  <input type="text" value="No image available" readOnly />
                )}
              </div>
            </div>
          </div>
          <div className="asv-form-group asv-full-width">
            <label>Description</label>
            <textarea value={selectedVisit.description} readOnly />
          </div>
          <div className="asv-form-actions">
            <button className="asv-back-button" onClick={() => navigate("/sales_visit")}>
              Back to List
            </button>
          </div>
        </div>
      ) : (
        <div className="asv-sales-visit-error">
          <p>Sales visit with ID {id} not found</p>
          <button className="asv-back-button" onClick={() => navigate("/sales_visit")}>
            Back to List
          </button>
        </div>
      )}
    </div>
  );

  const renderEditMode = () => (
    <div className="asv-sales-visit-card">
      <h3>Edit Sales Visit</h3>
      {selectedVisit ? (
        <form onSubmit={handleEditSubmit} className="asv-sales-visit-edit-form">
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Retailer Name</label>
              <input
                type="text"
                name="retailer_name"
                value={formData.retailer_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Staff Name</label>
              <input
                type="text"
                name="staff_name"
                value={formData.staff_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Visit Type</label>
              <input
                type="text"
                name="visit_type"
                value={formData.visit_type}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Visit Outcome</label>
              <input
                type="text"
                name="visit_outcome"
                value={formData.visit_outcome}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Sales Amount</label>
              <input
                type="number"
                name="sales_amount"
                value={formData.sales_amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Transaction Type</label>
              <input
                type="text"
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="asv-form-group asv-form-group-row">
            <div>
              <label>Visit Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Location</label>
              <div className="asv-location-input-wrapper">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  disabled={isGettingLocation}
                />
                <button
                  type="button"
                  className="asv-location-icon-btn"
                  onClick={getCurrentLocation}
                  title="Get current location"
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <FaSpinner className="asv-spinner" />
                  ) : (
                    <FaMapMarkerAlt />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Image Upload Field */}
          <div className="asv-form-group asv-form-group-row">
            <div className="asv-full-width">
              <label>Update Image</label>
              <div className="asv-image-upload-container">
                <input
                  type="file"
                  id="asv-editImageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="asv-image-input"
                />
                <label htmlFor="asv-editImageUpload" className="asv-upload-btn">
                  <MdImage />
                  Choose New Image
                </label>
              </div>
              
              {/* Current/Preview Image - Show only if image exists AND not removed */}
              {!isImageRemoved && (imagePreview || selectedVisit.image_url) && (
                <div className="asv-image-preview-container">
                  <div className="asv-image-preview">
                    <img src={imagePreview || selectedVisit.image_url} alt="Preview" />
                    <button
                      type="button"
                      className="asv-remove-image-btn"
                      onClick={removeImage}
                    >
                      <MdImage /> Remove
                    </button>
                    <button
                      type="button"
                      className="asv-view-image-btn"
                      onClick={() => handleViewImage(imagePreview || selectedVisit.image_url)}
                    >
                      <MdImage /> View
                    </button>
                  </div>
                </div>
              )}
              
              {/* Show message when image is removed */}
              {isImageRemoved && (
                <div className="asv-image-preview-container">
                  <div className="asv-image-preview" style={{ border: '2px dashed #fc8181', background: '#fff5f5' }}>
                    <p style={{ color: '#e53e3e', margin: '10px 0' }}>
                      <strong>Image will be removed</strong>
                    </p>
                    <button
                      type="button"
                      className="asv-upload-btn"
                      onClick={() => document.getElementById("asv-editImageUpload").click()}
                      style={{ background: '#4299e1' }}
                    >
                      <MdImage /> Upload New Image
                    </button>
                  </div>
                </div>
              )}
              
              <p className="asv-image-hint">Max file size: 5MB. Click Remove to delete existing image</p>
            </div>
          </div>
          
          <div className="asv-form-group asv-full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="asv-form-actions">
            <button type="button" className="asv-cancel-button" onClick={() => navigate("/sales_visit")}>
              Cancel
            </button>
            <button type="submit" className="asv-save-button">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="asv-sales-visit-error">
          <p>Sales visit with ID {id} not found</p>
          <button className="asv-back-button" onClick={() => navigate("/sales_visit")}>
            Back to List
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="asv-sales-visits-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`asv-sales-visits-content-area ${isCollapsed ? "asv-collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="asv-sales-visits-content-section">
          {mode === "view" && renderViewMode()}
          {mode === "edit" && renderEditMode()}
          {mode === "list" && (
            <>
              <div className="asv-sales-visits-section-header">
                <h2 className="asv-sales-visits-main-title">Sales Visits</h2>
              </div>

              <div className="asv-sales-visit-search-container">
                <div className="asv-sales-visit-search-box">
                  <input
                    type="text"
                    placeholder="Search by ID, Retailer, Staff, Location, or Transaction..."
                    className="asv-sales-visits-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="asv-sales-visits-search-icon" size={18} />
                </div>
              </div>

              <div className="asv-sales-visits-table-container">
                <ReusableTable
                  data={filteredSalesVisits}
                  columns={columns}
                  initialEntriesPerPage={10}
                  showSearch={false}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesVisit;