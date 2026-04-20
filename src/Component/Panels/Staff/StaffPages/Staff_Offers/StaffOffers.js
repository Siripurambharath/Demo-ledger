import React, { useState, useEffect } from "react";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./StaffOffers.css";
import { baseurl } from "../../../../BaseURL/BaseURL";

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

  useEffect(() => {
    fetchOffers();
  }, [currentPage, searchTerm, filterType]);

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

  const handleViewDetails = (offer) => {
    // Implement view details functionality
    alert(`Viewing details for: ${offer.title}\n\n` +
          `Description: ${offer.description}\n` +
          `Discount: ${offer.discount_percentage}%\n` +
          `Minimum Amount: ₹${offer.minimum_amount || 0}\n` +
          `Type: ${offer.offer_type}\n` +
          `Valid From: ${formatToIndianDate(offer.valid_from)}\n` +
          `Valid Until: ${formatToIndianDate(offer.valid_until)}`);
  };

  const renderRegularOfferCard = (offer) => (
    <div key={offer.id} className={`offers-card-item mobile ${offer.status}`}>
      <div className="offers-card-image">
        {offer.image_url ? (
          <img src={`${baseurl}${offer.image_url}`} alt={offer.title} />
        ) : (
          <div className="offers-no-image">No Image</div>
        )}
      </div>
      
      <div className="offers-card-content">
        <div className="offers-card-header">
          <h3 className="offers-card-title">{offer.title}</h3>
          <span className={`offers-status-badge ${offer.status}`}>
            {offer.status}
          </span>
        </div>
        
        <p className="offers-card-desc">{offer.description}</p>
        
        <div className="offers-details-list">
          <div className="offers-detail-item">
            <strong>Discount:</strong> {offer.discount_percentage}%
          </div>
          
          <div className="offers-detail-item">
            <strong>Min. Amount:</strong> ₹{offer.minimum_amount || 0}
          </div>
          
          <div className="offers-detail-item">
            <strong>Type:</strong> 
            {offer.offer_type === 'global' && ' Global Offer'}
            {offer.offer_type === 'category' && ' Category Specific'}
            {offer.offer_type === 'product' && ' Product Specific'}
          </div>
          
          {offer.offer_type === 'category' && offer.category_name && (
            <div className="offers-detail-item">
              <strong>Category:</strong> {offer.category_name}
            </div>
          )}
          
          {offer.offer_type === 'product' && offer.product_name && (
            <div className="offers-detail-item">
              <strong>Product:</strong> {offer.product_name}
            </div>
          )}
          
          <div className="offers-detail-item">
            <strong>Valid:</strong> {formatToIndianDate(offer.valid_from)} to {formatToIndianDate(offer.valid_until)}
          </div>
        </div>

        {/* Staff actions - View Details only */}
        {/* <div className="offers-card-actions mobile">
          <button 
            className="offers-btn-edit"
            onClick={() => handleViewDetails(offer)}
          >
            View Details
          </button>
        </div> */}
      </div>
    </div>
  );

  return (
    <StaffMobileLayout>
      <div className="staff-offers-mobile">
        <h1>Offers Module</h1>

        {/* Filters Section */}
        <div className="offers-filters-section mobile">
          <div className="offers-search-box mobile">
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="offers-search-input mobile"
            />
            <span className="offers-search-icon">🔍</span>
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="offers-filter-select mobile"
          >
            <option value="All">All Offers</option>
            <option value="global">Global Offers</option>
            <option value="category">Category Specific</option>
            <option value="product">Product Specific</option>
          </select>
        </div>

        {loading && (
          <div className="offers-loading mobile">Loading offers...</div>
        )}

        {/* Offers Grid */}
        <div className="offers-cards-grid mobile">
          {currentItemsPage.length > 0 ? (
            currentItemsPage.map(renderRegularOfferCard)
          ) : (
            <div className="offers-empty-state mobile">
              <div className="offers-empty-icon">📋</div>
              <h3>No offers found</h3>
              <p>
                {searchTerm 
                  ? "No offers match your search criteria."
                  : "No offers available at the moment."
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && filteredOffers.length > 0 && (
          <div className="offers-pagination mobile">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="offers-pagination-btn mobile"
            >
              Previous
            </button>
            <span className="offers-pagination-info mobile">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="offers-pagination-btn mobile"
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