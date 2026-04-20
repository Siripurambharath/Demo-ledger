// CreateReceiptForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { Button } from 'react-bootstrap';
import './Receipts.css';

const CreateReceiptForm = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    receiptNumber: '',
    receiptDate: '',
    payee: '',
    paymentMethod: 'cash',
    
    // Payment Details
    amount: '',
    invoiceReference: '',
    description: '',
    
    // Accounting Details
    accountHead: '',
    taxAmount: 0,
    totalAmount: 0,
    notes: ''
  });

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'payment', label: 'Payment Details' },
    { id: 'accounting', label: 'Accounting Details' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Calculate total amount if amount or tax changes
    if (field === 'amount' || field === 'taxAmount') {
      const amount = parseFloat(formData.amount) || 0;
      const taxAmount = parseFloat(formData.taxAmount) || 0;
      const totalAmount = amount + taxAmount;
      
      setFormData(prev => ({
        ...prev,
        totalAmount: field === 'amount' ? totalAmount : prev.totalAmount
      }));
    }
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const totalAmount = amount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      totalAmount
    }));
  };

  const handleNext = () => {
    if (activeTab === 'basic') setActiveTab('payment');
    else if (activeTab === 'payment') setActiveTab('accounting');
  };

  const handleBack = () => {
    if (activeTab === 'payment') setActiveTab('basic');
    else if (activeTab === 'accounting') setActiveTab('payment');
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Receipt Data:', formData);
    alert('Receipt created successfully!');
    navigate("/receipts"); // Redirect back to receipts list
  };

  const handleCancel = () => {
    navigate("/receipts"); // Redirect back to receipts list
  };

  return (
    <div className="create-receipt-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`create-receipt-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="create-receipt-content-area">
          <div className="create-receipt-header-section">
            <div className="create-receipt-header-top">
              <div className="create-receipt-title-section">
                <h1 className="create-receipt-main-title">Create New Receipt</h1>
                <p className="create-receipt-subtitle">Record payment receipts and manage accounting</p>
              </div>

              {/* Tab Navigation */}
              <div className="create-receipt-tab-navigation">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`create-receipt-tab ${activeTab === tab.id ? "create-receipt-tab--active" : ""}`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="create-receipt-form-container">
            <div className="quotation-container p-4">
              
              {/* Basic Information Section */}
              {activeTab === 'basic' && (
                <div className="receipt-form-section">
                  <h2 className="receipt-section-title">Basic Information</h2>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Receipt Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.receiptNumber}
                        onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                        required
                        placeholder="e.g., RCP-001"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Receipt Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.receiptDate}
                        onChange={(e) => handleInputChange('receiptDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payee *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.payee}
                        onChange={(e) => handleInputChange('payee', e.target.value)}
                        required
                        placeholder="Name of the payer"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Method *</label>
                      <select
                        className="form-control"
                        value={formData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="digital">Digital Payment</option>
                      </select>
                    </div>
                  </div>

                  <div className="receipt-form-actions mt-4">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handleNext}
                    >
                      Next: Payment Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Details Section */}
              {activeTab === 'payment' && (
                <div className="receipt-form-section">
                  <h2 className="receipt-section-title">Payment Details</h2>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Amount *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Invoice Reference</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.invoiceReference}
                        onChange={(e) => handleInputChange('invoiceReference', e.target.value)}
                        placeholder="Reference invoice number"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Payment Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Description of the payment received..."
                      />
                    </div>
                  </div>

                  <div className="receipt-form-actions mt-4">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handleNext}
                    >
                      Next: Accounting Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Accounting Details Section */}
              {activeTab === 'accounting' && (
                <div className="receipt-form-section">
                  <h2 className="receipt-section-title">Accounting Details</h2>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Account Head *</label>
                      <select
                        className="form-control"
                        value={formData.accountHead}
                        onChange={(e) => handleInputChange('accountHead', e.target.value)}
                        required
                      >
                        <option value="">Select Account Head</option>
                        <option value="sales">Sales Revenue</option>
                        <option value="service">Service Income</option>
                        <option value="advance">Advance Payment</option>
                        <option value="other">Other Income</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tax Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.taxAmount}
                        onChange={(e) => handleInputChange('taxAmount', e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mt-4">
                        <button
                          type="button"
                          className="btn btn-info me-3"
                          onClick={calculateTotal}
                        >
                          Calculate Total
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Total Amount</label>
                      <input
                        type="text"
                        className="form-control fw-bold"
                        value={`$${formData.totalAmount.toFixed(2)}`}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', fontSize: '1.1em' }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Additional notes or remarks..."
                      />
                    </div>
                  </div>

                  <div className="receipt-form-actions mt-4">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleSubmit}
                    >
                      Create Receipt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReceiptForm;