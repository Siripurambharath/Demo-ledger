import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './PurchaseOrder.css';

const PurchaseOrderTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Purchase Order');
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');

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

  // Sample purchase order data
  const purchaseOrderData = [
    // Add your purchase order data here
    // Example:
    // {
    //   supplierName: "ABC Suppliers",
    //   number: "PO-001",
    //   amount: "₹ 50,000.00",
    //   created: "2025-07-01",
    //   action: "View"
    // }
  ];

  // Purchase order stats data
  const purchaseOrderStats = [
    { label: "Total Purchase Orders", value: "₹ 3,50,000", change: "+20%", type: "total" },
    { label: "Completed Orders", value: "₹ 2,80,000", change: "+18%", type: "completed" },
    { label: "Pending Orders", value: "₹ 55,000", change: "+10%", type: "pending" },
    { label: "Cancelled Orders", value: "₹ 15,000", change: "-2%", type: "cancelled" }
  ];

  const columns = [
    {
      key: 'supplierName',
      title: 'SUPPLIER NAME',
      style: { textAlign: 'left' }
    },
    {
      key: 'number',
      title: 'NUMBER',
      style: { textAlign: 'center' }
    },
    {
      key: 'amount',
      title: 'AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'created',
      title: 'CREATED',
      style: { textAlign: 'center' }
    },
    {
      key: 'action',
      title: 'ACTION',
      style: { textAlign: 'center' },
      render: (item, index) => (
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => handleViewClick(item)}
        >
          View
        </button>
      )
    }
  ];

  const handleCreateClick = () => {
    navigate("/purchase/create-purchase-order");
  };

  const handleViewClick = (order) => {
    // Handle view action
    console.log('View order:', order);
    // navigate(`/purchase/purchase-order/${order.id}`);
  };

  const handleDownloadMonth = () => {
    // Handle month download
    console.log('Download month data:', month, year);
  };

  const handleDownloadRange = () => {
    // Handle date range download
    console.log('Download range data:', startDate, endDate);
  };

  return (
    <div className="purchase-order-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`purchase-order-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="purchase-order-content-area">
          {/* ✅ Purchase Navigation Tabs Section */}
          <div className="purchase-order-tabs-section">
            <div className="purchase-order-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`purchase-order-tab ${activeTab === tab.name ? 'purchase-order-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="purchase-order-header-section">
            <div className="purchase-order-header-top">
              <div className="purchase-order-title-section">
                <h1 className="purchase-order-main-title">Purchase Order Management</h1>
                <p className="purchase-order-subtitle">Create, manage and track all your purchase orders</p>
              </div>
            </div>
          </div>

          {/* Purchase Order Stats */}
          {/* <div className="purchase-order-stats-grid">
            {purchaseOrderStats.map((stat, index) => (
              <div key={index} className={`purchase-order-stat-card purchase-order-stat-card--${stat.type}`}>
                <h3 className="purchase-order-stat-label">{stat.label}</h3>
                <div className="purchase-order-stat-value">{stat.value}</div>
                <div className={`purchase-order-stat-change ${stat.change.startsWith("+") ? "purchase-order-stat-change--positive" : "purchase-order-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters and Actions Section */}
          <div className="purchase-order-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Purchase Order Details</h5>

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
                  <button className="btn btn-success mt-4" onClick={handleDownloadMonth}>
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
                  <button className="btn btn-success mt-4" onClick={handleDownloadRange}>
                    <i className="bi bi-download me-1"></i> Download Range
                  </button>
                </div>

                <div className="col-md-auto">
                  <button 
                    className="btn btn-info text-white mt-4"
                    onClick={handleCreateClick}
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Purchase Orders"
                data={purchaseOrderData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search purchase orders..."
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

export default PurchaseOrderTable;