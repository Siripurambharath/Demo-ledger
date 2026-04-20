import React, { useState, useEffect } from "react";
import StaffMobileLayout from "../RetailerMobileLayout";
import "./Offers.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function StaffOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 5;

  const API_BASE = `${baseurl}/api`;

  // Function to format date to Indian format (DD/MM/YYYY)
  const formatToIndianDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/offers?page=${currentPage}&limit=${offersPerPage}&search=${searchTerm}&offer_type=${filterType === 'All' ? '' : filterType}`
      );
      const data = await response.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/offers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Error deleting offer. Please try again.');
    }
  };

  const toggleOfferStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`${API_BASE}/offers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      alert('Error updating offer status. Please try again.');
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [currentPage, searchTerm, filterType]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      await deleteOffer(id);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await toggleOfferStatus(id, currentStatus);
  };

  // Filter and Pagination Logic
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || offer.offer_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const indexOfLastItem = currentPage * offersPerPage;
  const indexOfFirstItem = indexOfLastItem - offersPerPage;
  const currentItemsPage = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAddNew = () => {
    // Implement add new offer functionality
    alert("Add new offer functionality to be implemented");
  };

  const handleEditItem = (offer) => {
    // Implement edit offer functionality
    alert(`Edit offer: ${offer.title}`);
  };

  const renderRegularOfferCard = (offer) => (
    <div key={offer.id} className={`offersreatiler-card-item mobile ${offer.status}`}>
      <div className="offersreatiler-card-image">
        {offer.image_url ? (
          <img src={`${baseurl}${offer.image_url}`} alt={offer.title} />
        ) : (
          <div className="offersreatiler-no-image">No Image</div>
        )}
      </div>
      
      <div className="offersreatiler-card-content">
        <div className="offersreatiler-card-header">
          <h3 className="offersreatiler-card-title">{offer.title}</h3>
          <span className={`offersreatiler-status-badge ${offer.status}`}>
            {offer.status}
          </span>
        </div>
        
        <p className="offersreatiler-card-desc">{offer.description}</p>
        
        <div className="offersreatiler-details-list">
          <div className="offersreatiler-detail-item">
            <strong>Discount:</strong> {offer.discount_percentage}%
          </div>
          
          <div className="offersreatiler-detail-item">
            <strong>Min. Amount:</strong> ₹{offer.minimum_amount || 0}
          </div>
          
          {offer.offer_type === 'category' && (
            <>
              <div className="offersreatiler-detail-item">
                <strong>Category:</strong> {offer.category_name}
              </div>
              {offer.product_name && (
                <div className="offersreatiler-detail-item">
                  <strong>Product:</strong> {offer.product_name}
                </div>
              )}
            </>
          )}
          
          <div className="offersreatiler-detail-item">
            <strong>Valid:</strong> {formatToIndianDate(offer.valid_from)} to {formatToIndianDate(offer.valid_until)}
          </div>
        </div>

        {/* <div className="offersreatiler-card-actions mobile">
          <button 
            className="offersreatiler-btn-edit"
            onClick={() => handleEditItem(offer)}
          >
            Edit
          </button>
          <button 
            className="offersreatiler-btn-delete"
            onClick={() => handleDelete(offer.id)}
          >
            Delete
          </button>
          <button 
            className={`offersreatiler-btn-status ${offer.status}`}
            onClick={() => handleToggleStatus(offer.id, offer.status)}
          >
            {offer.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div> */}
      </div>
    </div>
  );

  return (
    <StaffMobileLayout>
      <div className="staff-offersreatiler-mobile">
        <h1>Offers Module</h1>

        {/* Filters Section */}
        <div className="offersreatiler-filters-section mobile">
          <div className="offersreatiler-search-box mobile">
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="offersreatiler-search-input mobile"
            />
            <span className="offersreatiler-search-icon">🔍</span>
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="offersreatiler-filter-select mobile"
          >
            <option value="All">All Offers</option>
            <option value="global">Global Offers</option>
            <option value="category">Category Specific</option>
          </select>
        </div>

        {loading && (
          <div className="offersreatiler-loading mobile">Loading offers...</div>
        )}

        {/* Offers Grid */}
        <div className="offersreatiler-cards-grid mobile">
          {currentItemsPage.length > 0 ? (
            currentItemsPage.map(renderRegularOfferCard)
          ) : (
            <div className="offersreatiler-empty-state mobile">
              <div className="offersreatiler-empty-icon">📋</div>
              <h3>No offers found</h3>
              <p>
                {searchTerm 
                  ? "No offers match your search criteria."
                  : "Get started by creating your first offer."
                }
              </p>
              <button 
                className="offersreatiler-add-btn mobile"
                onClick={handleAddNew}
              >
                + Add Offer
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && filteredOffers.length > 0 && (
          <div className="offersreatiler-pagination mobile">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="offersreatiler-pagination-btn mobile"
            >
              Previous
            </button>
            <span className="offersreatiler-pagination-info mobile">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="offersreatiler-pagination-btn mobile"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </StaffMobileLayout>
  );
}

export default StaffOffers;