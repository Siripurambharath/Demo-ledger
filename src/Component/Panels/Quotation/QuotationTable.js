// QuotationsTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../Layouts/TableLayout/DataTable';
import './Quotation.css';

const QuotationsTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Quotations');

  // Sample quotation data
  const quotationData = [
    // Add your quotation data here
    // Example:
    // {
    //   customerName: "ABC Corporation",
    //   number: "QTN-001",
    //   amount: "$5,000.00",
    //   created: "2025-07-01",
    //   status: "Sent"
    // }
  ];

  // Quotation stats data
  // const quotationStats = [
  //   { label: "Total Quotations", value: "₹ 5,00,000", change: "+12%", type: "total" },
  //   { label: "Sent Quotations", value: "₹ 3,50,000", change: "+15%", type: "sent" },
  //   { label: "Approved Quotations", value: "₹ 1,20,000", change: "+8%", type: "approved" },
  //   { label: "Pending Quotations", value: "₹ 30,000", change: "-5%", type: "pending" }
  // ];

  // Define tabs with their corresponding routes
  const tabs = [
    { name: 'Invoices', path: '/sales/invoices' },
    { name: 'Receipts', path: '/sales/receipts' },
    { name: 'Quotations', path: '/sales/quotations' },
    { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
    { name: 'CreditNote', path: '/sales/credit_note' },
    { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
    { name: 'Receivables', path: '/sales/receivables' }
  ];

  // Handle tab click - navigate to corresponding route
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Custom renderers for quotation data
  const renderCustomerName = (item) => (
    <div className="quotations-table__customer-cell">
      <strong className="quotations-table__customer-name">{item.customerName}</strong>
      {item.company && <span className="quotations-table__company-name">{item.company}</span>}
    </div>
  );

  const renderQuotationNumber = (item) => (
    <div className="quotations-table__number-cell">
      <span className="quotations-table__number">{item.number}</span>
      {item.reference && <span className="quotations-table__reference">Ref: {item.reference}</span>}
    </div>
  );

  const renderAmount = (item) => (
    <div className="quotations-table__amount-cell">
      <div className="quotations-table__amount">{item.amount}</div>
      {item.validity && <div className="quotations-table__validity">Valid until: {item.validity}</div>}
    </div>
  );

  const renderStatus = (item) => (
    <span className={`quotations-table__status quotations-table__status--${item.status?.toLowerCase() || 'pending'}`}>
      {item.status || 'Draft'}
    </span>
  );

  const renderAction = (item) => (
    <div className="quotations-table__actions">
      <button 
        className="btn btn-sm btn-outline-primary me-1"
        onClick={() => handleViewQuotation(item)}
        title="View Quotation"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button 
        className="btn btn-sm btn-outline-success me-1"
        onClick={() => handleEditQuotation(item)}
        title="Edit Quotation"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className="btn btn-sm btn-outline-info"
        onClick={() => handleSendQuotation(item)}
        title="Send Quotation"
      >
        <i className="bi bi-send"></i>
      </button>
    </div>
  );

  const columns = [
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      render: (item) => renderCustomerName(item),
      style: { textAlign: 'left' }
    },
    {
      key: 'number',
      title: 'QUOTATION NUMBER',
      render: (item) => renderQuotationNumber(item),
      style: { textAlign: 'center' }
    },
    {
      key: 'amount',
      title: 'AMOUNT',
      render: (item) => renderAmount(item),
      style: { textAlign: 'right' }
    },
    {
      key: 'created',
      title: 'CREATED DATE',
      style: { textAlign: 'center' }
    },
    {
      key: 'status',
      title: 'STATUS',
      render: (item) => renderStatus(item),
      style: { textAlign: 'center' }
    },
    {
      key: 'action',
      title: 'ACTION',
      render: (item) => renderAction(item),
      style: { textAlign: 'center', width: '150px' }
    }
  ];

//   const handleCreateClick = () => {
//     navigate("/createquotation");
//   };

  const handleViewQuotation = (quotation) => {
    console.log('View quotation:', quotation);
    // Navigate to view quotation details
    // navigate(`/quotations/${quotation.id}`);
  };

  const handleEditQuotation = (quotation) => {
    console.log('Edit quotation:', quotation);
    // Navigate to edit quotation
    // navigate(`/quotations/${quotation.id}/edit`);
  };

  const handleSendQuotation = (quotation) => {
    console.log('Send quotation:', quotation);
    // Implement send quotation logic
    alert(`Quotation ${quotation.number} sent successfully!`);
  };

  return (
    <div className="quotations-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`quotations-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="quotations-content-area">
          {/* ✅ Tabs Section */}
          <div className="quotations-tabs-section">
            <div className="quotations-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`quotations-tab ${activeTab === tab.name ? 'quotations-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="quotations-header-section">
            <div className="quotations-header-top">
              <div className="quotations-title-section">
                <h1 className="quotations-main-title">Quotation Management</h1>
                <p className="quotations-subtitle">Create, manage and track all your quotations</p>
              </div>
            </div>
          </div>

          {/* Quotation Stats */}
          {/* <div className="quotations-stats-grid">
            {quotationStats.map((stat, index) => (
              <div key={index} className={`quotations-stat-card quotations-stat-card--${stat.type}`}>
                <h3 className="quotations-stat-label">{stat.label}</h3>
                <div className="quotations-stat-value">{stat.value}</div>
                <div className={`quotations-stat-change ${stat.change.startsWith("+") ? "quotations-stat-change--positive" : "quotations-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters and Actions Section */}
          <div className="quotations-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Quotation Details</h5>

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
                  <button className="btn btn-success mt-4">
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
                  <button className="btn btn-success mt-4">
                    <i className="bi bi-download me-1"></i> Download Range
                  </button>
                </div>

                <div className="col-md-auto">
                  <button 
                    className="btn btn-info text-white mt-4"
                    // onClick={handleCreateClick}
                  >
                    Create Quotation
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Quotations"
                data={quotationData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search quotations..."
                showSearch={true}
                showEntriesSelector={true}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationsTable;