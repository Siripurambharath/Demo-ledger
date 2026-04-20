// BillOfSupplyTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './BillOfSupply.css';

const BillOfSupplyTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('BillOfSupply');

  // Sample bill of supply data
  const billOfSupplyData = [
    // Add your bill of supply data here
    // Example:
    // {
    //   customer: "ABC Enterprises",
    //   invoice: "BOS-001",
    //   totalAmount: "$1,000.00",
    //   payment: "Paid",
    //   date: "2025-07-01"
    // }
  ];

  // Bill of Supply stats data
  // const billOfSupplyStats = [
  //   { label: "Total Bills", value: "₹ 1,80,000", change: "+12%", type: "total" },
  //   { label: "Active Bills", value: "₹ 1,20,000", change: "+8%", type: "active" },
  //   { label: "Completed Bills", value: "₹ 50,000", change: "+15%", type: "completed" },
  //   { label: "Pending Bills", value: "₹ 10,000", change: "-5%", type: "pending" }
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

  const columns = [
    {
      key: 'customer',
      title: 'CUSTOMER',
      style: { textAlign: 'left' }
    },
    {
      key: 'invoice',
      title: 'BILL NUMBER',
      style: { textAlign: 'center' }
    },
    {
      key: 'totalAmount',
      title: 'TOTAL AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'payment',
      title: 'PAYMENT STATUS',
      style: { textAlign: 'center' }
    },
    {
      key: 'date',
      title: 'DATE',
      style: { textAlign: 'center' }
    }
  ];

  // Custom renderer for payment status
  const renderPaymentStatus = (item) => (
    <span className={`bill-payment-status bill-payment-status--${item.payment?.toLowerCase() || 'pending'}`}>
      {item.payment || 'Pending'}
    </span>
  );

  // Custom renderer for customer with additional info
  const renderCustomer = (item) => (
    <div className="bill-customer-cell">
      <strong className="bill-customer-name">{item.customer}</strong>
      {item.customerId && (
        <span className="bill-customer-id">ID: {item.customerId}</span>
      )}
    </div>
  );

  const enhancedColumns = [
    {
      key: 'customer',
      title: 'CUSTOMER',
      render: (item) => renderCustomer(item),
      style: { textAlign: 'left' }
    },
    {
      key: 'invoice',
      title: 'BILL NUMBER',
      style: { textAlign: 'center' }
    },
    {
      key: 'totalAmount',
      title: 'TOTAL AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'payment',
      title: 'PAYMENT STATUS',
      render: (item) => renderPaymentStatus(item),
      style: { textAlign: 'center' }
    },
    {
      key: 'date',
      title: 'BILL DATE',
      style: { textAlign: 'center' }
    }
  ];

//   const handleCreateClick = () => {
//     navigate("/createbilloflsupply");
//   };

  return (
    <div className="billofsupply-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`billofsupply-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="billofsupply-content-area">
          {/* ✅ Tabs Section */}
          <div className="billofsupply-tabs-section">
            <div className="billofsupply-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`billofsupply-tab ${activeTab === tab.name ? 'billofsupply-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="billofsupply-header-section">
            <div className="billofsupply-header-top">
              <div className="billofsupply-title-section">
                <h1 className="billofsupply-main-title">Bill of Supply Management</h1>
                <p className="billofsupply-subtitle">Create and manage bills of supply for your business</p>
              </div>
            </div>
          </div>

          {/* Bill of Supply Stats */}
          {/* <div className="billofsupply-stats-grid">
            {billOfSupplyStats.map((stat, index) => (
              <div key={index} className={`billofsupply-stat-card billofsupply-stat-card--${stat.type}`}>
                <h3 className="billofsupply-stat-label">{stat.label}</h3>
                <div className="billofsupply-stat-value">{stat.value}</div>
                <div className={`billofsupply-stat-change ${stat.change.startsWith("+") ? "billofsupply-stat-change--positive" : "billofsupply-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters and Actions Section */}
          <div className="billofsupply-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">Bill Of Supply Invoice Details</h5>

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
                    Create Bill
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Bills of Supply"
                data={billOfSupplyData}
                columns={enhancedColumns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search bills of supply..."
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

export default BillOfSupplyTable;