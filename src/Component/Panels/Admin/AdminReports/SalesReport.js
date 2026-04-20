import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Link } from "react-router-dom";
import { FaChartLine, FaSearch, FaFilePdf, FaFileExcel, FaFilter } from "react-icons/fa";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./SalesReport.css";

// ========== HELPER FUNCTIONS ==========
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
// ========== END HELPER FUNCTIONS ==========

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    monthlyGrowth: 0,
    kachaSales: 0,
    pakkaSales: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for filtering
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [tempFromDate, setTempFromDate] = useState(getFirstDayOfCurrentMonth());
  const [tempToDate, setTempToDate] = useState(getCurrentDate());
  const [applyDateFilter, setApplyDateFilter] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState("pakka"); // Changed to "pakka" by default
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);

  // Filtered data
  const [filteredVoucherData, setFilteredVoucherData] = useState([]);

  // Set initial dates on component mount
  useEffect(() => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setFromDate(firstDay);
    setToDate(currentDate);
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setApplyDateFilter(true);
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${baseurl}/api/reports/sales-report`);
      if (response.data.success) {
        const data = response.data.data;
        // Filter to only Pakka sales initially
        const pakkaOnlyData = data.filter(item => item.sales_type === "pakka");
        setVoucherDetails(pakkaOnlyData);
        setFilteredVoucherData(pakkaOnlyData);
        processData(pakkaOnlyData);
      } else {
        setError("Failed to fetch sales data");
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Error fetching sales data");
    } finally {
      setLoading(false);
    }
  };

  // Determine if a record is Kacha - Use sales_type from backend
  const isKachaRecord = (item) => {
    return item.sales_type === "kacha";
  };

  // Determine if a record is Pakka - Use sales_type from backend
  const isPakkaRecord = (item) => {
    return item.sales_type === "pakka";
  };

  // Process data for charts and summary
  const processData = (data) => {
    // Calculate summary with transaction type filtering
    const totals = data.reduce((acc, item) => {
      const total = parseFloat(item.total) || 0;
      
      acc.totalSales += total;
      
      if (isKachaRecord(item)) {
        acc.kachaSales += total;
      } else if (isPakkaRecord(item)) {
        acc.pakkaSales += total;
      }
      
      return acc;
    }, { totalSales: 0, kachaSales: 0, pakkaSales: 0 });

    // Calculate monthly growth based on invoice_date
    const monthlyGrowth = calculateMonthlyGrowth(data);
    
    setSummary({
      totalSales: totals.totalSales,
      monthlyGrowth: monthlyGrowth,
      kachaSales: totals.kachaSales,
      pakkaSales: totals.pakkaSales
    });

    // Prepare monthly data for chart
    const monthlyMap = {};
    data.forEach(item => {
      if (item.invoice_date) {
        try {
          const dateParts = item.invoice_date.split('/');
          if (dateParts.length === 3) {
            const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            const month = date.toLocaleString('default', { month: 'short' }) + ' ' + dateParts[2].slice(-2);
            const total = parseFloat(item.total) || 0;
            
            if (!monthlyMap[month]) {
              monthlyMap[month] = 0;
            }
            monthlyMap[month] += total;
          }
        } catch (err) {
          console.error("Error parsing date:", item.invoice_date);
        }
      }
    });

    const monthlyArray = Object.keys(monthlyMap).map(key => ({
      month: key,
      sales: monthlyMap[key]
    })).sort((a, b) => {
      const getMonthIndex = (monthStr) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [month, year] = monthStr.split(' ');
        return parseInt(year) * 12 + months.indexOf(month);
      };
      return getMonthIndex(a.month) - getMonthIndex(b.month);
    }).slice(-6);

    setSalesData(monthlyArray);

    // Prepare staff data
    const staffMap = {};
    data.forEach(item => {
      const staffName = item.assigned_staff || "Unassigned";
      const total = parseFloat(item.total) || 0;
      
      if (!staffMap[staffName]) {
        staffMap[staffName] = 0;
      }
      staffMap[staffName] += total;
    });

    const staffArray = Object.keys(staffMap)
      .map(name => ({ name, sales: staffMap[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    setStaffData(staffArray);
  };

  // Calculate monthly growth
  const calculateMonthlyGrowth = (data) => {
    if (data.length === 0) return 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentMonthSales = 0;
    let previousMonthSales = 0;

    data.forEach(item => {
      if (item.invoice_date) {
        try {
          const dateParts = item.invoice_date.split('/');
          if (dateParts.length === 3) {
            const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            const month = date.getMonth();
            const year = date.getFullYear();
            const total = parseFloat(item.total) || 0;

            if (month === currentMonth && year === currentYear) {
              currentMonthSales += total;
            } else if (month === previousMonth && year === previousYear) {
              previousMonthSales += total;
            }
          }
        } catch (err) {
          console.error("Error parsing date for growth calculation:", item.invoice_date);
        }
      }
    });

    if (previousMonthSales === 0) {
      return currentMonthSales > 0 ? 100 : 0;
    }

    return (((currentMonthSales - previousMonthSales) / previousMonthSales) * 100).toFixed(1);
  };

  // Handle temporary date changes (does NOT apply filter)
  const handleTempFromDateChange = (e) => {
    setTempFromDate(e.target.value);
  };

  const handleTempToDateChange = (e) => {
    setTempToDate(e.target.value);
  };

  // Apply date filter - only when button is clicked
  const applyDateFilterHandler = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setApplyDateFilter(true);
  };

  // Filter data based on selected dates, search term, and transaction type
  useEffect(() => {
    if (!voucherDetails.length) {
      setFilteredVoucherData([]);
      return;
    }

    let filtered = [...voucherDetails];

    // Always filter to only Pakka sales (remove Kacha sales)
    filtered = filtered.filter((item) => isPakkaRecord(item));

    if (applyDateFilter && fromDate && toDate) {
      filtered = filtered.filter((item) => {
        const itemDate = item.invoice_date;
        if (!itemDate) return false;

        try {
          const dateParts = itemDate.split('/');
          if (dateParts.length === 3) {
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            const itemDateStr = `${year}-${month}-${day}`;
            return itemDateStr >= fromDate && itemDateStr <= toDate;
          }
        } catch (err) {
          console.error("Error parsing date for filter:", itemDate);
          return false;
        }
        return false; 
      });
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          (item.product && item.product.toLowerCase().includes(searchLower)) ||
          (item.retailer && item.retailer.toLowerCase().includes(searchLower)) ||
          (item.assigned_staff && item.assigned_staff.toLowerCase().includes(searchLower)) ||
          (item.staff_address && item.staff_address.toLowerCase().includes(searchLower)) ||
          (item.invoice_numbers && String(item.invoice_numbers).toLowerCase().includes(searchLower)) ||
          (item.batch && String(item.batch).toLowerCase().includes(searchLower)) ||
          (item.total && String(item.total).toLowerCase().includes(searchLower))
        );
      });
    }

    // Update filtered data
    setFilteredVoucherData(filtered);
    
    // Recalculate summary for filtered data
    if (filtered.length > 0) {
      processData(filtered);
    } else {
      // If no data, reset summary
      setSummary({
        totalSales: 0,
        monthlyGrowth: 0,
        kachaSales: 0,
        pakkaSales: 0
      });
      setSalesData([]);
      setStaffData([]);
    }
  }, [voucherDetails, fromDate, toDate, searchTerm, applyDateFilter]);

  // Initial fetch
  useEffect(() => {
    fetchSalesData();
  }, []);

  // Generate report function
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      let pdfBlob;
      
      if (reportFormat === 'pdf') {
        const { generateSalesReportPDF } = await import('./SalesReportpdf');
        
        const pdfData = filteredVoucherData.map(item => ({
          ...item,
          product: item.product,
          quantity: item.quantity,
          Subtotal: item.Subtotal,
          total: item.total,
          retailer: item.retailer,
          assigned_staff: item.assigned_staff,
          invoice_date: item.invoice_date,
          TransactionType: 'Pakka',
          sales_type: item.sales_type
        }));
        
        pdfBlob = await generateSalesReportPDF(
          pdfData,
          summary,
          applyDateFilter && fromDate ? fromDate : null,
          applyDateFilter && toDate ? toDate : null,
          'pakka'
        );
      } else {
        const res = await axios.post(
          `${baseurl}/api/reports/sales-report/download`,
          { 
            fromDate: applyDateFilter && fromDate ? fromDate : null, 
            toDate: applyDateFilter && toDate ? toDate : null, 
            format: 'excel',
            transactionType: 'pakka' // Only Pakka sales
          },
          { responseType: "blob" }
        );
        
        pdfBlob = res.data;
      }

      const name = `Pakka_Sales_Report_${(applyDateFilter && fromDate) || "ALL"}_${(applyDateFilter && toDate) || "ALL"}_${new Date().toISOString().slice(0, 19)}.${
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

      alert(`✅ Successfully generated Pakka Sales ${reportFormat.toUpperCase()} report`);
      setShowGenerateModal(false);
    } catch (e) {
      console.error("❌ Download error:", e);
      alert(`❌ Failed to generate report: ${e.message}`);
      setError("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(true);
    setSearchTerm("");
    setTransactionType("pakka"); // Keep as pakka
  };

  // Clear date filters only
  const clearDateFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const dateParts = dateString.split('/');
      if (dateParts.length === 3) {
        const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        return date.toLocaleDateString('en-IN');
      }
    } catch (err) {
      console.error("Error formatting date:", dateString);
    }
    return dateString;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Process voucher details data for table
  const processedVoucherDetails = filteredVoucherData.map((item, index) => ({
    ...item,
    index: index + 1,
    invoice_date: formatDate(item.invoice_date),
    price: formatCurrency(item.price),
    discount: formatCurrency(item.discount),
    gst: formatCurrency(item.gst),
    cgst: formatCurrency(item.cgst),
    sgst: formatCurrency(item.sgst),
    igst: formatCurrency(item.igst),
    cess: formatCurrency(item.cess),
    total: formatCurrency(item.total),
    Subtotal: formatCurrency(item.Subtotal),
    assigned_staff: item.assigned_staff || "Not Assigned",
    staff_address: item.staff_address || "Not Available",
    order_mode: item.order_mode || "-",
    retailer: item.retailer || "N/A",
    TransactionType: "Pakka"
  }));

  const staffColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  if (loading) {
    return <div className="sales-report-loading">Loading Pakka Sales data...</div>;
  }

  return (
    <div className="sales-report">
      <div className="sales-stats-grid">
        <div className="sales-stat-card">
          <h3>Total Pakka Sales</h3>
          <div className="sales-stat-value">{formatCurrency(summary.pakkaSales)}</div>
          <p className="sales-stat-period">
            {applyDateFilter && fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time'}
          </p>
        </div>
        
        <div className="sales-stat-card">
          <h3>Monthly Growth</h3>
          <div className={`sales-stat-value ${summary.monthlyGrowth >= 0 ? 'sales-positive' : 'sales-negative'}`}>
            {summary.monthlyGrowth >= 0 ? '+' : ''}{summary.monthlyGrowth}%
          </div>
          <p className="sales-stat-period">Based on invoice dates</p>
        </div>
        
        <div className="sales-stat-card">
          <h3>Total Transactions</h3>
          <div className="sales-stat-value">{filteredVoucherData.length}</div>
          <p className="sales-stat-period">Pakka Sales Records</p>
        </div>
        
        <div className="sales-stat-card">
          <h3>Average Sale Value</h3>
          <div className="sales-stat-value">
            {formatCurrency(filteredVoucherData.length > 0 ? summary.pakkaSales / filteredVoucherData.length : 0)}
          </div>
          <p className="sales-stat-period">Per Transaction</p>
        </div>
      </div>

      {/* Filter Controls Section */}
      <div className="sales-filter-controls-section">
        {/* <div className="sales-filter-card">
          <h3>Filter Options</h3>
          <div className="sales-filter-controls">
            {(applyDateFilter || searchTerm) && (
              <button
                className="sales-clear-all-btn"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div> */}

        {/* Search and Date Filters */}
        <div className="sales-filters-row">
          <div className="sales-search-left">
            <div className="sales-search-container">
              <div className="sales-search-input-wrapper">
                <FaSearch className="sales-search-icon" />
                <input
                  type="text"
                  placeholder="Search Product, Retailer, Staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="sales-search-input"
                />
                {searchTerm && (
                  <button 
                    className="sales-clear-search-btn" 
                    onClick={() => setSearchTerm("")}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="sales-date-controls-right">
            <div className="sales-date-filters-group">
              <div className="sales-date-input-wrapper">
                <label htmlFor="sales-from-date">From Date</label>
                <input
                  id="sales-from-date"
                  type="date"
                  value={tempFromDate}
                  onChange={handleTempFromDateChange}
                  className="sales-date-input"
                />
              </div>
              
              <div className="sales-date-input-wrapper">
                <label htmlFor="sales-to-date">To Date</label>
                <input
                  id="sales-to-date"
                  type="date"
                  value={tempToDate}
                  onChange={handleTempToDateChange}
                  className="sales-date-input"
                />
              </div>
              
              <button
                className="sales-apply-date-btn"
                onClick={applyDateFilterHandler}
                disabled={!tempFromDate || !tempToDate}
              >
                Apply Date Filter
              </button>
              
              {(tempFromDate !== getFirstDayOfCurrentMonth() || tempToDate !== getCurrentDate()) && (
                <button
                  className="sales-clear-date-btn"
                  onClick={clearDateFilters}
                  title="Reset to current month"
                >
                  Clear Dates
                </button>
              )}
            </div>
            
            <button
              className="sales-generate-report-btn"
              onClick={() => setShowGenerateModal(true)}
            >
              <FaFilePdf className="sales-btn-icon" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Table Section */}
      <div className="sales-voucher-table-section">
        <div className="sales-table-section">
          {error ? (
            <div className="sales-error-message">{error}</div>
          ) : (
            <ReusableTable
              title="Pakka Sales Transactions"
              data={processedVoucherDetails}
              columns={voucherDetailsColumns}
              initialEntriesPerPage={10}
              searchPlaceholder=""
              showEntries={true}
              showSearch={false}
              showPagination={true}
            />
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="sales-generate-report-modal">
          <div className="sales-modal-content">
            <button
              className="sales-close-modal-btn"
              onClick={() => setShowGenerateModal(false)}
            >
              ✖
            </button>
            <div className="sales-modal-title">Generate Pakka Sales Report</div>
            <div className="sales-modal-subtitle">
              {applyDateFilter && fromDate && toDate ? `Period: ${fromDate} to ${toDate}` : 'All Pakka sales data'}
            </div>

            <div className="sales-format-options">
              <label className={`sales-format-option ${reportFormat === 'pdf' ? 'sales-selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={reportFormat === "pdf"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFilePdf className="sales-format-icon" />
                <span>PDF Format</span>
              </label>
              <label className={`sales-format-option ${reportFormat === 'excel' ? 'sales-selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={reportFormat === "excel"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFileExcel className="sales-format-icon" />
                <span>Excel Format</span>
              </label>
            </div>

            <button 
              className="sales-generate-btn"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? 'Generating...' : 'Generate Pakka Sales Report'}
            </button>
            
            <div className="sales-modal-footer">
              <p>Report will include all Pakka sales data and statistics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Voucher details columns
const voucherDetailsColumns = [
  { 
    key: "sl_no",
    title: "S.No",
    style: { textAlign: "center" },
    render: (value, record, index) => index + 1
  },
  { 
    key: "product", 
    title: "Product", 
    style: { textAlign: "center" },
    render: (value, record) => (
      <Link 
        to={`/salesreportdetail/${record.product_id}`} 
        state={{ productName: record.product, productId: record.product_id }}
        style={{ color: '#1890ff', cursor: 'pointer', textDecoration: 'none' }}
      >
        {value}
      </Link>
    )
  },
  { 
    key: "quantity", 
    title: "Quantity", 
    style: { textAlign: "center" } 
  },
  { 
    key: "Subtotal", 
    title: "Taxable Amount", 
    style: { textAlign: "center" } 
  },
  { 
    key: "total", 
    title: "Total Amount", 
    style: { textAlign: "center" } 
  },
  { 
    key: "retailer", 
    title: "Retailer", 
    style: { textAlign: "center" } 
  },
  { 
    key: "assigned_staff", 
    title: "Staff", 
    style: { textAlign: "center" } 
  },
  {
    key: "invoice_date",
    title: "Date",
    style: { textAlign: "center" },
    render: (value) => value || "-"
  },
];

export default SalesReport;