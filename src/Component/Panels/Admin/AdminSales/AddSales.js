import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './AddSales.css';
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";

const LogSalesVisit = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    retailerName: '',
    visitType: '',
    visitOutcome: '',
    salesAmount: '',
    transactionType: '',
    notes: ''
  });

  const visitTypes = [
    'Select visit type',
    'Routine Visit',
    'Follow Up',
    'Sales Call',
    'Collection Visit',
    'New Retailer Onboarding',
    'Complaint Resolution'
  ];

  const visitOutcomes = [
    'Select outcome',
    'Successful',
    'Pending',
    'Cancelled',
    'Rescheduled',
    'No Order',
    'Follow Up Required'
  ];

  const transactionTypes = [
    'Select type',
    'Pakka',
    'Kaccha',
    'Cash',
    'Credit',
    'Digital Payment',
    'Mixed'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sales visit submitted:', formData);
    navigate("/admindashboard/sales");
  };

  const handleCancel = () => {
    navigate("/admindashboard/sales");
  };

  return (
    <>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`sales-form-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sales-form-wrapper">
          <div className="sales-form-header">
            <h1 className="sales-form-title">Log Sales Visit</h1>
            <p className="sales-form-subtitle">
              Record sales visit details and outcomes
            </p>
          </div>

          <form className="sales-form" onSubmit={handleSubmit}>
            {/* Retailer Name - Full Width */}
            <div className="form-group full-width">
              <label htmlFor="retailerName" className="form-label">
                Retailer Name *
              </label>
              <select
                id="retailerName"
                name="retailerName"
                value={formData.retailerName}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select or enter retailer name</option>
                <option value="Sharma Electronics">Sharma Electronics</option>
                <option value="Gupta General Store">Gupta General Store</option>
                <option value="Khan Textiles">Khan Textiles</option>
                <option value="Verma Groceries">Verma Groceries</option>
                <option value="Patel Hardware">Patel Hardware</option>
              </select>
            </div>

            {/* Visit Details - Three Fields Per Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="visitType" className="form-label">
                  Visit Type *
                </label>
                <select
                  id="visitType"
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {visitTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="visitOutcome" className="form-label">
                  Visit Outcome *
                </label>
                <select
                  id="visitOutcome"
                  name="visitOutcome"
                  value={formData.visitOutcome}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {visitOutcomes.map((outcome, index) => (
                    <option key={index} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salesAmount" className="form-label">
                  Sales Amount (₹)
                </label>
                <input
                  type="number"
                  id="salesAmount"
                  name="salesAmount"
                  value={formData.salesAmount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Second Row - Three Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transactionType" className="form-label">
                  Transaction Type
                </label>
                <select
                  id="transactionType"
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  className="form-select"
                >
                  {transactionTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group spacer">
                {/* Empty spacer to maintain 3-column layout */}
              </div>

              <div className="form-group spacer">
                {/* Empty spacer to maintain 3-column layout */}
              </div>
            </div>

            {/* Notes - Full Width */}
            <div className="form-group full-width">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Visit notes and observations"
                rows="4"
                className="form-textarea"
              />
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Log Visit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LogSalesVisit;