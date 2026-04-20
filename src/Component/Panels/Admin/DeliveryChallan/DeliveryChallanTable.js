// DeliveryChallanTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './DeliveryChallan.css';

const DeliveryChallanTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('DeliveryChallan');

  // Sample delivery challan data
  const deliveryChallanData = [
    // Add your delivery challan data here
    // Example:
    // {
    //   customer: "John Doe",
    //   deliveryChallan: "DC-001",
    //   dcAmount: "$1,000.00",
    //   dispatched: "Truck No: MH01-AB-1234",
    //   created: "2025-07-01",
    //   status: "Dispatched"
    // }
  ];

  // Delivery Challan stats data
  // const deliveryStats = [
  //   { label: "Total Challans", value: "150", change: "+12%", type: "total" },
  //   { label: "Dispatched", value: "120", change: "+15%", type: "dispatched" },
  //   { label: "In Transit", value: "20", change: "+5%", type: "transit" },
  //   { label: "Delivered", value: "10", change: "+8%", type: "delivered" }
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

  // Custom renderers for table cells
  const renderCustomer = (item) => (
    <div className="delivery-customer-cell">
      <strong className="delivery-customer-name">{item.customer}</strong>
      {item.customerEmail && (
        <span className="delivery-customer-email">{item.customerEmail}</span>
      )}
    </div>
  );

  const renderDispatchedInfo = (item) => (
    <div className="delivery-dispatch-cell">
      <div className="delivery-vehicle">{item.dispatched}</div>
      {item.driverName && (
        <div className="delivery-driver">Driver: {item.driverName}</div>
      )}
    </div>
  );

  const renderStatus = (item) => (
    <span className={`delivery-status delivery-status--${item.status?.toLowerCase() || 'pending'}`}>
      {item.status || 'Pending'}
    </span>
  );

  const renderActions = (item) => (
    <div className="delivery-actions">
      <button 
        className="btn btn-sm btn-outline-primary me-1"
        // onClick={() => handleView(item)}
        title="View Details"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button 
        className="btn btn-sm btn-outline-success me-1"
        // onClick={() => handleEdit(item)}
        title="Edit"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className="btn btn-sm btn-outline-danger"
        // onClick={() => handleDelete(item)}
        title="Delete"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  const columns = [
    {
      key: 'customer',
      title: 'CUSTOMER',
      render: (item) => renderCustomer(item),
      style: { textAlign: 'left' }
    },
    {
      key: 'deliveryChallan',
      title: 'DELIVERY CHALLAN',
      style: { textAlign: 'center' }
    },
    {
      key: 'dcAmount',
      title: 'DC AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'dispatched',
      title: 'DISPATCHED / VEHICLE',
      render: (item) => renderDispatchedInfo(item),
      style: { textAlign: 'left' }
    },
    {
      key: 'created',
      title: 'CREATED',
      style: { textAlign: 'center' }
    },
    {
      key: 'status',
      title: 'STATUS',
      render: (item) => renderStatus(item),
      style: { textAlign: 'center' }
    },
    {
      key: 'actions',
      title: 'ACTION',
      render: (item) => renderActions(item),
      style: { textAlign: 'center', width: '120px' }
    }
  ];

//   const handleCreateClick = () => {
//     navigate("/create-delivery-challan");
//   };

//   const handleView = (item) => {
//     console.log('View delivery challan:', item);
//     // Navigate to view details page or show modal
//   };

//   const handleEdit = (item) => {
//     console.log('Edit delivery challan:', item);
//     // Navigate to edit page
//   };

//   const handleDelete = (item) => {
//     if (window.confirm(`Are you sure you want to delete delivery challan ${item.deliveryChallan}?`)) {
//       console.log('Delete delivery challan:', item);
//       // Implement delete functionality
//     }
//   };

  return (
    <div className="delivery-challan-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`delivery-challan-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="delivery-challan-content-area">
          {/* ✅ Tabs Section */}
          <div className="delivery-challan-tabs-section">
            <div className="delivery-challan-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`delivery-challan-tab ${activeTab === tab.name ? 'delivery-challan-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="delivery-challan-header-section">
            <div className="delivery-challan-header-top">
              <div className="delivery-challan-title-section">
                <h1 className="delivery-challan-main-title">Delivery Challan Management</h1>
                <p className="delivery-challan-subtitle">Create, manage and track all your delivery challans</p>
              </div>
            </div>
          </div>

          {/* Delivery Challan Stats */}
          {/* <div className="delivery-challan-stats-grid">
            {deliveryStats.map((stat, index) => (
              <div key={index} className={`delivery-challan-stat-card delivery-challan-stat-card--${stat.type}`}>
                <h3 className="delivery-challan-stat-label">{stat.label}</h3>
                <div className="delivery-challan-stat-value">{stat.value}</div>
                <div className={`delivery-challan-stat-change ${stat.change.startsWith("+") ? "delivery-challan-stat-change--positive" : "delivery-challan-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters and Actions Section */}
          <div className="delivery-challan-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Delivery Challan Details</h5>

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
                    Create Delivery Challan
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Delivery Challans"
                data={deliveryChallanData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search delivery challans..."
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

export default DeliveryChallanTable;