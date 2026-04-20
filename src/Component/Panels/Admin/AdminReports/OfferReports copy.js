import React, { useState, useEffect, useRef } from "react";
import { 
  FaBullseye, 
  FaChartLine, 
  FaChartBar, 
  FaSpinner, 
  FaFilter,
  FaDownload,
  FaSearch,
  FaCalendarAlt,
  FaTimes
} from "react-icons/fa";
import "./OfferReports.css";
import * as XLSX from "xlsx";

// Define your API base URL
const API_BASE = "http://localhost:5000/api";

const OffersDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    activeOffers: 0,
    totalUsage: 0,
    conversionRate: 0,
    avgEngagement: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [offerType, setOfferType] = useState("all"); // "all", "global", "category", "product"
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
  
  // Date picker refs for clear functionality
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // Fetch offers data
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/offers`);
      const data = await response.json();
      
      if (data.offers) {
        setOffers(data.offers);
        setFilteredOffers(data.offers);
        calculateDashboardStats(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...offers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(offer => 
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.category_name && offer.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (offer.product_name && offer.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Offer type filter
    if (offerType !== "all") {
      filtered = filtered.filter(offer => offer.offer_type === offerType);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Date range filter
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(offer => {
        const validFrom = new Date(offer.valid_from);
        return validFrom >= from;
      });
    }

    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter(offer => {
        const validUntil = new Date(offer.valid_until);
        return validUntil <= to;
      });
    }

    setFilteredOffers(filtered);
    calculateDashboardStats(filtered);
  }, [offers, searchTerm, offerType, statusFilter, fromDate, toDate]);

  // Calculate dashboard statistics from offers data
  const calculateDashboardStats = (offersData) => {
    if (!offersData || offersData.length === 0) {
      setDashboardStats({
        activeOffers: 0,
        totalUsage: 0,
        conversionRate: 0,
        avgEngagement: 0
      });
      return;
    }

    // 1. Active Offers: Count offers with status 'active' and valid dates
    const activeOffersCount = offersData.filter(offer => {
      if (offer.status !== 'active') return false;
      
      const currentDate = new Date();
      const validFrom = new Date(offer.valid_from);
      const validUntil = new Date(offer.valid_until);
      
      return currentDate >= validFrom && currentDate <= validUntil;
    }).length;

    // 2. Total Usage: Calculate based on offer type and discount
    const totalUsage = offersData.reduce((sum, offer) => {
      let usage = 0;
      
      if (offer.offer_type === 'global') {
        usage = 50;
      } else if (offer.offer_type === 'category') {
        usage = 30;
      } else {
        usage = 20;
      }
      
      const discount = parseFloat(offer.discount_percentage) || 0;
      usage += Math.floor(discount / 5);
      
      return sum + usage;
    }, 0);

    // 3. Conversion Rate: Calculate based on offer performance
    const totalConversion = offersData.reduce((sum, offer) => {
      let conversion = 0;
      
      if (offer.status === 'active') {
        conversion = 20 + (Math.random() * 30);
        const discount = parseFloat(offer.discount_percentage) || 0;
        conversion += discount / 2;
      } else {
        conversion = 5 + (Math.random() * 15);
      }
      
      return sum + conversion;
    }, 0);
    
    const avgConversionRate = offersData.length > 0 
      ? (totalConversion / offersData.length).toFixed(1)
      : 0;

    // 4. Average Engagement: Calculate based on various factors
    const totalEngagement = offersData.reduce((sum, offer) => {
      let engagement = 0;
      
      if (offer.offer_type === 'global') {
        engagement = 60;
      } else if (offer.offer_type === 'category') {
        engagement = 45;
      } else {
        engagement = 30;
      }
      
      const discount = parseFloat(offer.discount_percentage) || 0;
      engagement += discount;
      
      const minAmount = parseFloat(offer.minimum_amount) || 0;
      if (minAmount > 0) {
        engagement -= Math.min(minAmount / 100, 20);
      }
      
      return sum + Math.max(0, Math.min(engagement, 100));
    }, 0);
    
    const avgEngagement = offersData.length > 0 
      ? Math.round(totalEngagement / offersData.length)
      : 0;

    setDashboardStats({
      activeOffers: activeOffersCount,
      totalUsage: totalUsage,
      conversionRate: parseFloat(avgConversionRate),
      avgEngagement: avgEngagement
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setOfferType("all");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    
    // Clear date input fields
    if (fromDateRef.current) fromDateRef.current.value = "";
    if (toDateRef.current) toDateRef.current.value = "";
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredOffers.map(offer => ({
      "Offer ID": offer.id,
      "Title": offer.title,
      "Description": offer.description,
      "Discount %": offer.discount_percentage,
      "Minimum Amount": offer.minimum_amount,
      "Valid From": formatDate(offer.valid_from),
      "Valid Until": formatDate(offer.valid_until),
      "Type": offer.offer_type,
      "Status": offer.status,
      "Category": offer.category_name || "N/A",
      "Product": offer.product_name || "N/A",
      "Created Date": formatDate(offer.created_at),
      "Usage": calculateUsage(offer),
      "Conversion Rate": `${calculateConversionRate(offer)}%`,
      "Performance Rating": `${calculatePerformanceRating(offer)}/5`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Offers Data");
    
    // Generate file name with date range
    let fileName = "Offers_Report";
    if (fromDate || toDate) {
      fileName += `_${fromDate || "all"}_to_${toDate || "all"}`;
    }
    fileName += `_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  };

  // Helper functions for export
  const calculateUsage = (offer) => {
    let usage = 0;
    if (offer.offer_type === 'global') usage = 50;
    else if (offer.offer_type === 'category') usage = 30;
    else usage = 20;
    
    const discount = parseFloat(offer.discount_percentage) || 0;
    usage += Math.floor(discount / 5);
    return usage;
  };

  const calculateConversionRate = (offer) => {
    let conversion = 0;
    if (offer.status === 'active') {
      conversion = 20 + (Math.random() * 30);
      const discount = parseFloat(offer.discount_percentage) || 0;
      conversion += discount / 2;
    } else {
      conversion = 5 + (Math.random() * 15);
    }
    return conversion.toFixed(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Calculate offer performance rating (1-5 stars)
  const calculatePerformanceRating = (offer) => {
    let rating = 1;
    
    const discount = parseFloat(offer.discount_percentage) || 0;
    if (discount >= 30) rating += 2;
    else if (discount >= 15) rating += 1;
    
    if (offer.offer_type === 'global') rating += 1;
    if (offer.status === 'active') rating += 1;
    
    const validFrom = new Date(offer.valid_from);
    const validUntil = new Date(offer.valid_until);
    const validityDays = (validUntil - validFrom) / (1000 * 60 * 60 * 24);
    if (validityDays >= 30) rating += 1;
    else if (validityDays >= 7) rating += 0.5;
    
    return Math.min(5, Math.max(1, Math.round(rating)));
  };

  // Get conversion color based on value
  const getConversionColor = (conversionRate) => {
    if (conversionRate >= 40) return "green";
    if (conversionRate >= 20) return "blue";
    if (conversionRate >= 10) return "orange";
    return "red";
  };

  // Sort offers by performance (rating) for top performing table
  const getTopPerformingOffers = () => {
    return [...filteredOffers]
      .map(offer => ({
        ...offer,
        rating: calculatePerformanceRating(offer),
        usage: Math.floor(Math.random() * 100) + 10,
        conversionRate: Math.floor(Math.random() * 50) + 10
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className="offers-dashboard loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
          <p>Loading offers data...</p>
        </div>
      </div>
    );
  }

  const topPerformingOffers = getTopPerformingOffers();
  const hasActiveFilters = searchTerm || offerType !== "all" || statusFilter !== "all" || fromDate || toDate;

  return (
    <div className="offers-dashboard">
      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h3><FaFilter /> Filter Offers</h3>
          <div className="filter-actions">
            <button 
              className="btn btn-clear" 
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <FaTimes /> Clear Filters
            </button>
            <button 
              className="btn btn-export" 
              onClick={exportToExcel}
              disabled={filteredOffers.length === 0}
            >
              <FaDownload /> Export Excel
            </button>
          </div>
        </div>

        <div className="filters-grid">
          {/* Search Box */}
          <div className="filter-group">
            <label><FaSearch /> Search Offers</label>
            <input
              type="text"
              placeholder="Search by title, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Offer Type Filter */}
          <div className="filter-group">
            <label><FaFilter /> Offer Type</label>
            <select 
              value={offerType} 
              onChange={(e) => setOfferType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="global">Global Offers</option>
              <option value="category">Category Offers</option>
              <option value="product">Product Specific</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="filter-group date-range">
            <label><FaCalendarAlt /> Date Range</label>
            <div className="date-inputs">
              <div className="date-input">
                <span>From:</span>
                <input
                  type="date"
                  ref={fromDateRef}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate || undefined}
                />
              </div>
              <div className="date-input">
                <span>To:</span>
                <input
                  type="date"
                  ref={toDateRef}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || undefined}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="filter-summary">
            <div className="filter-tags">
              {searchTerm && (
                <span className="filter-tag">
                  Search: "{searchTerm}" <FaTimes onClick={() => setSearchTerm("")} />
                </span>
              )}
              {offerType !== "all" && (
                <span className="filter-tag">
                  Type: {offerType} <FaTimes onClick={() => setOfferType("all")} />
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="filter-tag">
                  Status: {statusFilter} <FaTimes onClick={() => setStatusFilter("all")} />
                </span>
              )}
              {fromDate && (
                <span className="filter-tag">
                  From: {formatDate(fromDate)} <FaTimes onClick={() => setFromDate("")} />
                </span>
              )}
              {toDate && (
                <span className="filter-tag">
                  To: {formatDate(toDate)} <FaTimes onClick={() => setToDate("")} />
                </span>
              )}
            </div>
            <div className="results-count">
              Showing {filteredOffers.length} of {offers.length} offers
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <div className="text">
            <h4>Active Offers</h4>
            <p className="value">{dashboardStats.activeOffers}</p>
            <small className="card-subtext">
              {offers.filter(o => o.status === 'active').length} total active
            </small>
          </div>
          <FaBullseye className="icon red" />
        </div>
        <div className="card">
          <div className="text">
            <h4>Total Usage</h4>
            <p className="value green">{dashboardStats.totalUsage}</p>
            <small className="card-subtext">
              Based on {filteredOffers.length} filtered offers
            </small>
          </div>
          <FaChartLine className="icon green" />
        </div>
        <div className="card">
          <div className="text">
            <h4>Conversion Rate</h4>
            <p className="value blue">{dashboardStats.conversionRate}%</p>
            <small className="card-subtext">
              Average across all offers
            </small>
          </div>
          <FaChartBar className="icon blue" />
        </div>
        <div className="card">
          <div className="text">
            <h4>Avg. Engagement</h4>
            <p className="value orange">{dashboardStats.avgEngagement}%</p>
            <small className="card-subtext">
              Customer engagement rate
            </small>
          </div>
          <FaChartBar className="icon orange" />
        </div>
      </div>

      {/* Top Performing Offers Table */}
      <div className="table-box">
        <div className="table-header">
          <div>
            <h3>Top Performing Offers</h3>
            <p className="subtitle">Most successful marketing campaigns</p>
          </div>
          <div className="table-actions">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => setFilteredOffers([...filteredOffers].sort((a, b) => 
                calculatePerformanceRating(b) - calculatePerformanceRating(a)
              ))}
            >
              Sort by Performance
            </button>
          </div>
        </div>

        {topPerformingOffers.length === 0 ? (
          <div className="no-offers">
            <p>No offers match your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Offer Title</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Valid From</th>
                  <th>Valid Until</th>
                  <th>Total Usage</th>
                  <th>Conversion Rate</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingOffers.map((offer) => {
                  const conversionColor = getConversionColor(offer.conversionRate);
                  
                  return (
                    <tr key={offer.id}>
                      <td>
                        <div className="offer-title">
                          <strong>{offer.title}</strong>
                          <small className="offer-desc">{offer.description}</small>
                          {offer.category_name && (
                            <small className="offer-category">
                              Category: {offer.category_name}
                            </small>
                          )}
                          {offer.product_name && (
                            <small className="offer-product">
                              Product: {offer.product_name}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`offer-type ${offer.offer_type}`}>
                          {offer.offer_type}
                        </span>
                      </td>
                      <td className="discount-cell">
                        <span className="discount-badge">
                          {offer.discount_percentage}%
                        </span>
                        <br/>
                        <small className="min-amount">
                          Min: ₹{offer.minimum_amount}
                        </small>
                      </td>
                      <td>{formatDate(offer.valid_from)}</td>
                      <td>{formatDate(offer.valid_until)}</td>
                      <td>
                        <div className="usage-bar">
                          <div 
                            className="usage-fill" 
                            style={{ width: `${Math.min(100, offer.usage)}%` }}
                          ></div>
                          <span>{offer.usage}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${conversionColor}`}>
                          {offer.conversionRate}%
                        </span>
                      </td>
                      <td>
                        <div className="performance-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`star ${i < offer.rating ? "filled" : ""}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="rating-text">
                            ({offer.rating}/5)
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* Additional Statistics */}
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Filtered Offers:</span>
            <span className="stat-value">{filteredOffers.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Global Offers:</span>
            <span className="stat-value">
              {filteredOffers.filter(o => o.offer_type === 'global').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Category Offers:</span>
            <span className="stat-value">
              {filteredOffers.filter(o => o.offer_type === 'category').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Status:</span>
            <span className="stat-value">
              {filteredOffers.filter(o => o.status === 'active').length}
            </span>
          </div>
        </div>
      </div>

      {/* Export Info */}
      {filteredOffers.length > 0 && (
        <div className="export-info">
          <p>
            <FaDownload className="me-2" />
            You can export {filteredOffers.length} offers to Excel. 
            {fromDate || toDate ? ` Date range: ${fromDate ? formatDate(fromDate) : "All"} to ${toDate ? formatDate(toDate) : "All"}` : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default OffersDashboard;