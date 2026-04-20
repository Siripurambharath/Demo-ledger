import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import './SalesPersonScore.css';
import { baseurl } from "../../../BaseURL/BaseURL";

function SalesPersonScore() {
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalSalespersons: 0,
    totalTarget: 0,
    totalAchieved: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchSalesPersonScores();
  }, []);

  const fetchSalesPersonScores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/api/salesperson-scores`);
      console.log("Salesperson scores data:", response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        setSalespersons(data);
        
        // Calculate statistics
        const totalTarget = data.reduce((sum, sp) => sum + parseFloat(sp.target || 0), 0);
        const totalAchieved = data.reduce((sum, sp) => sum + parseFloat(sp.target_achieved || 0), 0);
        const averageScore = data.length > 0 
          ? data.reduce((sum, sp) => sum + parseFloat(sp.score_marks || 0), 0) / data.length
          : 0;
        
        setStats({
          totalSalespersons: data.length,
          totalTarget: totalTarget,
          totalAchieved: totalAchieved,
          averageScore: averageScore
        });
      } else {
        console.error("Failed to fetch salesperson scores");
      }
    } catch (error) {
      console.error("Error fetching salesperson scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter salespersons by search and date
  const filteredSalespersons = salespersons.filter(salesperson => {
    const nameMatch = salesperson.name.toLowerCase().includes(search.toLowerCase()) || 
                      salesperson.email.toLowerCase().includes(search.toLowerCase());
    
    let dateMatch = true;
    if (startDate && salesperson.last_target_calculated && salesperson.last_target_calculated !== "null") {
      dateMatch = new Date(salesperson.last_target_calculated) >= new Date(startDate);
    }
    if (endDate && salesperson.last_target_calculated && salesperson.last_target_calculated !== "null") {
      dateMatch = dateMatch && new Date(salesperson.last_target_calculated) <= new Date(endDate);
    }

    return nameMatch && dateMatch;
  });

  // Function to get score color based on marks
  const getScoreColor = (scoreMarks) => {
    const numScore = parseFloat(scoreMarks);
    if (numScore >= 8) return '#28a745'; // Green
    if (numScore >= 6) return '#ffc107'; // Yellow
    if (numScore >= 4) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  // Function to get achievement color
  const getAchievementColor = (percentage) => {
    const numPercent = parseFloat(percentage);
    if (numPercent >= 100) return '#28a745'; // Green
    if (numPercent >= 75) return '#ffc107'; // Yellow
    if (numPercent >= 50) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  // Calculate overall achievement percentage
  const calculateOverallAchievement = () => {
    if (stats.totalTarget === 0) return 0;
    return ((stats.totalAchieved / stats.totalTarget) * 100).toFixed(2);
  };

  // Manually calculate score for a salesperson
  const calculateSingleScore = async (salespersonId) => {
    try {
      const response = await axios.post(`${baseurl}/api/calculate-single-salesperson-score/${salespersonId}`, {
        period: 30
      });
      
      if (response.data.success) {
        alert(`Score calculated successfully for ${response.data.data.salesperson_name}`);
        fetchSalesPersonScores(); // Refresh the data
      }
    } catch (error) {
      console.error("Error calculating single score:", error);
      alert("Failed to calculate score");
    }
  };

  // Update salesperson target
  const updateTarget = async (salespersonId, currentTarget) => {
    const newTarget = prompt(`Enter new target amount for ${salespersons.find(sp => sp.id === salespersonId)?.name}`, currentTarget);
    
    if (newTarget && !isNaN(newTarget) && parseFloat(newTarget) > 0) {
      try {
        const response = await axios.put(`${baseurl}/api/update-salesperson-target/${salespersonId}`, {
          target: parseFloat(newTarget)
        });
        
        if (response.data.success) {
          alert("Target updated successfully!");
          fetchSalesPersonScores(); // Refresh the data
        }
      } catch (error) {
        console.error("Error updating target:", error);
        alert("Failed to update target");
      }
    }
  };

  if (loading) return <div className="sps-admin-layout">Loading salesperson scores...</div>;

  return (
    <div className="sps-admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`sps-admin-main ${isCollapsed ? 'sps-sidebar-collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} title="Salesperson Target Scores" />

        <div className="sps-salespersons-page">
          {/* Page Header */}
          <div className="sps-page-header">
            <h1>Salesperson Target Scores</h1>
            <p>Track and analyze salesperson performance against targets</p>
            <div className="sps-header-actions">
              <button 
                className="sps-btn sps-btn-primary"
                onClick={() => fetchSalesPersonScores()}
              >
                Refresh Data
              </button>
              <button 
                className="sps-btn sps-btn-secondary"
                onClick={async () => {
                  if (window.confirm("Calculate scores for all salespersons?")) {
                    try {
                      const response = await axios.post(`${baseurl}/api/calculate-salesperson-scores`, {
                        period: 30
                      });
                      if (response.data.success) {
                        alert("All scores calculated successfully!");
                        fetchSalesPersonScores();
                      }
                    } catch (error) {
                      console.error("Error calculating scores:", error);
                      alert("Failed to calculate scores");
                    }
                  }
                }}
              >
                Calculate All Scores
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="sps-summary-cards">
            <div className="sps-card">
              <div className="sps-card-header">
                <h3>Total Salespersons</h3>
              </div>
              <div className="sps-card-body">
                <span className="sps-card-value">{stats.totalSalespersons}</span>
                <p className="sps-card-label">Active Staff</p>
              </div>
            </div>
            <div className="sps-card">
              <div className="sps-card-header">
                <h3>Average Score</h3>
              </div>
              <div className="sps-card-body">
                <span className="sps-card-value">{stats.averageScore.toFixed(2)}</span>
                <p className="sps-card-label">Out of 10</p>
              </div>
            </div>
            <div className="sps-card">
              <div className="sps-card-header">
                <h3>Total Target</h3>
              </div>
              <div className="sps-card-body">
                <span className="sps-card-value">₹{stats.totalTarget.toLocaleString()}</span>
                <p className="sps-card-label">Overall Target</p>
              </div>
            </div>
            <div className="sps-card">
              <div className="sps-card-header">
                <h3>Overall Achievement</h3>
              </div>
              <div className="sps-card-body">
                <span className="sps-card-value">{calculateOverallAchievement()}%</span>
                <p className="sps-card-label">₹{stats.totalAchieved.toLocaleString()} Achieved</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="sps-filters-section">
            <div className="sps-filter-row">
              <div className="sps-filter-group">
                <input
                  type="text"
                  className="sps-form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="sps-filter-group">
                <input
                  type="date"
                  className="sps-form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="From Date"
                />
              </div>
              <div className="sps-filter-group">
                <input
                  type="date"
                  className="sps-form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="To Date"
                />
              </div>
              <div className="sps-filter-group">
                <select 
                  className="sps-form-control"
                  onChange={(e) => {
                    if (e.target.value === "highToLow") {
                      setSalespersons([...salespersons].sort((a, b) => 
                        parseFloat(b.achievement_percentage) - parseFloat(a.achievement_percentage)
                      ));
                    } else if (e.target.value === "lowToHigh") {
                      setSalespersons([...salespersons].sort((a, b) => 
                        parseFloat(a.achievement_percentage) - parseFloat(b.achievement_percentage)
                      ));
                    }
                  }}
                >
                  <option value="">Sort by Achievement</option>
                  <option value="highToLow">High to Low</option>
                  <option value="lowToHigh">Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="sps-table-section">
            <div className="sps-table-header">
              <h3>Salesperson Performance</h3>
              <span className="sps-badge">{filteredSalespersons.length} Salespersons</span>
            </div>

            <div className="sps-table-container">
              <table className="sps-salespersons-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Salesperson Name</th>
                    <th>Contact</th>
                    <th>Score Marks</th>
                    <th>Target</th>
                    <th>Achieved</th>
                    <th>Achievement %</th>
                    <th>Last Calculated</th>
                    <th>Target Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalespersons.map((salesperson) => {
                    const achievementPercent = parseFloat(salesperson.achievement_percentage || 0);
                    const scoreMarks = parseFloat(salesperson.score_marks || 0);
                    const target = parseFloat(salesperson.target || 0);
                    const achieved = parseFloat(salesperson.target_achieved || 0);
                    
                    return (
                      <tr key={salesperson.id} className="sps-salesperson-row">
                        <td>{salesperson.id}</td>
                        <td>
                          <div className="sps-salesperson-name">
                            <strong>{salesperson.name}</strong>
                            <small>{salesperson.email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="sps-contact-info">
                            <span>{salesperson.mobile_number}</span>
                            {salesperson.assigned_staff && (
                              <small>Assigned: {salesperson.assigned_staff}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="sps-score-badge"
                            style={{ 
                              backgroundColor: getScoreColor(scoreMarks),
                              color: scoreMarks >= 6 ? '#212529' : 'white'
                            }}
                          >
                            {scoreMarks.toFixed(2)}/10
                          </div>
                        </td>
                        <td>
                          <div className="sps-target-amount">
                            ₹{target.toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <div className="sps-achieved-amount">
                            ₹{achieved.toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <div 
                            className="sps-achievement-percent"
                            style={{ color: getAchievementColor(achievementPercent) }}
                          >
                            <strong>{achievementPercent.toFixed(2)}%</strong>
                          </div>
                        </td>
                        <td>
                          <div className="sps-last-calculated">
                            {salesperson.last_target_calculated && salesperson.last_target_calculated !== "null" 
                              ? new Date(salesperson.last_target_calculated).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : "Never"}
                            {salesperson.days_since_last_calc > 0 && (
                              <small className="sps-days-ago">
                                ({salesperson.days_since_last_calc} days ago)
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="sps-target-progress">
                            <div className="sps-progress-bar">
                              <div 
                                className="sps-progress-fill"
                                style={{ 
                                  width: `${Math.min(100, achievementPercent)}%`,
                                  backgroundColor: getAchievementColor(achievementPercent)
                                }}
                              ></div>
                            </div>
                            <div className="sps-progress-labels">
                              <span className="sps-progress-text">
                                {achievementPercent.toFixed(1)}%
                              </span>
                              <span className="sps-progress-target">
                                Target: {target >= 100000 ? `${(target/100000).toFixed(1)}L` : target.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="sps-action-buttons">
                            <button
                              className="sps-btn sps-btn-sm sps-btn-outline"
                              onClick={() => calculateSingleScore(salesperson.id)}
                              title="Calculate Score"
                            >
                              🔄
                            </button>
                            <button
                              className="sps-btn sps-btn-sm sps-btn-outline"
                              onClick={() => updateTarget(salesperson.id, target)}
                              title="Update Target"
                            >
                              ✏️
                            </button>
                            <button
                              className="sps-eye-btn"
                              onClick={() => {
                                // Navigate to salesperson details page
                                console.log("View details for", salesperson.id);
                                // You can implement navigation here
                              }}
                              title="View Details"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredSalespersons.length === 0 && (
                <div className="sps-empty-state">
                  <p>No salespersons found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="sps-performance-summary">
            <div className="sps-performance-header">
              <h3>Performance Summary</h3>
            </div>
            <div className="sps-performance-grid">
              <div className="sps-performance-card">
                <h4>Top Performers (Score ≥ 8/10)</h4>
                <div className="sps-performance-list">
                  {salespersons
                    .filter(sp => parseFloat(sp.score_marks || 0) >= 8)
                    .map(sp => (
                      <div key={sp.id} className="sps-performance-item">
                        <span className="sps-performer-name">{sp.name}</span>
                        <span className="sps-performer-score">{parseFloat(sp.score_marks).toFixed(2)}/10</span>
                      </div>
                    ))}
                  {salespersons.filter(sp => parseFloat(sp.score_marks || 0) >= 8).length === 0 && (
                    <p className="sps-no-data">No top performers yet</p>
                  )}
                </div>
              </div>
              <div className="sps-performance-card">
                <h4>Needs Improvement (Score ≤ 4/10)</h4>
                <div className="sps-performance-list">
                  {salespersons
                    .filter(sp => parseFloat(sp.score_marks || 0) <= 4 && parseFloat(sp.score_marks || 0) > 0)
                    .map(sp => (
                      <div key={sp.id} className="sps-performance-item">
                        <span className="sps-performer-name">{sp.name}</span>
                        <span className="sps-performer-score">{parseFloat(sp.score_marks).toFixed(2)}/10</span>
                      </div>
                    ))}
                  {salespersons.filter(sp => parseFloat(sp.score_marks || 0) <= 4 && parseFloat(sp.score_marks || 0) > 0).length === 0 && (
                    <p className="sps-no-data">No improvement needed</p>
                  )}
                </div>
              </div>
              <div className="sps-performance-card">
                <h4>Zero Achievement</h4>
                <div className="sps-performance-list">
                  {salespersons
                    .filter(sp => parseFloat(sp.achievement_percentage || 0) === 0)
                    .map(sp => (
                      <div key={sp.id} className="sps-performance-item">
                        <span className="sps-performer-name">{sp.name}</span>
                        <span className="sps-performer-score">0%</span>
                      </div>
                    ))}
                  {salespersons.filter(sp => parseFloat(sp.achievement_percentage || 0) === 0).length === 0 && (
                    <p className="sps-no-data">All have some achievement</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesPersonScore;