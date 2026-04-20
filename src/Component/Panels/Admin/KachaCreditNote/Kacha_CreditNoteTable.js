// CreditNoteTable.js
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './CreditNote.css';
import { baseurl } from '../../../BaseURL/BaseURL';
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import Select from "react-select";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CreditNotePDF from '../CreditNote/CreditNotePDF';
const Kacha_CreditNoteTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [creditNoteData, setCreditNoteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2026');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('CreditNote');
  const [isDownloading, setIsDownloading] = useState(false);
const [isRangeDownloading, setIsRangeDownloading] = useState(false);
const pdfRef = useRef();
  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
  const y = 2025 + i;
  return { value: y, label: y };
});
  // Fetch credit notes from API
  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const fetchCreditNotes = async () => {
    try {
      setLoading(true);
      setError(null);
const response = await fetch(`${baseurl}/api/credit-notes-table?data_type=stock transfer`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (result.success) {
        // Transform the API data to match table format
        const transformedData = result.creditNotes.map(note => ({
          id: note.VoucherID, // This is the VoucherID
          customerName: note.PartyName || 'N/A',
          noteNumber: note.VchNo || 'N/A',
          document: note.InvoiceNumber || 'N/A',
          documentType: note.TransactionType || 'CreditNote',
          creditAmount: `₹ ${parseFloat(note.TotalAmount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`,
          created: note.Date ? new Date(note.Date).toLocaleDateString('en-IN') : 'N/A',
          status: 'Active',
          rawData: note // Keep original data for reference
        }));
        
        console.log('Transformed data:', transformedData);
        setCreditNoteData(transformedData);
      } else {
        setError('Failed to fetch credit notes');
      }
    } catch (err) {
      console.error('Error fetching credit notes:', err);
      setError('Error fetching credit notes data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCreditNote = (creditNoteId) => {
    console.log('View credit note ID:', creditNoteId);
    if (!creditNoteId || creditNoteId === 'undefined') {
      console.error('Invalid credit note ID:', creditNoteId);
      alert('Cannot view credit note: Invalid ID');
      return;
    }
    navigate(`/kachacreditview/${creditNoteId}`);
  };

  const handleCreateClick = () => navigate("/kachacreditenote");

  // Define tabs with their corresponding routes
  const tabs = [
    { name: ' Kacha Invoices', path: '/kachinvoicetable' },
    { name: 'Receipts', path: '/kachareceipts' },
    // { name: 'Quotations', path: '/sales/quotations' },
    // { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
    { name: 'CreditNote', path: '/kachacreditenotetable' },
    // { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
    // { name: 'Receivables', path: '/sales/receivables' }
  ];

  // Handle tab click - navigate to corresponding route
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Action handlers
  const handleView = (item) => {
    console.log('View credit note:', item);
    if (item.id) {
      navigate(`/sales/credit-note/view/${item.id}`);
    }
  };

  const handleEdit = (item) => {
    console.log('Edit credit note:', item);
    if (item.id) {
      navigate(`/kachaeditcreditnote/${item.id}`);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete credit note ${item.noteNumber || 'unknown'}?`)) {
      try {
        console.log('Delete credit note:', item);
        
        const response = await fetch(`${baseurl}/transactions/${item.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            alert('Credit note deleted successfully!');
            fetchCreditNotes();
          } else {
            alert('Failed to delete credit note: ' + (result.message || 'Unknown error'));
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete credit note');
        }
      } catch (err) {
        console.error('Error deleting credit note:', err);
        alert('Error deleting credit note. Please try again.');
      }
    }
  };

  // Filter credit notes by date range
const filterCreditNotesByDateRange = (creditNotes, start, end) => {
  if (!start || !end) return creditNotes;
  
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  
  return creditNotes.filter(note => {
    if (!note.created) return false;
    // Convert DD/MM/YYYY to Date object
    const parts = note.created.split('/');
    if (parts.length === 3) {
      const noteDate = new Date(parts[2], parts[1] - 1, parts[0]);
      return noteDate >= startDate && noteDate <= endDate;
    }
    return false;
  });
};

// Filter credit notes by month and year
const filterCreditNotesByMonthYear = (creditNotes, month, year) => {
  if (!month || !year) return creditNotes;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.indexOf(month);
  
  return creditNotes.filter(note => {
    if (!note.created) return false;
    // Convert DD/MM/YYYY to Date object
    const parts = note.created.split('/');
    if (parts.length === 3) {
      const noteDate = new Date(parts[2], parts[1] - 1, parts[0]);
      return noteDate.getMonth() === monthIndex && 
             noteDate.getFullYear() === parseInt(year);
    }
    return false;
  });
};

const handleDownload = async () => {
  try {
    setIsDownloading(true);
    
    // Filter credit notes by selected month and year
    const filteredCreditNotes = filterCreditNotesByMonthYear(creditNoteData, month, year);
    
    if (filteredCreditNotes.length === 0) {
      alert(`No Kacha credit notes found for ${month} ${year}`);
      setIsDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredCreditNotes.length} Kacha credit notes for:`, month, year);
    
    // Generate PDF
    await generatePDF(filteredCreditNotes, 'month');
    
  } catch (err) {
    console.error('Download error:', err);
    alert('Error downloading Kacha credit notes: ' + err.message);
  } finally {
    setIsDownloading(false);
  }
};

const handleDownloadRange = async () => {
  try {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be after end date');
      return;
    }

    setIsRangeDownloading(true);
    
    // Filter credit notes by date range
    const filteredCreditNotes = filterCreditNotesByDateRange(creditNoteData, startDate, endDate);
    
    if (filteredCreditNotes.length === 0) {
      alert(`No Kacha credit notes found from ${startDate} to ${endDate}`);
      setIsRangeDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredCreditNotes.length} Kacha credit notes for date range:`, startDate, 'to', endDate);
    
    // Generate PDF
    await generatePDF(filteredCreditNotes, 'range');
    
  } catch (err) {
    console.error('Download range error:', err);
    alert('Error downloading Kacha credit notes: ' + err.message);
  } finally {
    setIsRangeDownloading(false);
  }
};


// Generate PDF from the CreditNotePDF component
const generatePDF = async (filteredData, type = 'month') => {
  if (!filteredData || filteredData.length === 0) {
    alert('No Kacha credit notes found for the selected period');
    return;
  }

  try {
    // Create a temporary div to render the PDF component
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    // Use ReactDOM to render the component
    const ReactDOM = require('react-dom');
    await new Promise((resolve) => {
      ReactDOM.render(
        <CreditNotePDF 
          ref={pdfRef}
          creditNotes={filteredData}
          startDate={type === 'range' ? startDate : null}
          endDate={type === 'range' ? endDate : null}
          month={type === 'month' ? month : null}
          year={type === 'month' ? year : null}
          title="Kacha Credit Notes Report" // Custom title for Kacha
        />,
        element,
        resolve
      );
    });

    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);

    // Generate filename
    let filename = 'kacha_credit_notes_report';
    if (type === 'range') {
      filename = `kacha_credit_notes_${startDate}_to_${endDate}.pdf`;
    } else {
      filename = `kacha_credit_notes_${month}_${year}.pdf`;
    }

    // Save PDF
    pdf.save(filename);

    // Cleanup
    ReactDOM.unmountComponentAtNode(element);
    document.body.removeChild(element);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
  }
};
  // Custom renderers
  const renderDocument = (value, item) => {
    if (!item) return null;
    return (
      <div className="credit-note-table__document-cell">
        <span className="credit-note-table__document-number">{item.document || 'N/A'}</span>
        {item.documentType && (
          <span className="credit-note-table__document-type"></span>
        )}
      </div>
    );
  };

  const renderCreditAmount = (value, item) => {
    if (!item) return null;
    return (
      <div className="credit-note-table__amount-cell">
        <div className="credit-note-table__amount">{item.creditAmount || '₹ 0.00'}</div>
        <div className={`credit-note-table__status credit-note-table__status--${item.status?.toLowerCase() || 'active'}`}>
          {/* {item.status || 'Active'} */}
        </div>
      </div>
    );
  };

  const renderAction = (value, item) => {
    if (!item) return null;
    return (
      <div className="credit-note-table__actions">
        <button
          className="btn btn-sm btn-outline-warning me-1"
          onClick={() => handleEdit(item)}
          title="Edit Credit Note"
        >
          <FaPencilAlt />
        </button>
        
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(item)}
          title="Delete Credit Note"
        >
          <FaTrash />
        </button>
      </div>
    );
  };

  const columns = [
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      style: { textAlign: 'left' }
    },
    {
      key: 'noteNumber',
      title: 'CREDIT NOTE NUMBER',
      render: (value, row) => (
        <button
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleViewCreditNote(row.id)} // Use row.id which contains VoucherID
          title="Click to view credit note"
        >
          {value || 'N/A'}
        </button>
      ),
      style: { textAlign: 'center' }
    },
    {
      key: 'document',
      title: 'Invoice Number',
      render: renderDocument,
      style: { textAlign: 'center' }
    },
    {
      key: 'creditAmount',
      title: 'AMOUNT',
      render: renderCreditAmount,
      style: { textAlign: 'right' }
    },
    {
      key: 'created',
      title: 'CREATED DATE',
      style: { textAlign: 'center' }
    },
    {
      key: 'action',
      title: 'ACTION',
      render: renderAction,
      style: { textAlign: 'center', width: '150px' }
    }
  ];

 

  return (
    <div className="credit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`credit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="credit-note-content-area">
          {/* ✅ Tabs Section */}
          <div className="credit-note-tabs-section">
            <div className="credit-note-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`credit-note-tab ${activeTab === tab.name ? 'credit-note-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="credit-note-header-section">
            <div className="credit-note-header-top">
              <div className="credit-note-title-section">
                <h1 className="credit-note-main-title">Credit Note Management</h1>
                <p className="credit-note-subtitle">Create, manage and track all your credit notes</p>
              </div>
            </div>
          </div>

          {/* Filters and Actions Section */}
          <div className="credit-note-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Credit Note Details</h5>

              {loading && (
                <div className="alert alert-info">Loading credit notes...</div>
              )}
              
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {/* Filters Section */}
              <div className="row align-items-end g-3 mb-3">
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Month and Year Data:</label>
                  <div className="d-flex">
                    <select className="form-select me-2" value={month} onChange={(e) => setMonth(e.target.value)}>
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </select>
                                                                        <Select
  options={yearOptions}
  value={{ value: year, label: year }}
  onChange={(selected) => setYear(selected.value)}
  maxMenuHeight={150}
  styles={{
    control: (provided) => ({
      ...provided,
      width: '100px',  // Adjust width as needed
      minWidth: '100px',
    }),
    menu: (provided) => ({
      ...provided,
      width: '100px',  // Same width as control
      minWidth: '100px',
    }),
    option: (provided) => ({
      ...provided,
      whiteSpace: 'nowrap',
      padding: '8px 12px',
    })
  }}
/>
                  </div>
                </div>

                <div className="col-md-auto">
                
<button 
  className="btn btn-success mt-4" 
  onClick={handleDownload}
  disabled={isDownloading}
>
  {isDownloading ? (
    <div className="spinner-border spinner-border-sm" role="status"></div>
  ) : (
    <i className="bi bi-download me-1"></i>
  )} Download
</button>


                </div>

                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Date Range:</label>
                  <div className="d-flex">
                    <input 
                      type="date" 
                      className="form-control me-2" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                    />
                    <input 
                      type="date" 
                      className="form-control" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="col-md-auto">
            
<button 
  className="btn btn-success mt-4" 
  onClick={handleDownloadRange}
  disabled={isRangeDownloading}
>
  {isRangeDownloading ? (
    <div className="spinner-border spinner-border-sm" role="status"></div>
  ) : (
    <i className="bi bi-download me-1"></i>
  )} Download Range
</button>
                </div>

                <div className="col-md-auto">
                  <button 
                    className="btn btn-info text-white mt-4"
                    onClick={handleCreateClick}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Create Credit Note
                  </button>
                </div>
              </div>

              {/* Table Section */}
              {!loading && !error && (
                <ReusableTable
                  title={`Credit Notes (${creditNoteData.length} records)`}
                  data={creditNoteData}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search credit notes..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              )}

              {!loading && !error && creditNoteData.length === 0 && (
                <div className="alert alert-warning">
                  No credit notes found. Create your first credit note!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kacha_CreditNoteTable;