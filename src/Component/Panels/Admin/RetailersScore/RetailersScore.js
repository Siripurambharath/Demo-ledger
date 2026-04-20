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
  const [activeTab, setActiveTab] = useState("composite"); // "composite" or "volumeCredit"
  const [filters, setFilters] = useState({
    riskCategory: "",
    volumeTier: "",
    minVolumeScore: 0,
    maxVolumeScore: 100,
    minCreditScore: 0,
    maxCreditScore: 100,
    sortBy: "overallScore",
    sortOrder: "DESC",
    period: "90"
  });
  const [summaryStats, setSummaryStats] = useState(null);
  const [volumeCreditScores, setVolumeCreditScores] = useState([]);
  const [volumeCreditLoading, setVolumeCreditLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "composite") {
      fetchRetailerScores();
    } else {
      fetchVolumeCreditScores();
    }
  }, [activeTab, filters]);

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

  const fetchVolumeCreditScores = async () => {
    try {
      setVolumeCreditLoading(true);
      
      const params = new URLSearchParams({
        page: 1,
        limit: 100,
        ...(filters.riskCategory && { riskCategory: filters.riskCategory }),
        ...(filters.volumeTier && { volumeTier: filters.volumeTier }),
        minVolumeScore: filters.minVolumeScore,
        maxVolumeScore: filters.maxVolumeScore,
        minCreditScore: filters.minCreditScore,
        maxCreditScore: filters.maxCreditScore,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        period: filters.period
      }).toString();

      const response = await axios.get(`${baseurl}/api/volume-credit-scores?${params}`);
      console.log("Volume/Credit scores data:", response.data);
      
      if (response.data.success) {
        setVolumeCreditScores(response.data.data);
        setSummaryStats(response.data.summary);
      } else {
        console.error("Failed to fetch volume/credit scores");
      }
    } catch (error) {
      console.error("Error fetching volume/credit scores:", error);
    } finally {
      setVolumeCreditLoading(false);
    }
  };

  const handleCalculateVolumeCreditScores = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseurl}/api/calculate-volume-credit-score`, {
        period: filters.period
      });
      
      if (response.data.success) {
        alert("Volume & Credit scores calculated successfully!");
        fetchVolumeCreditScores();
      }
    } catch (error) {
      console.error("Error calculating volume/credit scores:", error);
      alert("Error calculating scores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRetailerDetails = (retailerId) => {
    navigate(`/admin/retailer-score-details/${retailerId}`);
  };

  const handleViewVolumeCreditDetails = (retailerId) => {
    navigate(`/admin/retailer-volume-credit-details/${retailerId}`);
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/export/volume-credit-scores/csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'volume-credit-scores.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting CSV file");
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

  // Filter volume credit scores
  const filteredVolumeCreditScores = volumeCreditScores.filter(score => {
    const nameMatch = score.name.toLowerCase().includes(search.toLowerCase()) || 
                      score.business_name.toLowerCase().includes(search.toLowerCase()) ||
                      score.email.toLowerCase().includes(search.toLowerCase());
    
    let dateMatch = true;
    if (startDate && score.lastUpdated) {
      dateMatch = new Date(score.lastUpdated) >= new Date(startDate);
    }
    if (endDate && score.lastUpdated) {
      dateMatch = dateMatch && new Date(score.lastUpdated) <= new Date(endDate);
    }

    return nameMatch && dateMatch;
  });

  // Function to get score tier color
  const getScoreTierColor = (tier) => {
    switch(tier?.toLowerCase()) {
      case 'basic': return '#6c757d';
      case 'standard': return '#7f7f7f';
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      case 'diamond': return '#b9f2ff';
      default: return '#6c757d';
    }
  };

  // Function to get risk category color
  const getRiskCategoryColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'low risk': return '#28a745';
      case 'moderate risk': return '#ffc107';
      case 'high risk': return '#fd7e14';
      case 'very high risk': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Function to get score color based on value
  const getScoreColor = (score, type = "composite") => {
    const numScore = parseFloat(score);
    
    if (type === "volume") {
      if (numScore >= 80) return '#28a745'; // Green
      if (numScore >= 60) return '#20c997'; // Teal
      if (numScore >= 50) return '#ffc107'; // Yellow
      if (numScore >= 40) return '#fd7e14'; // Orange
      return '#dc3545'; // Red
    }
    
    if (type === "credit") {
      if (numScore >= 80) return '#28a745'; // Green
      if (numScore >= 70) return '#20c997'; // Teal
      if (numScore >= 60) return '#ffc107'; // Yellow
      if (numScore >= 50) return '#fd7e14'; // Orange
      return '#dc3545'; // Red
    }
    
    // Composite score
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

  // Update filter function
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      riskCategory: "",
      volumeTier: "",
      minVolumeScore: 0,
      maxVolumeScore: 100,
      minCreditScore: 0,
      maxCreditScore: 100,
      sortBy: "overallScore",
      sortOrder: "DESC",
      period: "90"
    });
  };

  if (loading && activeTab === "composite") return <div className="">Loading retailer scores...</div>;
  if (volumeCreditLoading && activeTab === "volumeCredit") return <div className="">Loading volume/credit scores...</div>;

  return (
    <div className="">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`rs-admin-main ${isCollapsed ? 'rs-sidebar-collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} title="Retailers Score" />

        <div className="rs-retailers-page">
          {/* Page Header */}
          <div className="rs-page-header">
            <h1>Retailers Score</h1>
            <p>Track and analyze retailer performance scores and metrics</p>
            
            {/* Tab Navigation */}
            <div className="rs-tab-navigation">
              <button 
                className={`rs-tab-btn ${activeTab === "composite" ? "active" : ""}`}
                onClick={() => setActiveTab("composite")}
              >
                Composite Scores
              </button>
              <button 
                className={`rs-tab-btn ${activeTab === "volumeCredit" ? "active" : ""}`}
                onClick={() => setActiveTab("volumeCredit")}
              >
                Volume & Credit Scores
              </button>
            </div>
          </div>

          {/* Volume/Credit Specific Controls */}
          {activeTab === "volumeCredit" && (
            <div className="rs-volume-credit-controls">
              <div className="rs-control-row">
                <button 
                  className="rs-btn rs-btn-primary"
                  onClick={handleCalculateVolumeCreditScores}
                  disabled={loading}
                >
                  {loading ? "Calculating..." : "Calculate All Scores"}
                </button>
                <button 
                  className="rs-btn rs-btn-secondary"
                  onClick={fetchVolumeCreditScores}
                  disabled={volumeCreditLoading}
                >
                  {volumeCreditLoading ? "Refreshing..." : "Refresh Data"}
                </button>
                <button 
                  className="rs-btn rs-btn-outline"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
                <button 
                  className="rs-btn rs-btn-outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                <button 
                  className="rs-btn rs-btn-link"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="rs-advanced-filters">
                  <div className="rs-filter-grid">
                    <div className="rs-filter-group">
                      <label>Risk Category</label>
                      <select 
                        className="rs-form-control"
                        value={filters.riskCategory}
                        onChange={(e) => updateFilter("riskCategory", e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <option value="Low Risk">Low Risk</option>
                        <option value="Moderate Risk">Moderate Risk</option>
                        <option value="High Risk">High Risk</option>
                        <option value="Very High Risk">Very High Risk</option>
                      </select>
                    </div>
                    
                    <div className="rs-filter-group">
                      <label>Volume Tier</label>
                      <select 
                        className="rs-form-control"
                        value={filters.volumeTier}
                        onChange={(e) => updateFilter("volumeTier", e.target.value)}
                      >
                        <option value="">All Tiers</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Standard">Standard</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </div>
                    
                    <div className="rs-filter-group">
                      <label>Volume Score Range</label>
                      <div className="rs-range-inputs">
                        <input 
                          type="number" 
                          className="rs-form-control"
                          min="0"
                          max="100"
                          value={filters.minVolumeScore}
                          onChange={(e) => updateFilter("minVolumeScore", e.target.value)}
                          placeholder="Min"
                        />
                        <span>to</span>
                        <input 
                          type="number" 
                          className="rs-form-control"
                          min="0"
                          max="100"
                          value={filters.maxVolumeScore}
                          onChange={(e) => updateFilter("maxVolumeScore", e.target.value)}
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    
                    <div className="rs-filter-group">
                      <label>Credit Score Range</label>
                      <div className="rs-range-inputs">
                        <input 
                          type="number" 
                          className="rs-form-control"
                          min="0"
                          max="100"
                          value={filters.minCreditScore}
                          onChange={(e) => updateFilter("minCreditScore", e.target.value)}
                          placeholder="Min"
                        />
                        <span>to</span>
                        <input 
                          type="number" 
                          className="rs-form-control"
                          min="0"
                          max="100"
                          value={filters.maxCreditScore}
                          onChange={(e) => updateFilter("maxCreditScore", e.target.value)}
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    
                    <div className="rs-filter-group">
                      <label>Sort By</label>
                      <select 
                        className="rs-form-control"
                        value={filters.sortBy}
                        onChange={(e) => updateFilter("sortBy", e.target.value)}
                      >
                        <option value="overallScore">Overall Score</option>
                        <option value="volumeScore">Volume Score</option>
                        <option value="creditScore">Credit Score</option>
                        <option value="totalPurchases">Total Purchases</option>
                        <option value="name">Name</option>
                      </select>
                    </div>
                    
                    <div className="rs-filter-group">
                      <label>Sort Order</label>
                      <select 
                        className="rs-form-control"
                        value={filters.sortOrder}
                        onChange={(e) => updateFilter("sortOrder", e.target.value)}
                      >
                        <option value="DESC">Descending</option>
                        <option value="ASC">Ascending</option>
                      </select>
                    </div>
                    
                    <div className="rs-filter-group">
                      <label>Analysis Period (Days)</label>
                      <input 
                        type="number" 
                        className="rs-form-control"
                        value={filters.period}
                        onChange={(e) => updateFilter("period", e.target.value)}
                        min="30"
                        max="365"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Stats for Volume/Credit */}
              {summaryStats && (
                <div className="rs-volume-credit-summary">
                  <div className="rs-summary-cards">
                    <div className="rs-card">
                      <div className="rs-card-header">
                        <h3>Average Volume Score</h3>
                      </div>
                      <div className="rs-card-body">
                        <span className="rs-card-value" style={{ color: getScoreColor(summaryStats.stats.avgVolumeScore, "volume") }}>
                          {summaryStats.stats.avgVolumeScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="rs-card">
                      <div className="rs-card-header">
                        <h3>Average Credit Score</h3>
                      </div>
                      <div className="rs-card-body">
                        <span className="rs-card-value" style={{ color: getScoreColor(summaryStats.stats.avgCreditScore, "credit") }}>
                          {summaryStats.stats.avgCreditScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="rs-card">
                      <div className="rs-card-header">
                        <h3>Total Purchase Volume</h3>
                      </div>
                      <div className="rs-card-body">
                        <span className="rs-card-value">
                          ₹{summaryStats.stats.totalPurchaseVolume.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="rs-card">
                      <div className="rs-card-header">
                        <h3>Risk Distribution</h3>
                      </div>
                      <div className="rs-card-body">
                        <div className="rs-risk-distribution">
                          {Object.entries(summaryStats.riskDistribution || {}).map(([risk, count]) => (
                            <div key={risk} className="rs-risk-item">
                              <span className="rs-risk-dot" style={{ backgroundColor: getRiskCategoryColor(risk) }}></span>
                              <span className="rs-risk-label">{risk}</span>
                              <span className="rs-risk-count">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  onClick={activeTab === "composite" ? fetchRetailerScores : fetchVolumeCreditScores}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards - Only show for composite tab */}
          {activeTab === "composite" && (
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
          )}

          {/* Main Table */}
          <div className="rs-table-section">
            <div className="rs-table-header">
              <h3>
                {activeTab === "composite" 
                  ? "Retailer Performance Scores" 
                  : "Volume & Credit Risk Scores"}
              </h3>
              <span className="rs-badge">
                {activeTab === "composite" 
                  ? `${filteredRetailers.length} Retailers` 
                  : `${filteredVolumeCreditScores.length} Retailers`}
              </span>
            </div>

            <div className="rs-table-container">
              {activeTab === "composite" ? (
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
                                onClick={() => handleViewRetailerDetails(retailer.id)}
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button
                                className="rs-btn rs-btn-sm rs-btn-outline"
                                onClick={() => handleViewVolumeCreditDetails(retailer.id)}
                                title="Volume/Credit Score"
                              >
                                📊
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="rs-retailers-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Retailer Name</th>
                      <th>Volume Score</th>
                      <th>Credit Score</th>
                      <th>Overall Score</th>
                      <th>Risk Category</th>
                      <th>Volume Tier</th>
                      <th>Total Purchases</th>
                      <th>Orders</th>
                      <th>Suggested Credit Limit</th>
                      <th>Current Limit</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVolumeCreditScores.map((score) => (
                      <tr key={score.id} className="rs-retailer-row">
                        <td>{score.id}</td>
                        <td>
                          <div className="rs-retailer-name">
                            <strong>{score.business_name || score.name}</strong>
                            <small>{score.email}</small>
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-score-badge"
                            style={{ 
                              backgroundColor: getScoreColor(score.scores.volumeScore, "volume"),
                              color: score.scores.volumeScore >= 60 ? '#212529' : 'white'
                            }}
                          >
                            {score.scores.volumeScore}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-score-badge"
                            style={{ 
                              backgroundColor: getScoreColor(score.scores.creditRiskScore, "credit"),
                              color: score.scores.creditRiskScore >= 60 ? '#212529' : 'white'
                            }}
                          >
                            {score.scores.creditRiskScore}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-score-badge"
                            style={{ 
                              backgroundColor: getScoreColor(score.scores.overallScore),
                              color: score.scores.overallScore >= 60 ? '#212529' : 'white'
                            }}
                          >
                            {score.scores.overallScore}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-tier-badge"
                            style={{ 
                              backgroundColor: getRiskCategoryColor(score.scores.riskCategory),
                              color: '#212529'
                            }}
                          >
                            {score.scores.riskCategory}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="rs-tier-badge"
                            style={{ 
                              backgroundColor: getScoreTierColor(score.scores.volumeTier),
                              color: score.scores.volumeTier === 'Gold' ? '#212529' : 'white'
                            }}
                          >
                            {score.scores.volumeTier}
                          </div>
                        </td>
                        <td>
                          <span className="rs-amount">
                            ₹{parseFloat(score.metrics.totalPurchases || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="rs-order-count">
                            {score.metrics.orderCount || "0"}
                          </span>
                        </td>
                        <td>
                          <span className="rs-amount" style={{ color: '#198754' }}>
                            ₹{parseFloat(score.scores.suggestedCreditLimit || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="rs-amount">
                            ₹{parseFloat(score.credit_limit || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          {score.lastUpdated
                            ? new Date(score.lastUpdated).toLocaleDateString('en-GB', {
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
                              onClick={() => handleViewVolumeCreditDetails(score.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="rs-btn rs-btn-sm rs-btn-outline"
                              onClick={() => console.log("Recalculate for", score.id)}
                              title="Recalculate"
                            >
                              🔄
                            </button>
                            <button
                              className="rs-btn rs-btn-sm rs-btn-outline"
                              onClick={() => console.log("Apply credit limit", score.id)}
                              title="Apply Credit Limit"
                              style={{ color: '#198754' }}
                            >
                              💳
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "composite" && filteredRetailers.length === 0 && (
                <div className="rs-empty-state">
                  <p>No retailers found matching your criteria.</p>
                </div>
              )}

              {activeTab === "volumeCredit" && filteredVolumeCreditScores.length === 0 && (
                <div className="rs-empty-state">
                  <p>No volume/credit scores found. Click "Calculate All Scores" to generate scores.</p>
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