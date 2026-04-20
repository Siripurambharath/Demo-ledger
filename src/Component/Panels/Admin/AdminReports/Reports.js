import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import SalesReport from "./SalesReport";
import ExpenseReport from "./ExpenseReport";
import OfferReport from "./OfferReports";
import StockReport from "./StockReport";
import RetailerReports from "./RetailerReports";
import GstReport from "./GstReport";
import "./Reports.css";
import { FaChartBar } from "react-icons/fa";
import HsnReport from "./HsnReport";

function Reports() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeReport, setActiveReport] = useState("retailers");
  const [loading, setLoading] = useState(false);

  // Export handlers

  // Render report content
const renderReportContent = () => {
  switch (activeReport) {
    case "sales":
      return <SalesReport />;
    case "expense":
      return <ExpenseReport />;
    case "offer":
      return <OfferReport />;
    case "retailers":
      return <RetailerReports loading={loading} setLoading={setLoading} />;
    case "catalogue":
      return <StockReport />;
         case "gst":
      return <GstReport />;
           case "hsn":
      return <HsnReport />;
    default:
      return <RetailerReports loading={loading} setLoading={setLoading} />;
  }
};

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="reports-container">
          {/* Header */}
          <div className="reports-header">
            <div className="header-content">
              <div className="header-text">
                <h1>Business Reports</h1>
                <p>Comprehensive analytics and insights for your business</p>
              </div>
      
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="reports-nav-section">
            <div className="reports-nav-content">
              <div className="report-links-grid">
                <div className="report-link-item" onClick={() => setActiveReport("retailers")}>
                  <span className={`report-link-text ${activeReport === "retailers" ? "active" : ""}`}>
                    Retailers Reports
                  </span>
                </div>
                <div className="report-link-item" onClick={() => setActiveReport("expense")}>
                  <span className={`report-link-text ${activeReport === "expense" ? "active" : ""}`}>
                    Expense Reports
                  </span>
                </div>
                <div className="report-link-item" onClick={() => setActiveReport("offer")}>
                  <span className={`report-link-text ${activeReport === "offer" ? "active" : ""}`}>
                    Offer Reports
                  </span>
                </div>
                <div className="report-link-item" onClick={() => setActiveReport("sales")}>
                  <span className={`report-link-text ${activeReport === "sales" ? "active" : ""}`}>
                    Sales Reports
                  </span>
                </div>
                  <div className="report-link-item" onClick={() => setActiveReport("catalogue")}>
                  <span className={`report-link-text ${activeReport === "catalogue" ? "active" : ""}`}>
                  Stock Report
                  </span>
                </div>
                   <div className="report-link-item" onClick={() => setActiveReport("gst")}>
                  <span className={`report-link-text ${activeReport === "gst" ? "active" : ""}`}>
                  GST Report
                  </span>
                </div>
                   <div className="report-link-item" onClick={() => setActiveReport("hsn")}>
                  <span className={`report-link-text ${activeReport === "hsn" ? "active" : ""}`}>
                  HSN Report
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
}

export default Reports;