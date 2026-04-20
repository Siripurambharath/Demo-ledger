import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import './RetailersScore.css';
import { baseurl } from "../../../BaseURL/BaseURL";

const RetailersScore = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRetailerScores();
  }, []);

  const fetchRetailerScores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/api/retailer-scores`);
      console.log("Retailer scores data:", response.data);
      
      if (response.data.success) {
        setRetailers(response.data.data);
      } else {
        console.error("Failed to fetch retailer scores");
      }
    } catch (error) {
      console.error("Error fetching retailer scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter retailers by search and date
  const filteredRetailers = retailers.filter(retailer => {
    const nameMatch = retailer.name.toLowerCase().includes(search.toLowerCase()) || 
                      retailer.business_name.toLowerCase().includes(search.toLowerCase()) ||
                      retailer.email.toLowerCase().includes(search.toLowerCase());
    
    let dateMatch = true;
    if (startDate && retailer.last_score_calculated && retailer.last_score_calculated !== "null") {
      dateMatch = new Date(retailer.last_score_calculated) >= new Date(startDate);
    }
    if (endDate && retailer.last_score_calculated && retailer.last_score_calculated !== "null") {
      dateMatch = dateMatch && new Date(retailer.last_score_calculated) <= new Date(endDate);
    }

    return nameMatch && dateMatch;
  });

  // Function to get score tier color
  const getScoreTierColor = (tier) => {
    switch(tier?.toLowerCase()) {
      case 'basic': return '#6c757d';
      case 'silver': return '#adb5bd';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      case 'diamond': return '#b9f2ff';
      default: return '#6c757d';
    }
  };

  // Function to get score color based on value
  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) return '#28a745'; // Green
    if (numScore >= 6) return '#ffc107'; // Yellow
    if (numScore >= 4) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  // Calculate achievement percentage
  const calculateAchievement = (totalPurchases, target) => {
    const purchases = parseFloat(totalPurchases) || 0;
    const targetValue = parseFloat(target) || 1;
    return ((purchases / targetValue) * 100).toFixed(2);
  };

  if (loading) return <div className="rs-admin-layout">Loading retailer scores...</div>;

  return (
    <div className="rs-admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`rs-admin-main ${isCollapsed ? 'rs-sidebar-collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} title="Retailers Score" />

        <div className="rs-retailers-page">
          {/* Page Header */}
          <div className="rs-page-header">
            <h1>Retailers Score</h1>
            <p>Track and analyze retailer performance scores and metrics</p>
          </div>

          {/* Filters Section */}
          <div className="rs-filters-section">
            <div className="rs-filter-row">
              <div className="rs-filter-group">
                <input
                  type="text"
                  className="rs-form-control"
                  placeholder="Search by name, business, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="rs-filter-group">
                <input
                  type="date"
                  className="rs-form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="From Date"
                />
              </div>
              <div className="rs-filter-group">
                <input
                  type="date"
                  className="rs-form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="To Date"
                />
              </div>
              <div className="rs-filter-group">
                <button 
                  className="rs-btn rs-btn-primary" 
                  onClick={fetchRetailerScores}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="rs-summary-cards">
            <div className="rs-card">
              <div className="rs-card-header">
                <h3>Total Retailers</h3>
              </div>
              <div className="rs-card-body">
                <span className="rs-card-value">{retailers.length}</span>
              </div>
            </div>
            <div className="rs-card">
              <div className="rs-card-header">
                <h3>Average Score</h3>
              </div>
              <div className="rs-card-body">
                <span className="rs-card-value">
                  {retailers.length > 0 
                    ? (retailers.reduce((acc, curr) => acc + parseFloat(curr.score || 0), 0) / retailers.length).toFixed(2)
                    : '0.00'}
                </span>
              </div>
            </div>
            <div className="rs-card">
              <div className="rs-card-header">
                <h3>Total Purchases</h3>
              </div>
              <div className="rs-card-body">
                <span className="rs-card-value">
                  ₹{retailers.reduce((acc, curr) => acc + parseFloat(curr.total_purchases || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="rs-card">
              <div className="rs-card-header">
                <h3>Active Orders</h3>
              </div>
              <div className="rs-card-body">
                <span className="rs-card-value">
                  {retailers.reduce((acc, curr) => acc + parseInt(curr.order_count || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="rs-table-section">
            <div className="rs-table-header">
              <h3>Retailer Performance Scores</h3>
              <span className="rs-badge">{filteredRetailers.length} Retailers</span>
            </div>

            <div className="rs-table-container">
              <table className="rs-retailers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Retailer Name</th>
                    <th>Business Name</th>
                    <th>Contact</th>
                    <th>Score</th>
                    <th>Score Tier</th>
                    <th>Assigned Staff</th>
                    <th>Discount %</th>
                    <th>Target vs Achievement</th>
                    <th>Total Purchases</th>
                    <th>Orders</th>
                    <th>Last Score Update</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRetailers.map((retailer) => {
                    const achievement = calculateAchievement(retailer.total_purchases, retailer.Target);
                    const achievementColor = parseFloat(achievement) >= 100 ? '#28a745' : 
                                           parseFloat(achievement) >= 75 ? '#ffc107' : '#dc3545';

                    return (
                      <tr key={retailer.id} className="rs-retailer-row">
                        <td>{retailer.id}</td>
                        <td>
                          <div className="rs-retailer-name">
                            <strong>{retailer.name}</strong>
                            <small>{retailer.email}</small>
                          </div>
                        </td>
                        <td>{retailer.business_name}</td>
                        <td>
                          <div className="rs-contact-info">
                            <span>{retailer.mobile_number}</span>
                            <small>{retailer.email}</small>
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-score-badge"
                            style={{ 
                              backgroundColor: getScoreColor(retailer.score),
                              color: parseFloat(retailer.score) >= 6 ? '#212529' : 'white'
                            }}
                          >
                            {retailer.score}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-tier-badge"
                            style={{ 
                              backgroundColor: getScoreTierColor(retailer.score_tier),
                              color: retailer.score_tier?.toLowerCase() === 'gold' ? '#212529' : 'white'
                            }}
                          >
                            {retailer.score_tier}
                          </div>
                        </td>
                        <td>{retailer.assigned_staff || "Not Assigned"}</td>
                        <td>
                          <span className="rs-discount">
                            {parseFloat(retailer.discount) > 0 ? `${retailer.discount}%` : "0%"}
                          </span>
                        </td>
                        <td>
                          <div className="rs-target-progress">
                            <div className="rs-progress-bar">
                              <div 
                                className="rs-progress-fill"
                                style={{ 
                                  width: `${Math.min(100, parseFloat(achievement))}%`,
                                  backgroundColor: achievementColor
                                }}
                              ></div>
                            </div>
                            <span className="rs-progress-text">
                              ₹{parseFloat(retailer.total_purchases || 0).toLocaleString()} / ₹{parseFloat(retailer.Target || 0).toLocaleString()}
                            </span>
                            <span className="rs-achievement-percent" style={{ color: achievementColor }}>
                              {achievement}%
                            </span>
                          </div>
                        </td>
                        <td>₹{parseFloat(retailer.total_purchases || 0).toLocaleString()}</td>
                        <td>
                          <span className="rs-order-count">
                            {retailer.order_count || "0"}
                          </span>
                        </td>
                        <td>
                          {retailer.last_score_calculated && retailer.last_score_calculated !== "null" 
                            ? new Date(retailer.last_score_calculated).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : "Never"}
                        </td>
                        <td>
                          <div className="rs-action-buttons">
                            <button
                              className="rs-eye-btn"
                              onClick={() => console.log("View details for", retailer.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="rs-btn rs-btn-sm rs-btn-outline"
                              onClick={() => console.log("Edit retailer", retailer.id)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRetailers.length === 0 && (
                <div className="rs-empty-state">
                  <p>No retailers found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailersScore;