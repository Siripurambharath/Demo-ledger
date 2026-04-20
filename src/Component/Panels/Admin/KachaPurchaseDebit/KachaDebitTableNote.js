import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './DebitNote.css';
import { baseurl } from '../../../BaseURL/BaseURL';
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import Select from "react-select";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DebitNotePDF from '../DebitTable/DebitNotePDF';

const KachaDebitTableNote = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [creditNoteData, setCreditNoteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [isDownloading, setIsDownloading] = useState(false);
const [isRangeDownloading, setIsRangeDownloading] = useState(false);
const pdfRef = useRef();
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2026');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Debit Note');
  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
  const y = 2025 + i;
  return { value: y, label: y };
});

  // Fetch debit notes from API
  useEffect(() => {
    fetchCreditNotes();
  }, []);

const fetchCreditNotes = async () => {
  try {
    setLoading(true);
    setError(null);

const response = await fetch(`${baseurl}/api/debit-notes-table?data_type=stock inward`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    console.log("API Response:", result);

    if (result.success) {
      const transformedData = result.debitNotes.map(note => ({
        id: note.VoucherID,
        customerName: note.PartyName || 'N/A',
        noteNumber: note.VchNo || 'N/A',
        document: note.InvoiceNumber || 'N/A',
        documentType: note.TransactionType || 'DebitNote',
        creditAmount: `₹ ${parseFloat(note.TotalAmount || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        created: note.Date ? new Date(note.Date).toLocaleDateString('en-IN') : 'N/A',
        status: 'Active',
        rawData: note
      }));

      console.log("Transformed data:", transformedData);
      setCreditNoteData(transformedData);
    } else {
      setError("Failed to fetch debit notes");
    }
  } catch (err) {
    console.error("Error fetching debit notes:", err);
    setError("Error fetching debit notes data");
  } finally {
    setLoading(false);
  }
};


  const handleViewCreditNote = (creditNoteId) => {
    console.log('View debit note ID:', creditNoteId);
    if (!creditNoteId || creditNoteId === 'undefined') {
      console.error('Invalid debit note ID:', creditNoteId);
      alert('Cannot view debit note: Invalid ID');
      return;
    }
    navigate(`/kachadebitenoteview/${creditNoteId}`);
  };

  const handleCreateClick = () => navigate("/kachadebitnote");

  // Define tabs with their corresponding routes
const tabs = [
    { name: ' Kacha Purchase Invoice', path: '/kachapurchaseinvoicetable' },
    // { name: 'Purchase Order', path: '/purchase/purchase-order' },
    { name: 'Voucher', path: '/kachaPurchasevoucher' },
    { name: 'Debit Note', path: '/kachadebitnotetable' },
    // { name: 'Payables', path: '/purchase/payables' }
  ];
  // Handle tab click - navigate to corresponding route
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Action handlers
  const handleView = (item) => {
    console.log('View debit note:', item);
    if (item.id) {
      navigate(`/purchase/debit-note/view/${item.id}`);
    }
  };

  const handleEdit = (item) => {
    console.log('Edit debit note:', item);
    if (item.id) {
      navigate(`/kachaeditdebitenote/${item.id}`);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete debit note ${item.noteNumber || 'unknown'}?`)) {
      try {
        console.log('Delete debit note:', item);
        
        const response = await fetch(`${baseurl}/transactions/${item.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            alert('debit note deleted successfully!');
            fetchCreditNotes();
          } else {
            alert('Failed to delete debit note: ' + (result.message || 'Unknown error'));
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete debit note');
        }
      } catch (err) {
        console.error('Error deleting debit note:', err);
        alert('Error deleting debit note. Please try again.');
      }
    }
  };

  // Filter debit notes by date range
const filterDebitNotesByDateRange = (debitNotes, start, end) => {
  if (!start || !end) return debitNotes;
  
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  
  return debitNotes.filter(note => {
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

// Filter debit notes by month and year
const filterDebitNotesByMonthYear = (debitNotes, month, year) => {
  if (!month || !year) return debitNotes;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.indexOf(month);
  
  return debitNotes.filter(note => {
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

// Generate PDF using the DebitNotePDF component
const generatePDF = async (filteredData, type = 'month') => {
  if (!filteredData || filteredData.length === 0) {
    alert('No Kacha debit notes found for the selected period');
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
        <DebitNotePDF 
          ref={pdfRef}
          debitNotes={filteredData}
          startDate={type === 'range' ? startDate : null}
          endDate={type === 'range' ? endDate : null}
          month={type === 'month' ? month : null}
          year={type === 'month' ? year : null}
          title="Kacha Debit Notes Report" // Custom title for Kacha
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
    let filename = 'kacha_debit_notes_report';
    if (type === 'range') {
      filename = `kacha_debit_notes_${startDate}_to_${endDate}.pdf`;
    } else {
      filename = `kacha_debit_notes_${month}_${year}.pdf`;
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
const handleDownload = async () => {
  try {
    setIsDownloading(true);
    
    // Filter debit notes by selected month and year
    const filteredDebitNotes = filterDebitNotesByMonthYear(creditNoteData, month, year);
    
    if (filteredDebitNotes.length === 0) {
      alert(`No Kacha debit notes found for ${month} ${year}`);
      setIsDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredDebitNotes.length} Kacha debit notes for:`, month, year);
    
    // Generate PDF
    await generatePDF(filteredDebitNotes, 'month');
    
  } catch (err) {
    console.error('Download error:', err);
    alert('Error downloading Kacha debit notes: ' + err.message);
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
    
    // Filter debit notes by date range
    const filteredDebitNotes = filterDebitNotesByDateRange(creditNoteData, startDate, endDate);
    
    if (filteredDebitNotes.length === 0) {
      alert(`No Kacha debit notes found from ${startDate} to ${endDate}`);
      setIsRangeDownloading(false);
      return;
    }
    
    console.log(`Downloading ${filteredDebitNotes.length} Kacha debit notes for date range:`, startDate, 'to', endDate);
    
    // Generate PDF
    await generatePDF(filteredDebitNotes, 'range');
    
  } catch (err) {
    console.error('Download range error:', err);
    alert('Error downloading Kacha debit notes: ' + err.message);
  } finally {
    setIsRangeDownloading(false);
  }
};
  // Custom renderers
  const renderDocument = (value, item) => {
    if (!item) return null;
    return (
      <div className="debit-note-table__document-cell">
        <span className="debit-note-table__document-number">{item.document || 'N/A'}</span>
        {item.documentType && (
          <span className="debit-note-table__document-type"></span>
        )}
      </div>
    );
  };

  const renderCreditAmount = (value, item) => {
    if (!item) return null;
    return (
      <div className="debit-note-table__amount-cell">
        <div className="debit-note-table__amount">{item.creditAmount || '₹ 0.00'}</div>
        <div className={`debit-note-table__status debit-note-table__status--${item.status?.toLowerCase() || 'active'}`}>
          {/* {item.status || 'Active'} */}
        </div>
      </div>
    );
  };

  const renderAction = (value, item) => {
    if (!item) return null;
    return (
      <div className="debit-note-table__actions">
        <button
          className="btn btn-sm btn-outline-warning me-1"
          onClick={() => handleEdit(item)}
          title="Edit debit Note"
        >
          <FaPencilAlt />
        </button>
        
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(item)}
          title="Delete debit Note"
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
      title: 'DEBIT NOTE NUMBER',
      render: (value, row) => (
        <button
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleViewCreditNote(row.id)} // Use row.id which contains VoucherID
          title="Click to view debit note"
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
      key: 'debitAmount',
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
    <div className="debit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`debit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="debit-note-content-area">
          {/* ✅ Tabs Section */}
          <div className="debit-note-tabs-section">
            <div className="debit-note-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`debit-note-tab ${activeTab === tab.name ? 'debit-note-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="debit-note-header-section">
            <div className="debit-note-header-top">
              <div className="debit-note-title-section">
                <h1 className="debit-note-main-title">Debit Note Management</h1>
                <p className="debit-note-subtitle">Create, manage and track all your debit notes</p>
              </div>
            </div>
          </div>

          {/* Filters and Actions Section */}
          <div className="debit-note-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Debit Note Details</h5>

              {loading && (
                <div className="alert alert-info">Loading debit notes...</div>
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
      width: '100px',
      minWidth: '100px',
    }),
    menu: (provided) => ({
      ...provided,
      width: '100px',
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
                    Create Debit Note
                  </button>
                </div>
              </div>

              {/* Table Section */}
              {!loading && !error && (
                <ReusableTable
                  title={`Debit Notes (${creditNoteData.length} records)`}
                  data={creditNoteData}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search debit notes..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              )}

              {!loading && !error && creditNoteData.length === 0 && (
                <div className="alert alert-warning">
                  No debit notes found. Create your first debit note!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KachaDebitTableNote;