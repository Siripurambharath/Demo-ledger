import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilePdf, FaEye } from "react-icons/fa";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { pdf } from '@react-pdf/renderer';
import StockReportPDF from './StockreportPDF';
import "./StockReport.css";

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

const StockReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [applyDateFilter, setApplyDateFilter] = useState(true); // Apply filter initially
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [qtyFilter, setQtyFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  
  // State for PDF column selection only (doesn't affect table)
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [pdfSelectedColumns, setPdfSelectedColumns] = useState([
    "itemName", "categoryName", "opQty", "currentStock", 
    "opVal", "prchQty", "prchVal", "saleQty", "saleVal", "cloBal"
  ]);

  // Temporary date states for user selection before applying
  const [tempFromDate, setTempFromDate] = useState(getFirstDayOfCurrentMonth());
  const [tempToDate, setTempToDate] = useState(getCurrentDate());

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

  const fetchCategories = async () => {
    try {
      const categoriesRes = await axios.get(`${baseurl}/categories`);
      setCategories(categoriesRes.data);
      
      const map = {};
      categoriesRes.data.forEach(category => {
        map[category.id] = category.category_name;
      });
      setCategoriesMap(map);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    setError("");
    try {
      const productsRes = await axios.get(`${baseurl}/products`);
      const products = productsRes.data;

      const stockSummary = [];

      for (const product of products) {
        try {
          const batchesRes = await axios.get(`${baseurl}/products/${product.id}/batches`);
          const batches = batchesRes.data;

          if (batches && batches.length > 0) {
            batches.forEach(batch => {
              if (batch.group_by === "Salescatalog") return;

              const currentStock = parseFloat(batch.quantity ?? 0) || 0;

              const opQty = parseFloat(batch.opening_stock || 0);
              const opVal = parseFloat(batch.purchase_price || 0) * opQty;

              const prchQty = parseFloat(batch.stock_in || 0);
              const prchVal = parseFloat(batch.purchase_price || 0) * prchQty;

              const saleQty = parseFloat(batch.stock_out || 0);
              const saleVal = parseFloat(batch.selling_price || 0) * saleQty;

              const cloBal = prchVal - saleVal;

              stockSummary.push({
                id: batch.id,
                productId: product.id,
                batchNumber: batch.batch_number,
                itemName: product.goods_name,
                categoryId: product.category_id,
                opQty,
                opVal,
                prchQty,
                prchVal,
                saleQty,
                saleVal,
                cloBal,
                currentStock,
                date: batch.opening_stock_date,
                groupBy: batch.group_by,
                productType: batch.product_type,
              });
            });
          } else {
            if (product.group_by === "Purchaseditems") {
              const opQty = parseFloat(product.opening_stock || 0);
              const opVal = parseFloat(product.purchase_price || 0) * opQty;

              stockSummary.push({
                id: product.id,
                productId: product.id,
                batchNumber: "DEFAULT",
                itemName: product.goods_name,
                categoryId: product.category_id,
                opQty,
                opVal,
                prchQty: 0,
                prchVal: 0,
                saleQty: 0,
                saleVal: 0,
                cloBal: opVal,
                currentStock: 0,
                date: product.opening_stock_date,
                groupBy: product.group_by,
                productType: product.product_type,
              });
            }
          }
        } catch (batchErr) {
          console.error(`Error fetching batches for product ${product.id}:`, batchErr);
          if (product.group_by === "Purchaseditems") {
            const opQty = parseFloat(product.opening_stock || 0);
            const opVal = parseFloat(product.purchase_price || 0) * opQty;

            stockSummary.push({
              id: product.id,
              productId: product.id,
              batchNumber: "DEFAULT",
              itemName: product.goods_name,
              categoryId: product.category_id,
              opQty,
              opVal,
              prchQty: 0,
              prchVal: 0,
              saleQty: 0,
              saleVal: 0,
              cloBal: opVal,
              currentStock: 0,
              date: product.opening_stock_date,
              groupBy: product.group_by,
              productType: product.product_type,
            });
          }
        }
      }

      setStockData(stockSummary);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return null;
    }
  };

  const formatDateForDisplay = (dateString) => {
    const fallback = () => {
      const today = new Date();
      return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    };
    if (!dateString) return fallback();
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback();
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    } catch {
      return fallback();
    }
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

  const filteredData = stockData.filter((item) => {
    const categoryName = categoriesMap[item.categoryId] || '';
    
    const matchesSearch = !searchTerm.trim() ||
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering - only apply if applyDateFilter is true AND dates are set
    let matchesDate = true;
    if (applyDateFilter && fromDate && toDate && item.date) {
      const itemDateFormatted = formatDateForComparison(item.date);
      if (itemDateFormatted) {
        matchesDate = itemDateFormatted >= fromDate && itemDateFormatted <= toDate;
      } else {
        matchesDate = false;
      }
    }

    const stock = parseFloat(item.currentStock) || 0;
    let matchesQty = true;
    if (qtyFilter === "gt0") matchesQty = stock > 0;     
    else if (qtyFilter === "lt0") matchesQty = stock < 0; 
    else if (qtyFilter === "eq0") matchesQty = stock === 0; 
    
    return matchesSearch && matchesDate && matchesQty;
  });

  // Add category name to processed data - ALL COLUMNS for table display
  const processedData = filteredData.map((item) => ({
    ...item,
    categoryName: categoriesMap[item.categoryId] || 'Uncategorized',
    opQty: (parseFloat(item.opQty) || 0).toFixed(2),
    currentStock: (parseFloat(item.currentStock) || 0).toFixed(2),
    opVal: `₹${(item.opVal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    prchQty: (parseFloat(item.prchQty) || 0).toFixed(2),
    prchVal: `₹${(item.prchVal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    saleQty: (parseFloat(item.saleQty) || 0).toFixed(2),
    saleVal: `₹${(item.saleVal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cloBal: `₹${(item.cloBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    date: item.date ? new Date(item.date).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) : '-',
  }));

  // Available columns configuration - ALL COLUMNS for table
  const allColumns = [
    { key: "sl_no", title: "S.No", style: { textAlign: "center", width: "60px" }, render: (value, record, index) => index + 1 },
    { key: "itemName", title: "Item Name", style: { textAlign: "left" } },
    { key: "categoryName", title: "Category", style: { textAlign: "left" } },
    { key: "opQty", title: "Op. Qty", style: { textAlign: "right" } },
    { key: "currentStock", title: "BL. Qty", style: { textAlign: "right" } },
    { key: "opVal", title: "Op. Val", style: { textAlign: "right" } },
    { key: "prchQty", title: "Prch Qty", style: { textAlign: "right" } },
    { key: "prchVal", title: "Prch Val", style: { textAlign: "right" } },
    { key: "saleQty", title: "Sale Qty", style: { textAlign: "right" } },
    { key: "saleVal", title: "Sale Val", style: { textAlign: "right" } },
    { key: "cloBal", title: "Clo. Bal", style: { textAlign: "right" } },
  ];

  // Table shows ALL columns (no filtering)
  const stockColumns = allColumns;

  const handlePdfColumnToggle = (columnKey) => {
    setPdfSelectedColumns(prev => {
      if (prev.includes(columnKey)) {
        // Don't allow removing if only one column is selected
        if (prev.length === 1) return prev;
        return prev.filter(key => key !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const exportToPDF = async () => {
    // Use filtered data for PDF (which already has filters applied)
    if (filteredData.length === 0) { 
      alert("⚠️ No data to export"); 
      return; 
    }
    setExportLoading(true);
    try {
      // Prepare PDF data with all fields
      const pdfData = filteredData.map((item) => ({
        itemName: item.itemName,
        categoryName: categoriesMap[item.categoryId] || 'Uncategorized',
        opQty: item.opQty || 0,
        currentStock: item.currentStock || 0, 
        opVal: item.opVal || 0,
        prchQty: item.prchQty || 0,
        prchVal: item.prchVal || 0,
        saleQty: item.saleQty || 0,
        saleVal: item.saleVal || 0,
        cloBal: item.cloBal || 0,
      }));

      const displayFromDate = fromDate ? formatDateForDisplay(fromDate) : formatDateForDisplay(getFirstDayOfCurrentMonth());
      const displayToDate = toDate ? formatDateForDisplay(toDate) : formatDateForDisplay(getCurrentDate());

      // Get column titles for PDF based on selected columns only
      const pdfColumns = allColumns
        .filter(col => col.key !== 'sl_no' && pdfSelectedColumns.includes(col.key))
        .map(col => ({
          key: col.key,
          title: col.title
        }));

      const blob = await pdf(
        <StockReportPDF
          reportData={{
            shopName: "SHREE SHASHWAT RAJ AGRO PVT.LTD",
            fromDate: displayFromDate,
            toDate: displayToDate,
            items: pdfData,
            columns: pdfColumns,
            selectedColumns: pdfSelectedColumns
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock_report_${displayFromDate}_to_${displayToDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // ✅ SUCCESS ALERT
      alert(`✅ Successfully exported stock report with ${filteredData.length} item(s) from ${displayFromDate} to ${displayToDate}`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      // ❌ ERROR ALERT
      alert(`❌ Failed to generate PDF: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setSearchTerm("");
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setQtyFilter("all");
    setApplyDateFilter(true);
  };

  const clearDateFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(true);
  };

  // Column selector component for PDF only
  const ColumnSelector = () => (
    <div className="stock-summary-column-selector-overlay">
      <div className="stock-summary-column-selector-popup">
        <div className="stock-summary-column-selector-header">
          <h3>Select Columns for PDF Export</h3>
          <button onClick={() => setShowColumnSelector(false)} className="stock-summary-close-btn">×</button>
        </div>
        <div className="stock-summary-column-selector-body">
          {allColumns.filter(col => col.key !== 'sl_no').map(column => (
            <label key={column.key} className="stock-summary-column-checkbox">
              <input
                type="checkbox"
                checked={pdfSelectedColumns.includes(column.key)}
                onChange={() => handlePdfColumnToggle(column.key)}
              />
              <span>{column.title}</span>
            </label>
          ))}
        </div>
        <div className="stock-summary-column-selector-footer">
          <button onClick={() => setShowColumnSelector(false)} className="stock-summary-apply-btn">Apply</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="stock-summary-container">
        <div className="stock-summary-loading">
          <div className="stock-summary-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-summary-container">
        <div className="stock-summary-error">
          <p>{error}</p>
          <button onClick={fetchStockData} className="stock-summary-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-summary-container">
      <div className="stock-summary-filters-section">
        <div className="stock-summary-filters-wrapper">

          {/* Search */}
          <div className="stock-summary-search-wrapper">
            <div className="stock-summary-search-input-group">
              <FaSearch className="stock-summary-search-icon" />
              <input
                type="text"
                placeholder="Search by item name, category, batch, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="stock-summary-search-input"
              />
              {searchTerm && (
                <button className="stock-summary-clear-btn" onClick={() => setSearchTerm("")} title="Clear search">×</button>
              )}
            </div>
          </div>

          {/* Date Filters - No max/min restrictions, future dates allowed */}
          <div className="stock-summary-date-filters">
            <div className="stock-summary-date-input-wrapper">
              <label className="stock-summary-date-label">From Date</label>
              <input
                id="from-date"
                type="date"
                value={tempFromDate}
                onChange={handleTempFromDateChange}
                className="stock-summary-date-input"
              />
            </div>
            <div className="stock-summary-date-input-wrapper">
              <label className="stock-summary-date-label">To Date</label>
              <input
                id="to-date"
                type="date"
                value={tempToDate}
                onChange={handleTempToDateChange}
                className="stock-summary-date-input"
              />
            </div>
            
            {/* Apply Date Filter Button - ONLY this applies the filter */}
            <button 
              className="stock-summary-apply-date-btn" 
              onClick={applyDateFilterHandler}
              disabled={!tempFromDate || !tempToDate}
            >
              Add Filter
            </button>
            
            {/* Show reset button if dates are not default */}
            {(tempFromDate !== getFirstDayOfCurrentMonth() || tempToDate !== getCurrentDate()) && (
              <button className="stock-summary-clear-date-btn" onClick={clearDateFilters}>
                Reset to Current Month
              </button>
            )}
          </div>

          {/* QTY Dropdown Filter - applies immediately */}
          <div className="stock-summary-date-input-wrapper">
            <label className="stock-summary-date-label">QTY Filter</label>
            <select
              value={qtyFilter}
              onChange={(e) => setQtyFilter(e.target.value)}
              className="stock-summary-date-input"
            >
              <option value="all">All</option>
              <option value="gt0">&#62; 0  ( Available Stock )</option>
              <option value="lt0">&#60; 0  (Negative Stock)</option>
              <option value="eq0">= 0  (Zero Stock)</option>
            </select>
          </div>

          {/* Column Selector Button - for PDF only */}
          <button
            onClick={() => setShowColumnSelector(true)}
            className="stock-summary-column-selector-btn"
            title="Select Columns for PDF Export"
          >
           PDF Columns
          </button>

          {/* Export PDF */}
          <button
            onClick={exportToPDF}
            disabled={exportLoading || filteredData.length === 0}
            className={`stock-summary-export-btn ${exportLoading ? 'stock-summary-export-btn--loading' : ''}`}
          >
            {exportLoading ? (
              <><span className="stock-summary-spinner-small"></span>Exporting...</>
            ) : (
              <><FaFilePdf className="stock-summary-export-icon" />Export PDF</>
            )}
          </button>

          {(searchTerm || (tempFromDate !== getFirstDayOfCurrentMonth() || tempToDate !== getCurrentDate()) || qtyFilter !== "all") && (
            <button className="stock-summary-clear-all-btn" onClick={clearFilters}>
              Clear All
            </button>
          )}

        </div>
      </div>

      {showColumnSelector && <ColumnSelector />}

      <div className="stock-summary-table-section">
        <ReusableTable
          data={processedData}
          columns={stockColumns}
          initialEntriesPerPage={10}
          showSearch={false}
          showEntries={true}
          showPagination={true}
        />
      </div>
    </div>
  );
};

export default StockReport;