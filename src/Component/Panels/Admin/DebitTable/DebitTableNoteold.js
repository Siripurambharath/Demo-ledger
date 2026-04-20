import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './DebitNote.css';
import { baseurl } from '../../../BaseURL/BaseURL';
import { FaPencilAlt, FaTrash } from "react-icons/fa";

const DebitNoteTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [creditNoteData, setCreditNoteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Debit Note');

  // Fetch debit notes from API
  useEffect(() => {
    fetchCreditNotes();
  }, []);

const fetchCreditNotes = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`${baseurl}/api/debit-notes-table`);
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
    navigate(`/creditview/${creditNoteId}`);
  };

  const handleCreateClick = () => navigate("/purchase/create_note");

  // Define tabs with their corresponding routes
  const tabs = [
    { name: 'Purchase Invoice', path: '/purchase/purchase-invoice' },
    { name: 'Purchase Order', path: '/purchase/purchase-order' },
    { name: 'Voucher', path: '/purchase/voucher' },
    { name: 'Debit Note', path: '/purchase/debit-note' },
    { name: 'Payables', path: '/purchase/payables' }
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
      navigate(`/purchase/debit-note/edit/${item.id}`);
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
    // {
    //   key: 'noteNumber',
    //   title: 'DEBIT NOTE NUMBER',
    //   render: (value, row) => (
    //     <button
    //       className="btn btn-link p-0 text-primary text-decoration-none"
    //       onClick={() => handleViewCreditNote(row.id)} // Use row.id which contains VoucherID
    //       title="Click to view debit note"
    //     >
    //       {value || 'N/A'}
    //     </button>
    //   ),
    //   style: { textAlign: 'center' }
    // },
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

  const handleRefreshData = () => {
    fetchCreditNotes();
  };

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
                    <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                      <option>2025</option>
                      <option>2024</option>
                      <option>2023</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-auto">
                  <button className="btn btn-success mt-4" onClick={handleRefreshData}>
                    <i className="bi bi-download me-1"></i> Download
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
                  <button className="btn btn-success mt-4" onClick={handleRefreshData}>
                    <i className="bi bi-download me-1"></i> Download Range
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

export default DebitNoteTable;