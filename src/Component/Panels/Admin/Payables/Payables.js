// PayablesTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './Payables.css';

const PayablesTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePayablesTab, setActivePayablesTab] = useState('ageing');
  const [activeTab, setActiveTab] = useState('Payables');
  const navigate = useNavigate();

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

  // Payables stats data
  const payablesStats = [
    { label: "Total Payables", value: "₹ 3,75,000", change: "+15%", type: "total" },
    { label: "Overdue Amount", value: "₹ 95,000", change: "+12%", type: "overdue" },
    { label: "Due This Week", value: "₹ 60,000", change: "+18%", type: "due" },
    { label: "Aging > 90 Days", value: "₹ 35,000", change: "-8%", type: "aging" }
  ];

  // Sample data for different tabs
  const ageingData = [
    // {
    //   sno: 1,
    //   name: "Supplier A",
    //   overdue0to30: "₹ 20,000",
    //   overdue31to60: "₹ 12,000",
    //   overdue61to90: "₹ 8,000",
    //   overdueAbove90: "₹ 5,000",
    //   upcoming0to30: "₹ 25,000",
    //   upcoming31to60: "₹ 18,000",
    //   upcoming61to90: "₹ 12,000",
    //   upcomingAbove90: "₹ 7,000",
    //   total: "₹ 1,07,000"
    // }
  ];

  const overdueData = [
    // {
    //   supplierId: "SUPP001",
    //   supplierName: "Supplier A",
    //   days0to30: "₹ 20,000",
    //   days31to60: "₹ 12,000",
    //   days61to90: "₹ 8,000",
    //   daysAbove90: "₹ 5,000",
    //   total: "₹ 45,000"
    // }
  ];

  const partyWiseData = [
    // {
    //   code: "SUPP001",
    //   supplier: "Supplier A",
    //   totalAmount: "₹ 1,50,000",
    //   debitAmount: "₹ 1,20,000",
    //   totalPayable: "₹ 30,000"
    // }
  ];

  const upcomingData = [
    // {
    //   supplierId: "SUPP001",
    //   supplierName: "Supplier A",
    //   days0to30: "₹ 25,000",
    //   days31to60: "₹ 18,000",
    //   days61to90: "₹ 12,000",
    //   daysAbove90: "₹ 7,000",
    //   total: "₹ 62,000"
    // }
  ];

  // Ageing Columns
  const ageingColumns = [
    {
      key: 'sno',
      title: 'S.No.',
      style: { textAlign: 'center', width: '80px' }
    },
    {
      key: 'name',
      title: 'Supplier Name',
      style: { textAlign: 'left' }
    },
    {
      key: 'overdue0to30',
      title: '0-30 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'overdue31to60',
      title: '31-60 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'overdue61to90',
      title: '61-90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'overdueAbove90',
      title: 'Above 90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'upcoming0to30',
      title: '0-30 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'upcoming31to60',
      title: '31-60 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'upcoming61to90',
      title: '61-90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'upcomingAbove90',
      title: 'Above 90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'total',
      title: 'Total',
      style: { textAlign: 'right', fontWeight: 'bold' }
    }
  ];

  // Overdue Columns
  const overdueColumns = [
    {
      key: 'supplierId',
      title: 'Supplier ID',
      style: { textAlign: 'center' }
    },
    {
      key: 'supplierName',
      title: 'Supplier Name',
      style: { textAlign: 'left' }
    },
    {
      key: 'days0to30',
      title: '0-30 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'days31to60',
      title: '31-60 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'days61to90',
      title: '61-90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'daysAbove90',
      title: 'After 90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'total',
      title: 'Total',
      style: { textAlign: 'right', fontWeight: 'bold' }
    }
  ];

  // Party Wise Columns
  const partyWiseColumns = [
    {
      key: 'code',
      title: 'Supplier Code',
      style: { textAlign: 'center' }
    },
    {
      key: 'supplier',
      title: 'Supplier Name',
      style: { textAlign: 'left' }
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      style: { textAlign: 'right' }
    },
    {
      key: 'debitAmount',
      title: 'Debit Amount',
      style: { textAlign: 'right' }
    },
    {
      key: 'totalPayable',
      title: 'Total Payable',
      style: { textAlign: 'right', fontWeight: 'bold' }
    }
  ];

  // Upcoming Columns
  const upcomingColumns = [
    {
      key: 'supplierId',
      title: 'Supplier ID',
      style: { textAlign: 'center' }
    },
    {
      key: 'supplierName',
      title: 'Supplier Name',
      style: { textAlign: 'left' }
    },
    {
      key: 'days0to30',
      title: '0-30 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'days31to60',
      title: '31-60 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'days61to90',
      title: '61-90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'daysAbove90',
      title: 'After 90 Days',
      style: { textAlign: 'right' }
    },
    {
      key: 'total',
      title: 'Total',
      style: { textAlign: 'right', fontWeight: 'bold' }
    }
  ];

  const handlePayablesTabClick = (tab) => {
    setActivePayablesTab(tab);
  };

  const getCurrentData = () => {
    switch (activePayablesTab) {
      case 'ageing':
        return ageingData;
      case 'overdue':
        return overdueData;
      case 'partyWise':
        return partyWiseData;
      case 'upcoming':
        return upcomingData;
      default:
        return ageingData;
    }
  };

  const getCurrentColumns = () => {
    switch (activePayablesTab) {
      case 'ageing':
        return ageingColumns;
      case 'overdue':
        return overdueColumns;
      case 'partyWise':
        return partyWiseColumns;
      case 'upcoming':
        return upcomingColumns;
      default:
        return ageingColumns;
    }
  };

  const getSearchPlaceholder = () => {
    switch (activePayablesTab) {
      case 'ageing':
        return 'Search ageing analysis...';
      case 'overdue':
        return 'Search overdue payables...';
      case 'partyWise':
        return 'Search party wise...';
      case 'upcoming':
        return 'Search upcoming payables...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className="payables-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`payables-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="payables-content-area">
          {/* ✅ Purchase Navigation Tabs Section */}
          <div className="payables-tabs-section">
            <div className="payables-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`payables-tab ${activeTab === tab.name ? 'payables-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="payables-header-section">
            <div className="payables-header-top">
              <div className="payables-title-section">
                <h1 className="payables-main-title">Payables Management</h1>
                <p className="payables-subtitle">Track and manage your accounts payable</p>
              </div>
            </div>
          </div>

          {/* Payables Stats */}
          {/* <div className="payables-stats-grid">
            {payablesStats.map((stat, index) => (
              <div key={index} className={`payables-stat-card payables-stat-card--${stat.type}`}>
                <h3 className="payables-stat-label">{stat.label}</h3>
                <div className="payables-stat-value">{stat.value}</div>
                <div className={`payables-stat-change ${stat.change.startsWith("+") ? "payables-stat-change--positive" : "payables-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Sub Tabs */}
          <div className="payables-sub-tabs-container">
            <div className="payables-sub-tabs mb-4">
              <div
                className={`payables-subtab ${activePayablesTab === 'ageing' ? 'active' : ''}`}
                onClick={() => handlePayablesTabClick('ageing')}
              >
                Ageing Analysis
              </div>
              <div
                className={`payables-subtab ${activePayablesTab === 'overdue' ? 'active' : ''}`}
                onClick={() => handlePayablesTabClick('overdue')}
              >
                Overdue Payables
              </div>
              <div
                className={`payables-subtab ${activePayablesTab === 'partyWise' ? 'active' : ''}`}
                onClick={() => handlePayablesTabClick('partyWise')}
              >
                Party Wise Payables
              </div>
              <div
                className={`payables-subtab ${activePayablesTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => handlePayablesTabClick('upcoming')}
              >
                Upcoming Payables
              </div>
            </div>

            {/* Tab Content */}
            <div className="payables-tab-content">
              <div className="quotation-container p-3">
                <h5 className="mb-3 fw-bold">
                  {activePayablesTab === 'ageing' && 'Ageing Analysis'}
                  {activePayablesTab === 'overdue' && 'Overdue Payables'}
                  {activePayablesTab === 'partyWise' && 'Party Wise Payables'}
                  {activePayablesTab === 'upcoming' && 'Upcoming Payables'}
                </h5>

                {/* Table Section */}
                <ReusableTable
                  title={
                    activePayablesTab === 'ageing' ? 'Ageing Analysis' :
                    activePayablesTab === 'overdue' ? 'Overdue Payables' :
                    activePayablesTab === 'partyWise' ? 'Party Wise Payables' :
                    'Upcoming Payables'
                  }
                  data={getCurrentData()}
                  columns={getCurrentColumns()}
                  initialEntriesPerPage={10}
                  searchPlaceholder={getSearchPlaceholder()}
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayablesTable;