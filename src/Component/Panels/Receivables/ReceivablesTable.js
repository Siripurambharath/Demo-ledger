// ReceivablesTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../Layouts/TableLayout/DataTable';
import './Receivables.css';

const ReceivablesTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeReceivablesTab, setActiveReceivablesTab] = useState('ageing');
  const [activeTab, setActiveTab] = useState('Receivables');
  const navigate = useNavigate();

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

  // Receivables stats data
  // const receivablesStats = [
  //   { label: "Total Receivables", value: "₹ 5,00,000", change: "+12%", type: "total" },
  //   { label: "Overdue Amount", value: "₹ 1,50,000", change: "+8%", type: "overdue" },
  //   { label: "Due This Week", value: "₹ 75,000", change: "+15%", type: "due" },
  //   { label: "Aging > 90 Days", value: "₹ 50,000", change: "-5%", type: "aging" }
  // ];

  // Sample data for different tabs
  const ageingData = [
    // {
    //   sno: 1,
    //   name: "Customer A",
    //   overdue0to30: "₹ 25,000",
    //   overdue31to60: "₹ 15,000",
    //   overdue61to90: "₹ 8,000",
    //   overdueAbove90: "₹ 2,000",
    //   upcoming0to30: "₹ 30,000",
    //   upcoming31to60: "₹ 20,000",
    //   upcoming61to90: "₹ 10,000",
    //   upcomingAbove90: "₹ 5,000",
    //   total: "₹ 1,15,000"
    // }
  ];

  const overdueData = [
    // {
    //   customerId: "CUST001",
    //   customerName: "Customer A",
    //   days0to30: "₹ 25,000",
    //   days31to60: "₹ 15,000",
    //   days61to90: "₹ 8,000",
    //   daysAbove90: "₹ 2,000",
    //   total: "₹ 50,000"
    // }
  ];

  const partyWiseData = [
    // {
    //   code: "CUST001",
    //   customer: "Customer A",
    //   totalAmount: "₹ 2,00,000",
    //   creditAmount: "₹ 1,50,000",
    //   totalReceivable: "₹ 50,000"
    // }
  ];

  const upcomingData = [
    // {
    //   customerId: "CUST001",
    //   customerName: "Customer A",
    //   days0to30: "₹ 30,000",
    //   days31to60: "₹ 20,000",
    //   days61to90: "₹ 10,000",
    //   daysAbove90: "₹ 5,000",
    //   total: "₹ 65,000"
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
      title: 'Name',
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
      key: 'customerId',
      title: 'Customer ID',
      style: { textAlign: 'center' }
    },
    {
      key: 'customerName',
      title: 'Customer Name',
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
      title: 'Code',
      style: { textAlign: 'center' }
    },
    {
      key: 'customer',
      title: 'Customer',
      style: { textAlign: 'left' }
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      style: { textAlign: 'right' }
    },
    {
      key: 'creditAmount',
      title: 'Credit Amount',
      style: { textAlign: 'right' }
    },
    {
      key: 'totalReceivable',
      title: 'Total Receivable',
      style: { textAlign: 'right', fontWeight: 'bold' }
    }
  ];

  // Upcoming Columns
  const upcomingColumns = [
    {
      key: 'customerId',
      title: 'Customer ID',
      style: { textAlign: 'center' }
    },
    {
      key: 'customerName',
      title: 'Customer Name',
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

  const handleReceivablesTabClick = (tab) => {
    setActiveReceivablesTab(tab);
  };

  const getCurrentData = () => {
    switch (activeReceivablesTab) {
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
    switch (activeReceivablesTab) {
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
    switch (activeReceivablesTab) {
      case 'ageing':
        return 'Search ageing analysis...';
      case 'overdue':
        return 'Search overdue receivables...';
      case 'partyWise':
        return 'Search party wise...';
      case 'upcoming':
        return 'Search upcoming receivables...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className="receivables-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`receivables-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="receivables-content-area">
          {/* ✅ Sales Navigation Tabs Section */}
          <div className="receivables-tabs-section">
            <div className="receivables-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`receivables-tab ${activeTab === tab.name ? 'receivables-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="receivables-header-section">
            <div className="receivables-header-top">
              <div className="receivables-title-section">
                <h1 className="receivables-main-title">Receivables Management</h1>
                <p className="receivables-subtitle">Track and manage your accounts receivable</p>
              </div>
            </div>
          </div>

          {/* Receivables Stats */}
          {/* <div className="receivables-stats-grid">
            {receivablesStats.map((stat, index) => (
              <div key={index} className={`receivables-stat-card receivables-stat-card--${stat.type}`}>
                <h3 className="receivables-stat-label">{stat.label}</h3>
                <div className="receivables-stat-value">{stat.value}</div>
                <div className={`receivables-stat-change ${stat.change.startsWith("+") ? "receivables-stat-change--positive" : "receivables-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Sub Tabs */}
          <div className="receivables-sub-tabs-container">
            <div className="receivables-sub-tabs mb-4">
              <div
                className={`receivables-subtab ${activeReceivablesTab === 'ageing' ? 'active' : ''}`}
                onClick={() => handleReceivablesTabClick('ageing')}
              >
                Ageing Analysis
              </div>
              <div
                className={`receivables-subtab ${activeReceivablesTab === 'overdue' ? 'active' : ''}`}
                onClick={() => handleReceivablesTabClick('overdue')}
              >
                Overdue Receivables
              </div>
              <div
                className={`receivables-subtab ${activeReceivablesTab === 'partyWise' ? 'active' : ''}`}
                onClick={() => handleReceivablesTabClick('partyWise')}
              >
                Party Wise Receivables
              </div>
              <div
                className={`receivables-subtab ${activeReceivablesTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => handleReceivablesTabClick('upcoming')}
              >
                Upcoming Receivables
              </div>
            </div>

            {/* Tab Content */}
            <div className="receivables-tab-content">
              <div className="quotation-container p-3">
                <h5 className="mb-3 fw-bold">
                  {activeReceivablesTab === 'ageing' && 'Ageing Analysis'}
                  {activeReceivablesTab === 'overdue' && 'Overdue Receivables'}
                  {activeReceivablesTab === 'partyWise' && 'Party Wise Receivables'}
                  {activeReceivablesTab === 'upcoming' && 'Upcoming Receivables'}
                </h5>

                {/* Table Section */}
                <ReusableTable
                  title={
                    activeReceivablesTab === 'ageing' ? 'Ageing Analysis' :
                    activeReceivablesTab === 'overdue' ? 'Overdue Receivables' :
                    activeReceivablesTab === 'partyWise' ? 'Party Wise Receivables' :
                    'Upcoming Receivables'
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

export default ReceivablesTable;