import React, { useState, useEffect } from "react";
import axios from "axios";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { FaChartBar, FaChartPie, FaSearch, FaFilePdf, FaFileExcel, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";
import { Bar, Pie } from "react-chartjs-2";
import "./RetailerReport.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function RetailerReports({ loading, setLoading }) {
  const [retailerData, setRetailerData] = useState([]);
  const [stats, setStats] = useState({
    totalRetailers: 0,
    activeRetailers: 0,
    newThisMonth: 0,
    growthRate: 0,
    previousMonthCount: 0,
    currentMonthCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Date filtering with temp states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [applyDateFilter, setApplyDateFilter] = useState(false); // Start with false - no filter initially
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);

  // State distribution pie chart data
  const [stateChartData, setStateChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#4F81FF", "#FF6384", "#36A2EB", "#FFCE56", "#9966FF", 
          "#FF9F40", "#4BC0C0", "#FF6B6B", "#54D169", "#FFD166"
        ],
        hoverBackgroundColor: [
          "#3A6DE0", "#FF4D6D", "#2B8CD9", "#FFC145", "#8A5AFF",
          "#FF8A24", "#3BA9A9", "#FF5252", "#45C159", "#FFC145"
        ],
        borderWidth: 1,
      },
    ],
  });

  // Bar chart state
  const [barChartData, setBarChartData] = useState(null);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFirstDayOfCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  // Fetch retailers data with date filters
  const fetchRetailersData = async () => {
    try {
      setLoading(true);
      const url = `${baseurl}/api/reports/retailer-report`;
      const params = {};
      // Only send dates if applyDateFilter is true and dates are set
      if (applyDateFilter && fromDate) params.fromDate = fromDate;
      if (applyDateFilter && toDate) params.toDate = toDate;
      
      console.log("📌 Fetching Retailers with params:", params);
      const res = await axios.get(url, { params });

      if (res.data && Array.isArray(res.data)) {
        setRetailerData(res.data);

        // Calculate statistics
        const totalRetailers = res.data.length;
        const activeRetailers = totalRetailers;
        
        // Get current month and previous month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // Count retailers created in current month
        const currentMonthRetailers = res.data.filter(retailer => {
          const createdDate = new Date(retailer.created_at);
          return createdDate.getMonth() === currentMonth && 
                 createdDate.getFullYear() === currentYear;
        }).length;
        
        // Count retailers created in previous month
        const previousMonthRetailers = res.data.filter(retailer => {
          const createdDate = new Date(retailer.created_at);
          return createdDate.getMonth() === previousMonth && 
                 createdDate.getFullYear() === previousYear;
        }).length;
        
        // Calculate growth rate
        let growthRate = 0;
        if (previousMonthRetailers > 0) {
          growthRate = (((currentMonthRetailers - previousMonthRetailers) / previousMonthRetailers) * 100).toFixed(1);
        } else if (currentMonthRetailers > 0) {
          growthRate = 100;
        }

        setStats({
          totalRetailers,
          activeRetailers,
          newThisMonth: currentMonthRetailers,
          growthRate,
          previousMonthCount: previousMonthRetailers,
          currentMonthCount: currentMonthRetailers,
        });

        prepareStateChartData(res.data);
        prepareBarChartData(res.data);
      } else {
        setRetailerData([]);
        setBarChartData(null);
        setStateChartData({
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: [],
            borderWidth: 1,
          }]
        });
      }
    } catch (err) {
      console.error("❌ Error fetching Retailers:", err);
      setRetailerData([]);
      setBarChartData(null);
      setStateChartData({
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: [],
          borderWidth: 1,
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Set initial dates on component mount (but don't apply filter)
  useEffect(() => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    // Don't set fromDate/toDate initially - they remain empty
    // Don't apply filter on initial load
    fetchRetailersData(); // Fetch without date filters
  }, []);

  // Fetch when date filter is applied (only when applyDateFilter changes to true)
  useEffect(() => {
    if (applyDateFilter) {
      fetchRetailersData();
    }
  }, [fromDate, toDate, applyDateFilter]);

  const applyDateFilterHandler = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setApplyDateFilter(true);
  };

  // Clear only dates (reset to current month in temp but don't apply)
  const clearDatesOnly = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    // Also clear the applied dates if they were applied
    setFromDate("");
    setToDate("");
    setApplyDateFilter(false);
    fetchRetailersData(); // Refetch without date filters
  };

  // Clear all filters (search + dates)
  const clearAllFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setSearchTerm("");
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate("");
    setToDate("");
    setApplyDateFilter(false);
    fetchRetailersData(); // Refetch without date filters
  };

  // Prepare state distribution chart data
  const prepareStateChartData = (data) => {
    const stateCount = {};
    data.forEach((retailer) => {
      const state = retailer.billing_state || "Unknown State";
      stateCount[state] = (stateCount[state] || 0) + 1;
    });

    const sortedEntries = Object.entries(stateCount).sort(
      (a, b) => b[1] - a[1]
    );

    const labels = sortedEntries.map(([state]) => state);
    const counts = sortedEntries.map(([, count]) => count);

    const colors = [
      "#4F81FF", "#FF6384", "#36A2EB", "#FFCE56", "#9966FF", 
      "#FF9F40", "#4BC0C0", "#FF6B6B", "#54D169", "#FFD166"
    ];

    setStateChartData({
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: labels.map((_, index) => colors[index % colors.length]),
          hoverBackgroundColor: labels.map((_, index) => {
            const baseColor = colors[index % colors.length];
            return baseColor.replace(/^#/, '').replace(/../g, color => 
              ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - 20)).toString(16)).slice(-2)
            );
          }),
          borderWidth: 1,
        },
      ],
    });
  };

  // Prepare bar chart data
  const prepareBarChartData = (data) => {
    const businessCount = {};
    data.forEach((retailer) => {
      const businessName = retailer.business_name || "Unknown";
      businessCount[businessName] = (businessCount[businessName] || 0) + 1;
    });

    const sortedEntries = Object.entries(businessCount).sort(
      (a, b) => b[1] - a[1]
    );
    const topEntries = sortedEntries.slice(0, 8);

    const labels = topEntries.map(([name]) => name);
    const counts = topEntries.map(([, count]) => count);

    const barChartConfig = {
      labels: labels,
      datasets: [
        {
          label: "Number of Retailers",
          data: counts,
          backgroundColor: "#4F81FF",
          borderColor: "#3A6DE0",
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    };

    setBarChartData(barChartConfig);
  };

  // Format retailer data for table
  const formatRetailerData = (data) => {
    return data.map((retailer) => ({
      id: retailer.id || Math.random().toString(),
      name: retailer.name || "N/A",
      mobile: retailer.mobile_number || "N/A",
      email: retailer.email || "N/A",
      business_name: retailer.business_name || "N/A",
      gstin: retailer.gstin || "N/A",
      gst_registered_name: retailer.gst_registered_name || "N/A",
      assigned_staff: retailer.assigned_staff || "N/A",
      created_at: retailer.created_at ? new Date(retailer.created_at).toLocaleDateString() : "N/A",
      billing_state: retailer.billing_state || "N/A",
    }));
  };

  // Filter data based on search term (only name and assigned_staff)
  const filteredRetailerData = formatRetailerData(retailerData).filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.assigned_staff.toLowerCase().includes(searchLower)
    );
  });

  // Table columns
  const topRetailersColumns = [
    { 
      key: "index",
      title: "S.No",
      style: { textAlign: "center" },
      render: (value, record, index) => index + 1
    },
    { key: "name", title: "Name", style: { textAlign: "center" } },
    { key: "mobile", title: "Mobile", style: { textAlign: "center" } },
    { key: "email", title: "Email", style: { textAlign: "center" } },
    { key: "business_name", title: "Business Name", style: { textAlign: "center" } },
    { key: "gstin", title: "GSTIN", style: { textAlign: "center" } },
    { key: "assigned_staff", title: "Assigned Staff", style: { textAlign: "center" } },
    { 
      key: "created_at", 
      title: "Created Date", 
      style: { textAlign: "center" },
      render: (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      }
    },
    { key: "billing_state", title: "State", style: { textAlign: "center" } },
  ];

 // Generate report function
const handleGenerateReport = async () => {
  setGeneratingReport(true);
  try {
    let pdfBlob;
    
    if (reportFormat === 'pdf') {
      // Import the PDF generator dynamically
      const { generateRetailerReportPDF } = await import('./RetailerReportPDF');
      
      // Prepare data for PDF (use the filtered data)
      const pdfData = filteredRetailerData.map(item => ({
        name: item.name,
        mobile_number: item.mobile,
        email: item.email,
        business_name: item.business_name,
        gstin: item.gstin,
        gst_registered_name: item.gst_registered_name,
        assigned_staff: item.assigned_staff,
        created_at: item.created_at,
        billing_state: item.billing_state
      }));
      
      pdfBlob = await generateRetailerReportPDF(
        pdfData,
        stats,
        stateChartData,
        barChartData,
        applyDateFilter && fromDate ? fromDate : null,
        applyDateFilter && toDate ? toDate : null
      );
    } else {
      // Excel download - use existing axios call
      const res = await axios.post(
        `${baseurl}/api/reports/retailer-report/download`,
        { 
          fromDate: applyDateFilter && fromDate ? fromDate : null, 
          toDate: applyDateFilter && toDate ? toDate : null, 
          format: 'excel'
        },
        { responseType: "blob" }
      );
      
      pdfBlob = res.data;
    }

    const name = `Retailer_Report_${(applyDateFilter && fromDate) || "ALL"}_${(applyDateFilter && toDate) || "ALL"}.${
      reportFormat === "pdf" ? "pdf" : "xlsx"
    }`;
    
    const blobType = reportFormat === "pdf"
      ? { type: "application/pdf" }
      : { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    
    const blob = new Blob([pdfBlob], blobType);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    alert(`✅ Successfully generated ${reportFormat.toUpperCase()} report`);
    setShowGenerateModal(false);
  } catch (e) {
    console.error("❌ Download error:", e);
    alert(`❌ Failed to generate report: ${e.message}`);
  } finally {
    setGeneratingReport(false);
  }
};

  // Pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Retailers: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Retailers",
          font: { size: 12, weight: "bold" },
        },
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        title: {
          display: true,
          text: "Business Type",
          font: { size: 12, weight: "bold" },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 10 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="ret-rep">
      {/* Stats Cards */}
      <div className="ret-rep-stats-grid">
        <div className="ret-rep-stat-card">
          <h4>Total Retailers</h4>
          <div className="ret-rep-stat-number">{stats.totalRetailers}</div>
          <div className="ret-rep-stat-period">
            {applyDateFilter && fromDate && toDate ? `${fromDate} to ${toDate}` : 'All retailers'}
          </div>
        </div>
        <div className="ret-rep-stat-card">
          <h4>Active Retailers</h4>
          <div className="ret-rep-stat-number">{stats.activeRetailers}</div>
          <div className="ret-rep-stat-period">Currently active</div>
        </div>
        <div className="ret-rep-stat-card">
          <h4>New This Month</h4>
          <div className="ret-rep-stat-number">{stats.newThisMonth}</div>
          <div className="ret-rep-stat-period">Added in current month</div>
        </div>
        <div className="ret-rep-stat-card">
          <h4>Monthly Growth</h4>
          <div className={`ret-rep-stat-number ${stats.growthRate >= 0 ? 'ret-rep-positive' : 'ret-rep-negative'}`}>
            {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
          </div>
          <div className="ret-rep-stat-period">
            {stats.previousMonthCount} → {stats.currentMonthCount}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="ret-rep-charts-section">
        <div className="ret-rep-charts-container">
          {/* State Distribution Pie Chart */}
          <div className="ret-rep-chart-card">
            <div className="ret-rep-chart-header">
              <FaChartPie className="ret-rep-chart-icon" />
              <h3>Retailers by State</h3>
            </div>
            <div className="ret-rep-chart-wrapper">
              {loading ? (
                <div className="ret-rep-chart-loading">Loading chart data...</div>
              ) : stateChartData.labels.length > 0 ? (
                <Pie data={stateChartData} options={pieOptions} />
              ) : (
                <div className="ret-rep-chart-no-data">
                  No state data available for chart
                </div>
              )}
            </div>
          </div>

          {/* Business Type Bar Chart */}
          <div className="ret-rep-chart-card">
            <div className="ret-rep-chart-header">
              <FaChartBar className="ret-rep-chart-icon" />
              <h3>Retailers by Business Type</h3>
            </div>
            <div className="ret-rep-chart-wrapper">
              {loading ? (
                <div className="ret-rep-chart-loading">Loading chart data...</div>
              ) : barChartData ? (
                <Bar data={barChartData} options={barOptions} />
              ) : (
                <div className="ret-rep-chart-no-data">
                  No business data available for chart
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Retailers Table Section */}
      <div className="ret-rep-table-section">
        <div className="ret-rep-table-header">
          <h2>All Retailers</h2>
        </div>
        
        <div className="ret-rep-filter-row">
          <div className="ret-rep-search-left">
            <div className="ret-rep-search-box">
              <FaSearch className="ret-rep-search-icon" />
              <input
                type="text"
                placeholder="Search by name or assigned staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ret-rep-search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="ret-rep-search-clear"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Date filters with Apply Button on right */}
          <div className="ret-rep-date-right">
            <div className="ret-rep-date-group">
              <div className="ret-rep-date-field">
                <label>From Date:</label>
                <input
                  type="date"
                  value={tempFromDate}
                  onChange={(e) => setTempFromDate(e.target.value)}
                  className="ret-rep-date-input"
                />
              </div>
              <div className="ret-rep-date-field">
                <label>To Date:</label>
                <input
                  type="date"
                  value={tempToDate}
                  onChange={(e) => setTempToDate(e.target.value)}
                  className="ret-rep-date-input"
                />
              </div>
              
              {/* Apply Date Filter Button */}
              <button
                className="ret-rep-apply-date-btn"
                onClick={applyDateFilterHandler}
              >
                <FaFilter /> Add Filter
              </button>
              
              {/* Clear Dates Button - ONLY SHOWS AFTER FILTER IS APPLIED */}
              {applyDateFilter && fromDate && toDate && (
                <button
                  className="ret-rep-clear-dates-btn"
                  onClick={clearDatesOnly}
                  title="Clear date filters"
                >
                  Clear Dates
                </button>
              )}
              
              <button
                className="ret-rep-generate-btn"
                onClick={() => setShowGenerateModal(true)}
              >
                <FaFilePdf className="ret-rep-generate-icon" />
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Clear All Filters button - appears when search is active OR date filter is applied */}
        {(searchTerm || (applyDateFilter && fromDate && toDate)) && (
          <div className="ret-rep-clear-all-wrapper">
            <button className="ret-rep-clear-all-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Show active filter badges */}
        <div className="ret-rep-active-filters">
          {applyDateFilter && fromDate && toDate && (
            <span className="ret-rep-filter-badge">
              Date Range: {fromDate} to {toDate}
            </span>
          )}
          {searchTerm && (
            <span className="ret-rep-filter-badge">
              Search: {searchTerm}
              <button 
                className="ret-rep-filter-badge-remove"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            </span>
          )}
        </div>

        {loading ? (
          <div className="ret-rep-loading">Loading retailers data...</div>
        ) : filteredRetailerData.length > 0 ? (
          <ReusableTable
            title=""
            data={filteredRetailerData}
            columns={topRetailersColumns}
            initialEntriesPerPage={10}
            searchPlaceholder=""
            showEntries={true}
            showSearch={false}
            showPagination={true}
          />
        ) : searchTerm ? (
          <div className="ret-rep-no-data">
            No retailers found for "{searchTerm}". Try a different search term.
          </div>
        ) : (
          <div className="ret-rep-no-data">No retailer data available.</div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="ret-rep-modal">
          <div className="ret-rep-modal-content">
            <button
              className="ret-rep-close-modal"
              onClick={() => setShowGenerateModal(false)}
            >
              ✖
            </button>
            <div className="ret-rep-modal-title">Generate Retailer Report</div>
            <div className="ret-rep-modal-subtitle">
              {applyDateFilter && fromDate && toDate ? `Period: ${fromDate} to ${toDate}` : 'All retailer data'}
            </div>

            <div className="ret-rep-format-options">
              <label className={`ret-rep-format-option ${reportFormat === 'pdf' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={reportFormat === "pdf"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFilePdf className="ret-rep-format-icon" />
                <span>PDF Format</span>
              </label>
              <label className={`ret-rep-format-option ${reportFormat === 'excel' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={reportFormat === "excel"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFileExcel className="ret-rep-format-icon" />
                <span>Excel Format</span>
              </label>
            </div>

            <button 
              className="ret-rep-generate-modal-btn"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
            
            <div className="ret-rep-modal-footer">
              <p>Report will include all filtered data and statistics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RetailerReports;