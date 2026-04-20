import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExcel, FaFilter } from "react-icons/fa";
import * as XLSX from 'xlsx';
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./GstReport.css";

const GstReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL");
  const [kachaPakkaFilter, setKachaPakkaFilter] = useState("ALL");
  const [gstData, setGstData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [applyDateFilter, setApplyDateFilter] = useState(true);

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

  useEffect(() => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setFromDate(firstDay);
    setToDate(currentDate);
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    fetchGstData();
  }, []);

const fetchGstData = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await axios.get(`${baseurl}/gstreport`);
    const vouchers = response.data;

    const processedData = vouchers.map((voucher, index) => {
      const formattedDate = voucher.Date ? new Date(voucher.Date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : '-';

      const subtotal = parseFloat(voucher.Subtotal) ||
        voucher.items?.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0) || 0;

      const sgstAmount = parseFloat(voucher.SGSTAmount) ||
        voucher.items?.reduce((sum, item) => sum + (parseFloat(item.sgst_amount) || 0), 0) || 0;

      const cgstAmount = parseFloat(voucher.CGSTAmount) ||
        voucher.items?.reduce((sum, item) => sum + (parseFloat(item.cgst_amount) || 0), 0) || 0;

      const igstAmount = parseFloat(voucher.IGSTAmount) ||
        voucher.items?.reduce((sum, item) => sum + (parseFloat(item.igst_amount) || 0), 0) || 0;

      const totalAmount = parseFloat(voucher.TotalAmount) ||
        subtotal + sgstAmount + cgstAmount + igstAmount;

      const transactionType = getTransactionType(voucher);
      const specificTransactionType = getSpecificTransactionType(voucher);

      // ✅ Get HSN Code from items array
      let hsnCode = 'N/A';
      if (voucher.items && voucher.items.length > 0) {
        // Get unique HSN codes from all items
        const hsnCodes = voucher.items
          .map(item => item.hsn_code)
          .filter(code => code && code !== 'N/A' && code !== null);
        
        if (hsnCodes.length > 0) {
          // If multiple items have same HSN code, use that, otherwise join with comma
          const uniqueHsnCodes = [...new Set(hsnCodes)];
          hsnCode = uniqueHsnCodes.join(', ');
        }
      }

      return {
        id: voucher.VoucherID || index,
        billNo: voucher.VchNo || `N/A`,
        date: formattedDate,
        rawDate: voucher.Date,
        party: voucher.PartyName || voucher.business_name || 'N/A',
        gstNo: voucher.gstin || 'N/A',
        hsnCode: hsnCode, // ✅ Now correctly getting from items
        billAmt: totalAmount,
        taxableAmt: subtotal,
        sgstAmt: sgstAmount,
        cgstAmt: cgstAmount,
        igstAmt: igstAmount,
        transactionType: transactionType,
        specificTransactionType: specificTransactionType,
        voucherType: voucher.TransactionType || '',
        originalData: voucher
      };
    });

    setGstData(processedData);
  } catch (err) {
    console.error("Error fetching GST data:", err);
    setError("Failed to fetch GST report data");
  } finally {
    setLoading(false);
  }
};

  const getTransactionType = (voucher) => {
    const trantype = (voucher.TransactionType || '').toLowerCase().trim().replace(/\s+/g, '');
    const dataType = (voucher.data_type || '').toLowerCase().trim().replace(/\s+/g, '');
    const pakkaTypes = ['sales', 'purchase'];
    const kachaTypes = ['stocktransfer', 'stockinward'];
    if (pakkaTypes.includes(dataType)) return 'PAKKA';
    if (kachaTypes.includes(dataType)) return 'KACHA';
    if (pakkaTypes.includes(trantype)) return 'PAKKA';
    if (kachaTypes.includes(trantype)) return 'KACHA';
    return 'UNKNOWN';
  };

  const getSpecificTransactionType = (voucher) => {
    const trantype = (voucher.TransactionType || '').trim().toLowerCase();
    const typeMap = {
      sales: 'Sales',
      purchase: 'Purchase',
      receipt: 'Receipt',
      creditnote: 'Credit Note',
      debitnote: 'Debit Note',
      stockinward: 'Stock Inward',
      stocktransfer: 'Stock Transfer',
      purchasevoucher: 'Purchase Voucher'
    };
    const cleanType = trantype.replace(/\s+/g, '');
    return typeMap[cleanType] || voucher.TransactionType;
  };

  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    try {
      // If it's already in YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      // If it's in DD/MM/YYYY format
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const applyDateFilterHandler = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setApplyDateFilter(true);
  };

  const filteredData = gstData.filter((item) => {
    const matchesSearch = !searchTerm.trim() ||
      item.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply date filter only when applyDateFilter is true and dates are set
    let matchesDate = true;
    if (applyDateFilter && fromDate && toDate) {
      let itemDateFormatted = null;
      
      // Try to get the raw date first (original Date object)
      if (item.rawDate) {
        const rawDate = new Date(item.rawDate);
        if (!isNaN(rawDate.getTime())) {
          itemDateFormatted = rawDate.toISOString().split('T')[0];
        }
      }
      
      // If raw date didn't work, try formatted date
      if (!itemDateFormatted) {
        itemDateFormatted = formatDateForComparison(item.date);
      }
      
      if (itemDateFormatted) {
        matchesDate = itemDateFormatted >= fromDate && itemDateFormatted <= toDate;
      } else {
        matchesDate = false;
      }
    }

    let matchesSpecificTransactionType = true;
    if (transactionTypeFilter !== "ALL") {
      matchesSpecificTransactionType = item.specificTransactionType === transactionTypeFilter;
    }

    let matchesKachaPakka = true;
    if (kachaPakkaFilter !== "ALL") {
      matchesKachaPakka = item.transactionType === kachaPakkaFilter;
    }

    return matchesSearch && matchesDate && matchesSpecificTransactionType && matchesKachaPakka;
  });

  const processedTableData = filteredData.map((item) => ({
    ...item,
    billAmt: `₹${(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    taxableAmt: `₹${(item.taxableAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sgstAmt: `₹${(item.sgstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cgstAmt: `₹${(item.cgstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    igstAmt: `₹${(item.igstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }));

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export");
      return;
    }
    setExportLoading(true);
    try {
      const companyName = "SHREE SHASHWAT RAJ AGRO PVT.LTD.";

      const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
      };

      const displayFromDate = fromDate ? formatDateForDisplay(fromDate) : formatDateForDisplay(getCurrentDate());
      const displayToDate = toDate ? formatDateForDisplay(toDate) : formatDateForDisplay(getCurrentDate());

      const wsData = [
        [companyName],
        [`GST REGISTER REPORT FROM ${displayFromDate} To ${displayToDate}`],
        [],
        [
          "Bill No.", "Date", "Party", "GST No.", "HSN Code", 
          "Bill Amt", "Taxable Amt", "SGST Amt", "CGST Amt", "IGST Amt", "Transaction Type"
        ],
        ...filteredData.map((item) => [
          item.billNo || "",
          item.date || "",
          item.party || "",
          item.gstNo || "",
          item.hsnCode || "",
          Number(item.billAmt || 0),
          Number(item.taxableAmt || 0),
          Number(item.sgstAmt || 0),
          Number(item.cgstAmt || 0),
          Number(item.igstAmt || 0),
          item.specificTransactionType || ""
        ]),
        [],
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [
        { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
      ];

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, 
        { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
      ];

      ws["A1"] = {
        v: companyName, t: "s",
        s: { font: { bold: true, sz: 13 }, alignment: { horizontal: "center", vertical: "center" } }
      };
      ws["A2"] = {
        v: `GST REGISTER REPORT FROM ${displayFromDate} To ${displayToDate}`, t: "s",
        s: { font: { bold: true, sz: 11 }, alignment: { horizontal: "center", vertical: "center" } }
      };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GST Register");
      XLSX.writeFile(wb, `GST_Register_${displayFromDate}_to_${displayToDate}.xlsx`, { bookSST: true, cellStyles: true });

    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file");
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
    setTransactionTypeFilter("ALL");
    setKachaPakkaFilter("ALL");
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

  const gstColumns = [
    { key: "sl_no", title: "S.No", style: { textAlign: "center", width: "60px" }, render: (value, record, index) => index + 1 },
    { key: "billNo", title: "Bill No.", style: { textAlign: "left", width: "100px" } },
    { key: "date", title: "Date", style: { textAlign: "center", width: "100px" } },
    { key: "party", title: "Party", style: { textAlign: "left" } },
    { key: "gstNo", title: "GST No.", style: { textAlign: "left", width: "150px" } },
    { key: "hsnCode", title: "HSN Code", style: { textAlign: "left", width: "110px" } }, 
    { key: "billAmt", title: "Bill Amt", style: { textAlign: "right", width: "120px" } },
    { key: "taxableAmt", title: "Taxable Amt", style: { textAlign: "right", width: "120px" } },
    { key: "sgstAmt", title: "SGST Amt", style: { textAlign: "right", width: "100px" } },
    { key: "cgstAmt", title: "CGST Amt", style: { textAlign: "right", width: "100px" } },
    { key: "igstAmt", title: "IGST Amt", style: { textAlign: "right", width: "100px" } },
  ];

  const totals = filteredData.reduce((acc, item) => ({
    billAmt: acc.billAmt + item.billAmt,
    taxableAmt: acc.taxableAmt + item.taxableAmt,
    sgstAmt: acc.sgstAmt + item.sgstAmt,
    cgstAmt: acc.cgstAmt + item.cgstAmt,
    igstAmt: acc.igstAmt + item.igstAmt
  }), { billAmt: 0, taxableAmt: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 });

  if (loading) {
    return (
      <div className="gst-report-container">
        <div className="gst-report-loading">
          <div className="gst-report-spinner"></div>
          <p>Loading GST report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gst-report-container">
        <div className="gst-report-error">
          <p>{error}</p>
          <button onClick={fetchGstData} className="gst-report-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gst-report-container">
      <div className="gst-report-kacha-pakka-wrapper">
        <button className={`gst-report-kacha-pakka-btn ${kachaPakkaFilter === 'ALL' ? 'active' : ''}`} onClick={() => setKachaPakkaFilter('ALL')}>ALL</button>
        <button className={`gst-report-kacha-pakka-btn pakka-btn ${kachaPakkaFilter === 'PAKKA' ? 'active' : ''}`} onClick={() => setKachaPakkaFilter('PAKKA')}>PAKKA</button>
        <button className={`gst-report-kacha-pakka-btn kacha-btn ${kachaPakkaFilter === 'KACHA' ? 'active' : ''}`} onClick={() => setKachaPakkaFilter('KACHA')}>KACHA</button>
      </div>

      <div className="gst-report-filters-section">
        <div className="gst-report-filters-wrapper">

          {/* Search */}
          <div className="gst-report-search-wrapper">
            <div className="gst-report-search-input-group">
              <FaSearch className="gst-report-search-icon" />
              <input
                type="text"
                placeholder="Search by Bill No., Party, GST No., HSN Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gst-report-search-input"
              />
              {searchTerm && (
                <button className="gst-report-clear-btn" onClick={() => setSearchTerm("")} title="Clear search">×</button>
              )}
            </div>
          </div>

          {/* Transaction Type Dropdown */}
          <div className="gst-report-filter-wrapper">
            <label htmlFor="transaction-type" className="gst-report-filter-label">Transaction Type</label>
            <select
              id="transaction-type"
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
              className="gst-report-filter-select"
            >
              <option value="ALL">All Transaction Types</option>
              {kachaPakkaFilter === 'PAKKA' && (
                <>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Purchase Voucher">Purchase Voucher</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Debit Note">Debit Note</option>
                </>
              )}
              {kachaPakkaFilter === 'KACHA' && (
                <>
                  <option value="Stock Inward">Stock Inward</option>
                  <option value="Stock Transfer">Stock Transfer</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Purchase Voucher">Purchase Voucher</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Debit Note">Debit Note</option>
                </>
              )}
              {kachaPakkaFilter === 'ALL' && (
                <>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Purchase Voucher">Purchase Voucher</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Debit Note">Debit Note</option>
                  <option value="Stock Inward">Stock Inward</option>
                  <option value="Stock Transfer">Stock Transfer</option>
                </>
              )}
            </select>
          </div>

          {/* Date Filters - With Apply Button */}
          <div className="gst-report-date-filters">
            <div className="gst-report-date-input-wrapper">
              <label htmlFor="from-date" className="gst-report-date-label">From Date</label>
              <input 
                id="from-date" 
                type="date" 
                value={tempFromDate} 
                onChange={(e) => setTempFromDate(e.target.value)} 
                className="gst-report-date-input" 
              />
            </div>
            <div className="gst-report-date-input-wrapper">
              <label htmlFor="to-date" className="gst-report-date-label">To Date</label>
              <input 
                id="to-date" 
                type="date" 
                value={tempToDate} 
                onChange={(e) => setTempToDate(e.target.value)} 
                className="gst-report-date-input" 
              />
            </div>
            
            {/* Apply Date Filter Button */}
            <button 
              className="gst-report-apply-date-btn"
              onClick={applyDateFilterHandler}
            >
              
              Add  Filter
            </button>
            
            {/* Reset Dates Button */}
            {(tempFromDate !== getFirstDayOfCurrentMonth() || tempToDate !== getCurrentDate()) && (
              <button 
                className="gst-report-reset-dates-btn"
                onClick={clearDateFilters}
                title="Reset to current month"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Export Excel */}
          <button
            onClick={exportToExcel}
            disabled={exportLoading || filteredData.length === 0}
            className={`gst-report-export-btn ${exportLoading ? 'gst-report-export-btn--loading' : ''}`}
          >
            {exportLoading ? (
              <><span className="gst-report-spinner-small"></span>Exporting...</>
            ) : (
              <><FaFileExcel className="gst-report-export-icon" />Export Excel</>
            )}
          </button>

          {(searchTerm || transactionTypeFilter !== "ALL" || kachaPakkaFilter !== "ALL") && (
            <button className="gst-report-clear-all-btn" onClick={clearFilters}>Clear All </button>
          )}

        </div>
      </div>

 

      <div className="gst-report-table-section">
        <ReusableTable
          data={processedTableData}
          columns={gstColumns}
          initialEntriesPerPage={10}
          showSearch={false}
          showEntries={true}
          showPagination={true}
        />
      </div>
    </div>
  );
};

export default GstReport;