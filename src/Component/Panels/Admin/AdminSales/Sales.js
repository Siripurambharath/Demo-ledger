import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Sales.css";

function Sales() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("sales"); // "sales" or "transactions"
  const navigate = useNavigate();

  // Sales Dashboard Data
  const salesStats = [
    { label: "Total Sales", value: "₹ 88,000", change: "+12%", type: "total" },
    { label: "Kaccha Sales", value: "₹ 28,000", change: "+5%", type: "kaccha" },
    { label: "Pakka Sales", value: "₹ 60,000", change: "+15%", type: "pakka" },
    { label: "Overdue", value: "₹ 15,000", change: "-8%", type: "overdue" }
  ];

  // Transactions Stats Data
  const transactionsStats = [
    { label: "Total Transactions", value: "₹ 1,20,000", change: "+18%", type: "total" },
    { label: "Completed", value: "₹ 95,000", change: "+15%", type: "completed" },
    { label: "Pending", value: "₹ 10,000", change: "+3%", type: "pending" },
    { label: "Overdue", value: "₹ 15,000", change: "-5%", type: "overdue" }
  ];

  const salesVisitsData = [
    {
      id: "SV001",
      retailer: "Sharma Electronics",
      retailerId: "R001",
      date: "2024-01-15",
      type: "Routine",
      outcome: "Successful",
      amount: "₹ 45,000",
      transactionType: "Pakka",
      staff: "Ravi Kumar"
    },
    {
      id: "SV002",
      retailer: "Gupta General Store",
      retailerId: "R002",
      date: "2024-01-14",
      type: "Follow Up",
      outcome: "Pending",
      amount: "₹ 12,000",
      transactionType: "Kaccha",
      staff: "Priya Singh"
    }
  ];

  const transactionsData = [
    {
      id: "TXN001",
      retailer: "Sharma Electronics",
      description: "Electronics bulk order - smartphones and accessories",
      amount: "₹ 45,000",
      type: "Pakka",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      status: "Completed"
    },
    {
      id: "TXN002",
      retailer: "Khan Textiles",
      description: "Cash payment for textile inventory",
      amount: "₹ 28,000",
      type: "Kaccha",
      date: "2024-01-14",
      dueDate: "N/A",
      status: "Completed"
    },
    {
      id: "TXN003",
      retailer: "Verma Groceries",
      description: "Grocery supplies - payment overdue",
      amount: "₹ 15,000",
      type: "Pakka",
      date: "2024-01-10",
      dueDate: "2024-01-25",
      status: "Overdue"
    }
  ];

  // Custom renderers
  const renderSalesVisitRetailer = (item) => (
    <div className="sales-table__retailer-cell">
      <strong className="sales-table__retailer-name">{item.retailer}</strong>
      <span className="sales-table__retailer-id">ID: {item.retailerId}</span>
    </div>
  );

  const renderSalesVisitDateType = (item) => (
    <div className="sales-table__date-type-cell">
      <div className="sales-table__date">{item.date}</div>
      <div className="sales-table__type">{item.type}</div>
    </div>
  );

  const renderSalesVisitAmount = (item) => (
    <div className="sales-table__amount-cell">
      <div className="sales-table__amount">{item.amount}</div>
      <div className={`sales-table__transaction-type sales-table__transaction-type--${item.transactionType.toLowerCase()}`}>
        {item.transactionType}
      </div>
    </div>
  );

  const renderSalesVisitOutcome = (item) => (
    <span className={`sales-table__outcome sales-table__outcome--${item.outcome.toLowerCase()}`}>
      {item.outcome}
    </span>
  );

  const renderTransactionRetailer = (item) => (
    <div className="sales-transactions__retailer-cell">
      <strong className="sales-transactions__retailer-name">{item.retailer}</strong>
      <span className="sales-transactions__retailer-description">{item.description}</span>
    </div>
  );

  const renderTransactionAmount = (item) => (
    <div className="sales-transactions__amount-cell">
      <div className="sales-transactions__amount">{item.amount}</div>
      <div className={`sales-transactions__type sales-transactions__type--${item.type.toLowerCase()}`}>
        {item.type}
      </div>
    </div>
  );

  const renderTransactionStatus = (item) => (
    <span className={`sales-transactions__status sales-transactions__status--${item.status.toLowerCase()}`}>
      {item.status}
    </span>
  );

  // Sales Visits Columns
  const salesVisitsColumns = [
    { key: "id", title: "Visit ID", style: { width: "100px" } },
    { key: "retailer", title: "Retailer", render: (item) => renderSalesVisitRetailer(item) },
    { key: "dateType", title: "Date & Type", render: (item) => renderSalesVisitDateType(item) },
    { key: "outcome", title: "Outcome", render: (item) => renderSalesVisitOutcome(item) },
    { key: "amount", title: "Sales Amount", render: (item) => renderSalesVisitAmount(item) },
    { key: "staff", title: "Staff" }
  ];

  // Transactions Columns
  const transactionsColumns = [
    { key: "id", title: "Transaction ID", style: { width: "120px" } },
    { key: "retailer", title: "Retailer", render: (item) => renderTransactionRetailer(item) },
    { key: "amount", title: "Amount & Type", render: (item) => renderTransactionAmount(item) },
    { key: "date", title: "Date", style: { width: "120px" } },
    { key: "dueDate", title: "Due Date", style: { width: "120px" } },
    { key: "status", title: "Status", render: (item) => renderTransactionStatus(item) }
  ];

  return (
    <div className="sales-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`sales-main-content ${isCollapsed ? "collapsed" : ""}`}>
        {/* AdminHeader is now properly positioned */}
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="sales-content-area">
          <div className="sales-header-section">
            <div className="sales-header-top">
              <div className="sales-title-section">
                <h1 className="sales-main-title">Sales & Transactions</h1>
                <p className="sales-subtitle">Manage sales visits, track transactions and payment status</p>
              </div>

              {/* Tab Navigation */}
              <div className="sales-tab-navigation">
                <button
                  className={`sales-tab ${activeTab === "sales" ? "sales-tab--active" : ""}`}
                  onClick={() => setActiveTab("sales")}
                >
                  Sales Dashboard
                </button>
                <button
                  className={`sales-tab ${activeTab === "transactions" ? "sales-tab--active" : ""}`}
                  onClick={() => setActiveTab("transactions")}
                >
                  Transactions
                </button>
              </div>
            </div>
          </div>

          {/* SALES TAB */}
          {activeTab === "sales" && (
            <div className="sales-dashboard">
              <div className="sales-stats-grid">
                {salesStats.map((stat, index) => (
                  <div key={index} className={`sales-stat-card sales-stat-card--${stat.type}`}>
                    <h3 className="sales-stat-label">{stat.label}</h3>
                    <div className="sales-stat-value">{stat.value}</div>
                    <div className={`sales-stat-change ${stat.change.startsWith("+") ? "sales-stat-change--positive" : "sales-stat-change--negative"}`}>
                      {stat.change} from last month
                    </div>
                  </div>
                ))}
              </div>

              <div className="sales-visits-section">
                <div className="sales-section-header">
                  <div className="sales-section-title-wrapper">
                    <h2 className="sales-section-title">Sales Visits ({salesVisitsData.length})</h2>
                    <p className="sales-section-description">Track your retailer visits and outcomes</p>
                  </div>
                  <button className="sales-log-visit-button" onClick={() => navigate("/admindashboard/sales/add")}>
                    <span className="sales-log-visit-icon">+</span>
                    Log Visit
                  </button>
                </div>

                <div className="sales-table-container">
                  <ReusableTable
                    data={salesVisitsData}
                    columns={salesVisitsColumns}
                    initialEntriesPerPage={10}
                    searchPlaceholder="Search sales visits..."
                    showSearch={true}
                    showEntriesSelector={true}
                    showPagination={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <div className="sales-transactions">
              <div className="sales-stats-grid">
                {transactionsStats.map((stat, index) => (
                  <div key={index} className={`sales-stat-card sales-stat-card--${stat.type}`}>
                    <h3 className="sales-stat-label">{stat.label}</h3>
                    <div className="sales-stat-value">{stat.value}</div>
                    <div className={`sales-stat-change ${stat.change.startsWith("+") ? "sales-stat-change--positive" : "sales-stat-change--negative"}`}>
                      {stat.change} from last month
                    </div>
                  </div>
                ))}
              </div>

              <div className="sales-transactions-header">
                <div className="sales-transactions-title-wrapper">
                  <h2 className="sales-transactions-title">Transactions ({transactionsData.length})</h2>
                  <p className="sales-transactions-description">All retailer transactions and payment status</p>
                </div>
              </div>

              <div className="sales-transactions-table-container">
                <ReusableTable
                  data={transactionsData}
                  columns={transactionsColumns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search transactions..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;