// SalesReportindetail.js - Fixed version
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { FaSearch, FaFilePdf, FaFileExcel, FaArrowLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import * as XLSX from 'xlsx';
import "./SalesReportindetail.css";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';

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

const formatDateForAPI = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
// ========== END HELPER FUNCTIONS ==========

const SalesReportdetail = () => {
  const { productId } = useParams();
  const location = useLocation();
  const { productName, productId: stateProductId } = location.state || {};
  
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalProducts: 0,
    avgValue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  
  // Date filter states
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [tempFromDate, setTempFromDate] = useState(getFirstDayOfCurrentMonth());
  const [tempToDate, setTempToDate] = useState(getCurrentDate());
  const [applyDateFilter, setApplyDateFilter] = useState(false); // ✅ Changed to false initially
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Report modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Chart data states
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);

  // Fetch data from API - filtered by product ID
  const fetchSalesData = async () => {
    setLoading(true);
    setError("");
    try {
      const id = productId || stateProductId;
      
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${baseurl}/Salesreportdetail/${id}`);
      
      if (response.data.success) {
        setVoucherDetails(response.data.data);
        setFilteredData(response.data.data);
        processData(response.data.data);
        
        if (response.data.data.length > 0) {
          setProductInfo({
            id: id,
            name: response.data.data[0].product_name || productName,
            totalQuantity: response.data.data.reduce((sum, item) => sum + parseFloat(item.quantity), 0),
            totalSales: response.data.data.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0)
          });
        } else {
          setProductInfo({
            id: id,
            name: productName || `Product ${id}`,
            totalQuantity: 0,
            totalSales: 0
          });
        }
      } else {
        setError("Failed to fetch sales data for this product");
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Error fetching sales data for this product");
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    const totalSales = data.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
    const totalTransactions = new Set(data.map(item => item.VoucherID)).size;
    const totalProducts = data.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    const avgValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    setSummary({
      totalSales: totalSales,
      totalTransactions: totalTransactions,
      totalProducts: totalProducts,
      avgValue: avgValue
    });

    const monthlyMap = {};
    data.forEach(item => {
      if (item.Date) {
        const date = new Date(item.Date);
        const monthYear = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
        const amount = parseFloat(item.price) * parseFloat(item.quantity);
        
        if (!monthlyMap[monthYear]) {
          monthlyMap[monthYear] = 0;
        }
        monthlyMap[monthYear] += amount;
      }
    });

    const monthlyArray = Object.keys(monthlyMap).map(key => ({
      month: key,
      sales: monthlyMap[key]
    })).slice(-6);

    setMonthlySalesData(monthlyArray);

    const productMap = {};
    data.forEach(item => {
      if (item.product_name) {
        const amount = parseFloat(item.price) * parseFloat(item.quantity);
        if (!productMap[item.product_name]) {
          productMap[item.product_name] = 0;
        }
        productMap[item.product_name] += amount;
      }
    });

    const topProducts = Object.keys(productMap)
      .map(name => ({ name, sales: productMap[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    setTopProductsData(topProducts);
  };

  useEffect(() => {
    if (!voucherDetails.length) {
      setFilteredData([]);
      return;
    }

    let filtered = [...voucherDetails];

    // ✅ Only apply date filter if applyDateFilter is true
    if (applyDateFilter && fromDate && toDate) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      filtered = filtered.filter((item) => {
        if (!item.Date) return false;
        const itemDate = new Date(item.Date);
        return itemDate >= fromDateObj && itemDate <= toDateObj;
      });
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          (item.VchNo && String(item.VchNo).toLowerCase().includes(searchLower)) ||
          (item.PartyName && item.PartyName.toLowerCase().includes(searchLower)) ||
          (item.product_name && item.product_name.toLowerCase().includes(searchLower)) ||
          (item.TransactionType && item.TransactionType.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredData(filtered);
    processData(filtered);
  }, [voucherDetails, fromDate, toDate, searchTerm, applyDateFilter]);

  useEffect(() => {
    fetchSalesData();
  }, [productId, stateProductId]);

  const applyDateFilterHandler = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setApplyDateFilter(true); // ✅ Enable filter when button is clicked
  };

  const clearFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(false); // ✅ Disable filter when clearing
    setSearchTerm("");
  };

  const clearDateFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(false); // ✅ Disable filter when clearing dates
  };

const generateExcelReport = () => {
  try {
    const totalAmount = filteredData.reduce((sum, item) => {
      return sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0));
    }, 0);

    const totalQuantity = filteredData.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0);
    }, 0);
    
    const totalRatePerUnit = filteredData.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);
    
    const excelData = [
      ...filteredData.map((item, index) => ({
        'S.No': index + 1,
        'Party Name': item.PartyName || '-',
        'Date': item.Date ? new Date(item.Date).toLocaleDateString('en-IN') : '-',
        'Invoice No': item.VchNo || '-',
        'Rate per unit': parseFloat(item.price) || 0,
        'Quantity': parseFloat(item.quantity) || 0,
        'Amount': (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0),
      })),
      // Add totals row
      {
        'S.No': '',
        'Party Name': '',
        'Date': '',
        'Invoice No': '',
        'Rate per unit': "TOTAL",
        'Quantity': totalQuantity,
        'Amount': totalAmount,
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns - UPDATED ORDER
    const colWidths = [
      { wch: 8 },   // S.No
      { wch: 25 },  // Party Name
      { wch: 12 },  // Date
      { wch: 15 },  // Invoice No
      { wch: 15 },  // Rate per unit
      { wch: 12 },  // Quantity
      { wch: 15 },  // Amount
    ];
    worksheet['!cols'] = colWidths;
    
    // Add black background to TOTAL row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:G1');
    const totalRowIndex = excelData.length - 1; // Last row index
    
    // Apply black background and white text to the TOTAL row cells
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: C });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        fill: {
          fgColor: { rgb: "000000" }  // Black background
        },
        font: {
          bold: true,
          color: { rgb: "FFFFFF" }  // White text
        }
      };
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Details');
    
    const fileName = `${productInfo?.name || 'Product'}_Sales_Report_${applyDateFilter && fromDate ? fromDate : 'ALL'}_to_${applyDateFilter && toDate ? toDate : 'ALL'}_${new Date().toISOString().slice(0, 19)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    alert('✅ Excel report generated successfully!');
    return true;
  } catch (error) {
    console.error('Excel generation error:', error);
    alert(`❌ Failed to generate Excel report: ${error.message}`);
    return false;
  }
};
  // Generate PDF Report
  const generatePDFReport = async () => {
    try {
      const { generateSalesReportPDF } = await import('./Salesreportdetailpdf');
      
      const reportData = filteredData.map(item => ({
        ...item,
        product: item.product_name || item.product || '-',
        price: parseFloat(item.price) || 0,
        quantity: parseFloat(item.quantity) || 0,
        date: item.Date ? new Date(item.Date).toLocaleDateString('en-IN') : '-'
      }));
      
      const pdfBlob = await generateSalesReportPDF(
        reportData,
        summary,
        applyDateFilter && fromDate ? fromDate : null,
        applyDateFilter && toDate ? toDate : null,
        'product',
        productInfo?.name
      );
      
      const fileName = `${productInfo?.name || 'Product'}_Sales_Report_${applyDateFilter && fromDate ? fromDate : 'ALL'}_to_${applyDateFilter && toDate ? toDate : 'ALL'}_${new Date().toISOString().slice(0, 19)}.pdf`;
      
      const blob = new Blob([pdfBlob], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      
      alert('✅ PDF report generated successfully!');
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`❌ Failed to generate PDF report: ${error.message}`);
      return false;
    }
  };

  // Generate report handler
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      let success = false;
      
      if (reportFormat === 'pdf') {
        success = await generatePDFReport();
      } else if (reportFormat === 'excel') {
        success = generateExcelReport();
      }
      
      if (success) {
        setShowGenerateModal(false);
      }
    } catch (e) {
      console.error("Download error:", e);
      alert(`❌ Failed to generate report: ${e.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const tableData = filteredData.map((item, index) => ({
    sl_no: index + 1,
    VoucherID: item.VoucherID,
    VchNo: item.VchNo,
    TransactionType: item.TransactionType,
    PartyName: item.PartyName,
    Date: item.Date ? new Date(item.Date).toLocaleDateString('en-IN') : '-',
    product: item.product_name || item.product,
    quantity: item.quantity,
    price: formatCurrency(item.price),
     priceValue: parseFloat(item.price) || 0, 
    total: formatCurrency(parseFloat(item.price) * parseFloat(item.quantity))
  }));

// const totalRatePerUnit = filteredData.reduce((sum, item) => {
//   return sum + (parseFloat(item.price) || 0);
// }, 0);
  const columns = [
    { key: "sl_no", title: "S.No", style: { textAlign: "center" } },
    { key: "PartyName", title: "Party Name", style: { textAlign: "center" } },
    { key: "Date", title: "Date", style: { textAlign: "center" } },
    { key: "VchNo", title: "Invoice No", style: { textAlign: "center" } },
        { key: "price", title: "Rate per unit", style: { textAlign: "center" } },

    { key: "quantity", title: "Quantity", style: { textAlign: "center" } },
        { key: "total", title: "Amount", style: { textAlign: "center" } },

  ];

  if (loading) {
    return <div className="sales-report-loading">Loading Product Sales Data...</div>;
  }

  return (
    <div>
      <AdminHeader isCollapsed={isCollapsed} />
      <div className={`p-admin-main ${isCollapsed ? 'p-sidebar-collapsed' : ''}`}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="sales-report">
          <div className="sales-product-header">
            <Link to="/reports" className="sales-back-btn">
              <FaArrowLeft /> Back
            </Link>
            <h2 className="sales-product-title">
              {productInfo?.name || productName || 'Product'}
            </h2>
          </div>

          <div className="sales-stats-grid">
            <div className="sales-stat-card">
              <h3>Total Sales</h3>
              <div className="sales-stat-value">{formatCurrency(summary.totalSales)}</div>
              <p className="sales-stat-period">
                {applyDateFilter && fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time'}
              </p>
            </div>
            
            <div className="sales-stat-card">
              <h3>Total Transactions</h3>
              <div className="sales-stat-value">{summary.totalTransactions}</div>
            </div>
            
            <div className="sales-stat-card">
              <h3>Total Products Sold</h3>
              <div className="sales-stat-value">{summary.totalProducts}</div>
              <p className="sales-stat-period">Quantity</p>
            </div>
            
            <div className="sales-stat-card">
              <h3>Average Transaction Value</h3>
              <div className="sales-stat-value">{formatCurrency(summary.avgValue)}</div>
              <p className="sales-stat-period">Per Voucher</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="sales-filter-controls-section">
            <div className="sales-filters-row">
              <div className="sales-search-left">
                <div className="sales-search-container">
                  <div className="sales-search-input-wrapper">
                    <FaSearch className="sales-search-icon" />
                    <input
                      type="text"
                      placeholder="Search by Invoice No, Party, Product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="sales-search-input"
                    />
                    {searchTerm && (
                      <button className="sales-clear-search-btn" onClick={() => setSearchTerm("")}>
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="sales-date-controls-right">
                <div className="sales-date-filters-group">
                  <div className="sales-date-input-wrapper">
                    <label>From Date</label>
                    <input
                      type="date"
                      value={tempFromDate}
                      onChange={(e) => setTempFromDate(e.target.value)}
                      className="sales-date-input"
                    />
                  </div>
                  
                  <div className="sales-date-input-wrapper">
                    <label>To Date</label>
                    <input
                      type="date"
                      value={tempToDate}
                      onChange={(e) => setTempToDate(e.target.value)}
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
                  
                  <button className="sales-clear-date-btn" onClick={clearDateFilters}>
                    Clear Dates
                  </button>
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

          {/* Data Table */}
          <div className="sales-voucher-table-section">
           {/* Data Table Section */}
<div className="sales-voucher-table-section">
  <div className="sales-table-section">
    {error ? (
      <div className="sales-error-message">{error}</div>
    ) : (
      <>
        <ReusableTable
          title={`Sales Transactions for ${productInfo?.name || 'Product'}`}
          data={tableData}
          columns={columns}
          initialEntriesPerPage={10}
          showEntries={true}
          showSearch={false}
          showPagination={true}
        />
        
     <div className="sales-table-footer">
  <div className="sales-footer-item">
    <span className="footer-label">Total Quantity:</span>
    <span className="footer-value">{summary.totalProducts}</span>
  </div>
  <div className="sales-footer-item">
    <span className="footer-label">Total Amount:</span>
    <span className="footer-value">{formatCurrency(summary.totalSales)}</span>
  </div>
</div>
      </>
    )}
  </div>
</div>
          </div>

          {showGenerateModal && (
            <div className="sales-generate-report-modal">
              <div className="sales-modal-content">
                <button className="sales-close-modal-btn" onClick={() => setShowGenerateModal(false)}>
                  ✖
                </button>
                <div className="sales-modal-title">Generate Product Sales Report</div>
                <div className="sales-modal-subtitle">
                  {productInfo?.name && `Product: ${productInfo.name}`}
                  {applyDateFilter && fromDate && toDate && ` | Period: ${fromDate} to ${toDate}`}
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
                  {generatingReport ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReportdetail;