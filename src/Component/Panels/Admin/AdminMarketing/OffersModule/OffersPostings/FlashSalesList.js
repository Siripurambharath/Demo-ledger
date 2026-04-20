import React, { useState, useEffect } from "react";
import { baseurl } from '../../../../../BaseURL/BaseURL';

function FlashSalesList({ searchTerm, onSearchChange, onAddNew, onEditItem }) {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 5;

  // Format date to Indian format (DD/MM/YYYY)
  const formatToIndianDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format time to HH:MM format
  const formatTime = (timeString) => {
    if (!timeString) return "00:00";
    try {
      // Handle various time formats
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
      return timeString;
    } catch (error) {
      return "00:00";
    }
  };

const fetchFlashSales = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`${baseurl}/flashoffer`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API Response for flash sales:", result); 

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch flash sales");
    }

    const mappedSales = result.data.map((sale) => {
      console.log("Processing sale:", sale); 
      
      return {
        id: sale.id,
        title: sale.title,
        description: sale.description,
        flashSaleType: sale.flashSaleType || sale.offer_type,
        status: sale.status,
        validFrom: sale.valid_from,
        validUntil: sale.valid_until,
        startTime: formatTime(sale.start_time),
        endTime: formatTime(sale.end_time),
        buyQuantity: sale.buy_quantity || 1,
        getQuantity: sale.get_quantity || 1,
        discountValue: sale.discount_percentage || 0,
        purchaseLimit: sale.purchase_limit || null,
        expiryThreshold: sale.expiry_threshold || null,
        termsConditions: sale.terms_conditions || "",
        product_id: sale.product_id,
        product_name: sale.product_name,
        category_id: sale.category_id,
        category_name: sale.category_name,
        products: sale.product_id ? [{
          id: sale.product_id,
          name: sale.product_name,
          category: sale.category_name,
          category_id: sale.category_id
        }] : [],
        image: sale.image_url ? `${baseurl}${sale.image_url}` : null,
        createdAt: sale.created_at,
      };
    });

    console.log("Mapped sales:", mappedSales); // Debug log
    setFlashSales(mappedSales);
  } catch (err) {
    console.error("Failed to fetch flash sales:", err);
    setError(err.message || "Something went wrong while loading flash sales");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchFlashSales();
  }, []);

  const flashSaleTypes = [
    { value: "bogo", label: "Buy One Get One", description: "Buy X get Y free" },
    { value: "expiry", label: "Near Expiry", description: "Discounts on expiring products" },
    { value: "clearance", label: "Clearance Sale", description: "Stock clearance discounts" },
    { value: "seasonal", label: "Seasonal Flash", description: "Seasonal product discounts" },
    { value: "hourly", label: "Hourly Deal", description: "Limited time hourly discounts" },
    { value: "limited_stock", label: "Limited Stock", description: "Limited quantity offers" },
  ];

  const handleDeleteFlashSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      try {
        const response = await fetch(`${baseurl}/flashoffer/${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          setFlashSales(flashSales.filter((sale) => sale.id !== id));
          alert('Flash sale deleted successfully');
        } else {
          alert(result.message || 'Failed to delete flash sale');
        }
      } catch (error) {
        console.error('Error deleting flash sale:', error);
        alert('Error deleting flash sale');
      }
    }
  };

  const toggleFlashSaleStatus = async (id) => {
    const sale = flashSales.find(s => s.id === id);
    if (!sale) return;
    
    const newStatus = sale.status === "active" ? "inactive" : "active";
    
    try {
      const response = await fetch(`${baseurl}/flashoffer/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFlashSales(flashSales.map((sale) =>
          sale.id === id
            ? { ...sale, status: newStatus }
            : sale
        ));
      } else {
        alert(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating flash sale status:', error);
      alert('Error updating status');
    }
  };

  // Filter + Pagination
  const filteredFlashSales = flashSales.filter((sale) =>
    sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFlashSales.length / offersPerPage);
  const indexOfLastItem = currentPage * offersPerPage;
  const indexOfFirstItem = indexOfLastItem - offersPerPage;
  const currentItemsPage = filteredFlashSales.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getFlashSaleDescription = (sale) => {
    if (sale.flashSaleType === "bogo") {
      return `Buy ${sale.buyQuantity || 1} Get ${sale.getQuantity || 1} Free`;
    }
    if (sale.discountValue && Number(sale.discountValue) > 0) {
      return `${sale.discountValue}% off`;
    }
    return sale.description || "No details available";
  };

  if (loading) {
    return (
      <div className="offers-list-container">
        <div className="offers-loading">Loading Flash Sales...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-list-container">
        <div className="offers-error">
          <p>Error: {error}</p>
          <button onClick={() => fetchFlashSales()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-list-container">
      {/* Filters */}
      <div className="offers-filters-section">
        <div className="offers-search-box">
          <input
            type="text"
            placeholder="Search Flash Sales..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="offers-search-input"
          />
          <span className="offers-search-icon">🔍</span>
        </div>
      </div>

      {/* Flash Sales Grid */}
      <div className="offers-cards-grid">
        {currentItemsPage.length > 0 ? (
          currentItemsPage.map((sale) => (
            <div
              key={sale.id}
              className={`offers-card-item offers-flash-sale-card ${sale.status}`}
            >
              <div className="offers-flash-badge">FLASH SALE</div>
              <div className="offers-card-image">
                {sale.image ? (
                  <img src={sale.image} alt={sale.title} />
                ) : (
                  <div className="offers-no-image">Flash Sale</div>
                )}
              </div>

              <div className="offers-card-content">
                <div className="offers-card-header">
                  <h3 className="offers-card-title">{sale.title}</h3>
                  <span className={`offers-status-badge ${sale.status}`}>
                    {sale.status}
                  </span>
                </div>

<p 
  className="offers-card-desc" 
  title={sale.description} 
>
  {sale.description.length > 40 
    ? `${sale.description.substring(0, 40)}...` 
    : sale.description}
</p>
                <div className="offers-details-list">
                  <div className="offers-detail-item">
                    <strong>Type:</strong>{" "}
                    {flashSaleTypes.find((t) => t.value === sale.flashSaleType)?.label ||
                      "General Offer"}
                  </div>

                  <div className="offers-detail-item">
                    <strong>Offer:</strong> {getFlashSaleDescription(sale)}
                  </div>

                  <div className="offers-detail-item">
                    <strong>Timing:</strong> {sale.startTime} - {sale.endTime}
                  </div>

                  <div className="offers-detail-item">
                    <strong>Valid:</strong>{" "}
                    {formatToIndianDate(sale.validFrom)} to{" "}
                    {formatToIndianDate(sale.validUntil)}
                  </div>

                  {sale.purchaseLimit && Number(sale.purchaseLimit) > 0 && (
                    <div className="offers-detail-item">
                      <strong>Limit:</strong> {sale.purchaseLimit} per customer
                    </div>
                  )}

                  <div className="offers-detail-item">
                    <strong>Created:</strong>{" "}
                    {formatToIndianDate(sale.createdAt)}
                  </div>
                </div>

                <div className="offers-card-actions">
                  <button
                    className="offers-btn-edit"
                    onClick={() => onEditItem(sale)}
                  >
                    Edit
                  </button>
                  <button
                    className="offers-btn-delete"
                    onClick={() => handleDeleteFlashSale(sale.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`offers-btn-status ${sale.status}`}
                    onClick={() => toggleFlashSaleStatus(sale.id)}
                  >
                    {sale.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="offers-empty-state">
            <div className="offers-empty-icon">⚡</div>
            <h3>No Flash Sales found</h3>
            <p>
              {searchTerm
                ? "No Flash Sales match your search criteria."
                : "Get started by creating your first Flash Sale."}
            </p>
            <button className="offers-add-btn" onClick={onAddNew}>
              + Add Flash Sale
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && filteredFlashSales.length > 0 && (
        <div className="offers-pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="offers-pagination-btn"
          >
            Previous
          </button>
          <span className="offers-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="offers-pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default FlashSalesList;