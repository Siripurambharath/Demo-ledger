import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { FaClipboard, FaCalendarAlt, FaCheckSquare, FaTimesCircle, FaMoneyBillAlt, FaSearch, FaFilePdf, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./ExpenseReports.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { generateExpenseReportPDF } from './ExpenseReportPdf';


const ExpenseReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [expenseData, setExpenseData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    approvedAmount: 0,
    rejectedClaims: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  
  // New state for date filtering and report generation
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);

  // Columns for the expense table
  const expenseTableColumns = [
    { 
      key: "index", 
      title: "S.No", 
      style: { width: "80px", textAlign: "center" },
      render: (value, record, index) => <span style={{ fontWeight: "bold" }}>{index + 1}</span>
    },
    { 
      key: "expense_date", 
      title: "Date", 
      style: { width: "120px", textAlign: "center" },
      render: (value) => value && value !== 'N/A' ? <span style={{ color: "#6b7280" }}>{value}</span> : 'N/A'
    },
    { 
      key: "staff", 
      title: "Staff", 
      style: { width: "180px", textAlign: "center" },
      render: (value) => <span style={{ fontWeight: "500" }}>{value || "N/A"}</span>
    },
    { 
      key: "category", 
      title: "Category", 
      style: { width: "150px", textAlign: "center" },
      render: (value) => <span style={{ color: "#4b5563" }}>{value || "N/A"}</span>
    },
    { 
      key: "amount", 
      title: "Amount", 
      style: { width: "150px", textAlign: "center" },
      render: (value) => <span style={{ fontWeight: "600", color: "#059669" }}>{formatCurrency(value)}</span>
    },
    { 
      key: "status", 
      title: "Status", 
      style: { width: "120px", textAlign: "center" },
      render: (value) => (
        <span className={`status-badge ${value?.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    { 
      key: "payment_status", 
      title: "Payment Status", 
      style: { width: "150px", textAlign: "center" },
      render: (value) => <span style={{ color: "#4b5563" }}>{value || "N/A"}</span>
    },
  ];

  // Fetch expense data with date filters
  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }
      
      const response = await axios.get(`${baseurl}/api/reports/expense-report`, { params });
      
      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setExpenseData(data);
        processDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchExpenseData();
  }, []);

  // Fetch when date changes
  useEffect(() => {
    fetchExpenseData();
  }, [fromDate, toDate]);

  // Process data and handle search
  const processedExpenseData = useMemo(() => {
    let processed = expenseData.map((item, index) => {
      const rawDate =
        item.date ||
        item.expense_date ||
        item.created_at ||
        item.expenseDate ||
        null;

      let formattedDate = "N/A";

      if (rawDate) {
        const dateObj = new Date(rawDate);
        if (!isNaN(dateObj)) {
          formattedDate = dateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
      }

      return {
        ...item,
        id: item.id || index + 1,
        expense_date: formattedDate,
        amount: parseFloat(item.amount) || 0,
        staff: item.staff || "Unassigned",
        category: item.category || "Uncategorized",
        status: item.status || "Pending"
      };
    });

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      processed = processed.filter(item => 
        (item.staff && item.staff.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower)) ||
        (item.status && item.status.toLowerCase().includes(searchLower)) ||
        (item.amount && item.amount.toString().includes(searchTerm)) ||
        (item.expense_date && item.expense_date.toLowerCase().includes(searchLower))
      );
    }

    setFilteredData(processed);
    return processed;
  }, [expenseData, searchTerm]);

  // Process data for dashboard
  const processDashboardData = (data) => {
    if (!data || data.length === 0) {
      setDashboardStats({
        totalExpenses: 0,
        pendingApprovals: 0,
        approvedAmount: 0,
        rejectedClaims: 0
      });
      setCategoryData([]);
      setStaffData([]);
      return;
    }

    let totalExpenses = 0;
    let pendingApprovals = 0;
    let approvedAmount = 0;
    let rejectedClaims = 0;

    const categoryMap = new Map();
    const staffMap = new Map();

    data.forEach((item) => {
      const amount = parseFloat(item.amount) || 0;
      const status = (item.status || "").toLowerCase();
      const category = item.category || "Uncategorized";
      const staff = item.staff || "Unassigned";

      totalExpenses += amount;

      if (status === "pending") pendingApprovals++;
      else if (status === "approved") approvedAmount += amount;
      else if (status === "rejected") rejectedClaims++;

      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
      staffMap.set(staff, (staffMap.get(staff) || 0) + amount);
    });

    setDashboardStats({ totalExpenses, pendingApprovals, approvedAmount, rejectedClaims });

    const categoryArray = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: getCategoryColor(name)
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryData(categoryArray);

    const staffArray = Array.from(staffMap.entries())
      .map(([name, expense]) => ({
        name: name.length > 15 ? name.substring(0, 12) + "..." : name,
        fullName: name,
        expense: Math.round(expense)
      }))
      .sort((a, b) => b.expense - a.expense)
      .slice(0, 8);

    setStaffData(staffArray);
  };

const handleGenerateReport = async () => {
  setGeneratingReport(true);
  try {
    const pdfData = filteredData.map(item => ({
      expense_date: item.expense_date,
      staff: item.staff,
      category: item.category,
      amount: item.amount,
      status: item.status,
      payment_status: item.payment_status
    }));

    const pdfBlob = await generateExpenseReportPDF(
      pdfData,
      dashboardStats,
      categoryData,
      staffData,
      fromDate,
      toDate
    );

    const fileName = `Expense_Report_${fromDate || "ALL"}_${toDate || "ALL"}.pdf`;
    
    const a = document.createElement("a");
    a.href = URL.createObjectURL(pdfBlob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    setShowGenerateModal(false);
  } catch (e) {
    console.error("❌ PDF generation error:", e);
    alert("Failed to generate PDF report");
  } finally {
    setGeneratingReport(false);
  }
};

  const getCategoryColor = (category) => {
    const colorMap = {
      "Petrol": "#4A90E2",
      "Dredi": "#27AE60",
      "Desel": "#27AE60",
      "Travel": "#F39C12",
      "Meals": "#E74C3C",
      "Communication": "#9B59B6",
      "Accommodation": "#3498DB",
      "Office Supplies": "#2ECC71",
      "Utilities": "#E67E22",
      "Maintenance": "#1ABC9C",
      "Software": "#D35400",
      "Hardware": "#16A085",
      "Training": "#8E44AD",
      "Marketing": "#2C3E50"
    };
    return colorMap[category] || getRandomColor();
  };

  const getRandomColor = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '₹0';
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].name}`}</p>
          <p className="value">{`Amount: ${formatCurrency(payload[0].value)}`}</p>
          <p className="percent">{`${((payload[0].value / dashboardStats.totalExpenses) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`Staff: ${data.fullName || data.name}`}</p>
          <p className="value">{`Expense: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="expense-report-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading expense data...</p>
      </div>
    );
  }

   const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="expense-report-dashboard">
      {/* Top Summary Cards */}
      <div className="expense-cards-grid">
        <div className="expense-stat-card">
          <div className="expense-icon-container blue">
            <FaClipboard className="expense-icon" />
          </div>
          <div className="expense-stat-content">
            <h4>Total Expenses</h4>
            <p className="expense-stat-value">{formatCurrency(dashboardStats.totalExpenses)}</p>
            <span className="expense-stat-subtext">{expenseData.length} claims</span>
            <span className="expense-stat-subtext">
              {fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time'}
            </span>
          </div>
        </div>
        
        <div className="expense-stat-card">
          <div className="expense-icon-container orange">
            <FaCalendarAlt className="expense-icon" />
          </div>
          <div className="expense-stat-content">
            <h4>Pending Approvals</h4>
            <p className="expense-stat-value orange-text">{dashboardStats.pendingApprovals}</p>
            <span className="expense-stat-subtext">Awaiting review</span>
          </div>
        </div>
        
        <div className="expense-stat-card">
          <div className="expense-icon-container green">
            <FaCheckSquare className="expense-icon" />
          </div>
          <div className="expense-stat-content">
            <h4>Approved Amount</h4>
            <p className="expense-stat-value green-text">{formatCurrency(dashboardStats.approvedAmount)}</p>
            <span className="expense-stat-subtext">
              {dashboardStats.totalExpenses > 0 
                ? `${((dashboardStats.approvedAmount / dashboardStats.totalExpenses) * 100).toFixed(1)}% of total`
                : '0% of total'
              }
            </span>
          </div>
        </div>
        
        <div className="expense-stat-card">
          <div className="expense-icon-container red">
            <FaTimesCircle className="expense-icon" />
          </div>
          <div className="expense-stat-content">
            <h4>Rejected Claims</h4>
            <p className="expense-stat-value red-text">{dashboardStats.rejectedClaims}</p>
            <span className="expense-stat-subtext">Require attention</span>
          </div>
        </div>
        
     
      </div>

      {/* Charts Section */}
      <div className="expense-charts-grid">
        {/* Pie Chart */}
        <div className="expense-chart-card">
          <div className="expense-chart-header">
            <h3>Expenses by Category</h3>
            <p className="expense-chart-subtitle">Distribution across categories</p>
          </div>
          <div className="expense-chart-container">
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
                      labelLine={true}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle"
                      formatter={(value, entry) => (
                        <span style={{ color: '#333', fontSize: '12px' }}>
                          {value}: {formatCurrency(entry.payload.value)}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="no-data-message">No category data available</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="expense-chart-card">
          <div className="expense-chart-header">
            <h3>Expenses by Staff</h3>
            <p className="expense-chart-subtitle">Top expense claims by staff members</p>
          </div>
          <div className="expense-chart-container">
            {staffData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="expense" name="Expense Amount" fill="#4F81FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message">No staff expense data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Data Table with Search and Date Filters */}
      <div className="exp_rep-table-section">
        <div className="exp_rep-table-header">
          <h3>Expense Claims Overview</h3>
          <p className="exp_rep-table-subtitle">All expense claims with search and pagination</p>
        </div>
        
        {/* Search and Date Filter Row */}
        <div className="exp_rep-filter-row">
          {/* Search on left */}
          <div className="exp_rep-search-left">
            <div className="exp_rep-search-box">
              <FaSearch className="exp_rep-search-icon" />
              <input
                type="text"
                placeholder="Search by Staff, Category, or Status..."
                className="exp_rep-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="exp_rep-clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Date filters and generate button on right */}
          <div className="exp_rep-date-right">
            <div className="exp_rep-date-group">
              <div className="exp_rep-date-field">
                <label>From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="exp_rep-date-input"
                />
              </div>
              <div className="exp_rep-date-field">
                <label>To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="exp_rep-date-input"
                />
              </div>
               {(fromDate || toDate) && (
                              <button
                                className="ret-rep-clear-filter-btn"
                                onClick={clearDateFilters}
                                title="Clear date filters"
                              >
                                <FaFilter /> Clear
                              </button>
                            )}
              <button
                className="exp_rep-generate-btn"
                onClick={() => setShowGenerateModal(true)}
              >
                <FaFilePdf className="exp_rep-generate-icon" />
                Generate
              </button>
            </div>
          </div>
        </div>
        
        <div className="exp_rep-table-wrapper">
          {processedExpenseData.length > 0 ? (
            <div className="expense-data-table-container">
              <ReusableTable
                title=""
                data={filteredData}
                columns={expenseTableColumns}
                initialEntriesPerPage={10}
                searchPlaceholder=""
                showEntries={true}
                showSearch={false}
                showPagination={true}
              />
            </div>
          ) : (
            <div className="exp_rep-no-data">
              <FaSearch className="exp_rep-no-data-icon" />
              <p>{searchTerm ? `No results found for "${searchTerm}"` : "No expense data available"}</p>
              {searchTerm && (
                <button 
                  className="exp_rep-clear-search-large"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="exp_rep-modal">
          <div className="exp_rep-modal-content">
            <button
              className="exp_rep-close-modal"
              onClick={() => setShowGenerateModal(false)}
            >
              ✖
            </button>
            <div className="exp_rep-modal-title">Generate Expense Report</div>
            <div className="exp_rep-modal-subtitle">
              {fromDate && toDate ? `Period: ${fromDate} to ${toDate}` : 'All expense data'}
            </div>

            <div className="exp_rep-format-options">
              <label className={`exp_rep-format-option ${reportFormat === 'pdf' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={reportFormat === "pdf"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <span className="exp_rep-format-label">PDF Format</span>
              </label>
              <label className={`exp_rep-format-option ${reportFormat === 'excel' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={reportFormat === "excel"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <span className="exp_rep-format-label">Excel Format</span>
              </label>
            </div>

            <button 
              className="exp_rep-generate-modal-btn"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
            
            <div className="exp_rep-modal-footer">
              <p>Report will include all filtered data and statistics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseReportDashboard;