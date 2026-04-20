// frontend/src/components/Sales/Receipts/ReceiptView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { baseurl } from '../../../BaseURL/BaseURL';
import './VoucherView.css';

const VoucherView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retailerDetails, setRetailerDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionProofFile, setTransactionProofFile] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchReceipt();
     fetchInvoices(); // Add this line

  }, [id]);
const fetchReceipt = async () => {
  try {
    setIsLoading(true);
    const response = await fetch(`${baseurl}/api/voucher/${id}?data_type=Purchase`);
    
    if (response.ok) {
      const data = await response.json(); 
      setReceipt(data);
      
      
      setEditFormData({
        retailer_id: data.PartyID || data.retailer_id || '', // Use the correct field
        paid_amount: data.paid_amount || data.TotalAmount || '',
        currency: data.currency || 'INR',
        payment_method: data.AccountName || '',
        receipt_date: data.Date ? data.Date.split('T')[0] : '',
        note: data.PaymentTerms || '',
        bank_name: data.BankName || '',
        transaction_date: data.paid_date ? data.paid_date.split('T')[0] : '',
        reconciliation_option: data.status || '',
      invoiceNumber: data.InvoiceNumber || '',
      });

      // Fetch retailer details using the correct ID field
      const retailerId = data.PartyID || data.retailer_id;
      if (retailerId) {
        console.log('🔄 Fetching retailer details for ID:', retailerId);
        fetchRetailerDetails(retailerId);
      } else {
        console.warn('⚠️ No retailer ID found in receipt data');
      }

    } else {
      setError('Failed to load receipt');
    }
  } catch (err) {
    console.error('Error fetching receipt:', err);
    setError('Error loading receipt');
  } finally {
    setIsLoading(false);
  }
};

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/purchase/voucher');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    setShowDropdown(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setShowDropdown(false);
    setIsDeleteModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  // Add fetchInvoices function
const fetchInvoices = async () => {
  try {
    console.log('Fetching invoices from:', `${baseurl}/api/purchasevouchersnumber`);
    const response = await fetch(`${baseurl}/api/purchasevouchersnumber?type=Purchase`);
    if (response.ok) {
      const data = await response.json();
      console.log('Received invoices data:', data);
      setInvoices(data);
    } else {
      console.error('Failed to fetch invoices. Status:', response.status);
    }
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
};

  // File change handler for edit modal
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }
      
      setTransactionProofFile(file);
    }
  };

  // File remove handler
  const handleRemoveFile = () => {
    setTransactionProofFile(null);
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleUpdateReceipt = async () => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all receipt data
      formDataToSend.append('TransactionType', "purchase voucher");
      formDataToSend.append('PartyID', editFormData.retailer_id);
      formDataToSend.append('paid_amount', editFormData.paid_amount);
      // formDataToSend.append('currency', editFormData.currency);
      // formDataToSend.append('payment_method', editFormData.payment_method);
      // formDataToSend.append('receipt_date', editFormData.receipt_date);
      // formDataToSend.append('note', editFormData.note);
      // formDataToSend.append('bank_name', editFormData.bank_name);
      // formDataToSend.append('transaction_date', editFormData.transaction_date || '');
      // formDataToSend.append('reconciliation_option', editFormData.reconciliation_option);
      formDataToSend.append('DC', "C");
       formDataToSend.append('invoiceNumber', editFormData.invoiceNumber || '');


//       formDataToSend.append('PartyID', '2');
// formDataToSend.append('paid_amount', '594');
// formDataToSend.append('currency', 'INR');
// formDataToSend.append('payment_method', 'Bank Transfer');
// formDataToSend.append('receipt_date', '2025-11-10');
// formDataToSend.append('note', 'Test update for receipt');
// formDataToSend.append('bank_name', 'HDFC Bank');
// formDataToSend.append('transaction_date', '2025-11-09');
// formDataToSend.append('reconciliation_option', 'Auto');


      // Append file if exists
      if (transactionProofFile) {
        formDataToSend.append('transaction_proof', transactionProofFile);
      }

      const response = await fetch(`${baseurl}/api/voucher/${id}`, {
        method: 'PUT',
        // Don't set Content-Type header for FormData
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        alert('Voucher updated successfully!');
        setIsEditModalOpen(false);
        setTransactionProofFile(null); // Reset file state
        await fetchReceipt(); // Refresh the receipt data
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update receipt');
      }
    } catch (err) {
      console.error('Error updating receipt:', err);
      alert('Error updating receipt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${baseurl}/api/voucher/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('voucher deleted successfully!');
        navigate('/purchase/voucher');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete receipt');
      }
    } catch (err) {
      console.error('Error deleting receipt:', err);
      alert('Error deleting receipt. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

const handleDownloadProof = async (view = false) => {
  try {
    const endpoint = view ? 'view-proof' : 'download-proof';
    const response = await fetch(`${baseurl}/api/receipts/${id}/${endpoint}`);
    
    if (response.ok) {
      const blob = await response.blob();
      
      if (view) {
        // For viewing in browser
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        // For downloading
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = receipt.transaction_proof_filename || 'transaction_proof';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Failed to access transaction proof');
    }
  } catch (err) {
    console.error('Error accessing proof:', err);
    alert('Error accessing transaction proof');
  }
};

useEffect(() => {
  if (receipt) {
    const retailerId = receipt.PartyID || receipt.retailer_id;
    if (retailerId) {
      console.log('🔄 useEffect: Fetching retailer for ID:', retailerId);
      fetchRetailerDetails(retailerId);
    } else {
      console.warn('⚠️ useEffect: No retailer ID found in receipt');
    }
  }
}, [receipt]);

const fetchRetailerDetails = async (retailerId) => {
  try {
    console.log('🔍 Fetching retailer details for ID:', retailerId);
    
    // Use the correct endpoint and ID field
    const response = await fetch(`${baseurl}/accounts/${retailerId}`);
    
    if (response.ok) {
      const retailerData = await response.json();
      console.log('✅ Retailer details fetched:', retailerData);
      setRetailerDetails(retailerData);
    } else {
      console.error('❌ Failed to fetch retailer details. Status:', response.status);
      // Try alternative endpoint or fallback
      await fetchAllAccountsAndFindRetailer(retailerId);
    }
  } catch (err) {
    console.error('❌ Error fetching retailer details:', err);
    await fetchAllAccountsAndFindRetailer(retailerId);
  }
};

// Fallback function to fetch all accounts and find by ID
const fetchAllAccountsAndFindRetailer = async (retailerId) => {
  try {
    console.log('🔄 Trying to fetch all accounts...');
    const response = await fetch(`${baseurl}/accounts`);
    
    if (response.ok) {
      const allAccounts = await response.json();
      console.log('📋 All accounts fetched:', allAccounts);
      
      // Find the retailer by ID (not retailer_id)
      const foundRetailer = allAccounts.find(account => account.id == retailerId);
      
      if (foundRetailer) {
        console.log('✅ Retailer found in all accounts:', foundRetailer);
        setRetailerDetails(foundRetailer);
      } else {
        console.warn('⚠️ Retailer not found in accounts list');
        setRetailerDetails(null);
      }
    }
  } catch (err) {
    console.error('❌ Error fetching all accounts:', err);
  }
};
  // Convert numbers to words (Indian format)
  const numberToWords = (num) => {
    if (!num) return "Zero Only";

    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numToWords(n % 100) : "");
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
      return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
    };

    return numToWords(parseInt(num)) + " Only";
  };

  if (isLoading) {
    return (
      <div className="receipt-view-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-view-container">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Vouchers
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="receipt-view-container">
        <div className="alert alert-warning text-center">
          <h4>Voucher Not Found</h4>
          <p>The requested receipt could not be found.</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Vouchers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-view-container">
      {/* Header Actions */}
      <div className="receipt-view-header">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i> Back to Vouchers
        </button>
        <div className="receipt-view-actions">
          <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              className="btn btn-outline-primary me-2 dropdown-toggle"
              onClick={toggleDropdown}
            >
              <i className="bi bi-three-dots-vertical me-2"></i> Actions
            </button>
            {showDropdown && (
              <div className="dropdown-menu show" style={{ 
                display: 'block', 
                position: 'absolute', 
                right: 0, 
                top: '100%',
                zIndex: 1000 
              }}>
                <button className="dropdown-item" onClick={handleEdit}>
                  <i className="bi bi-pencil me-2"></i> Edit
                </button>
                <button className="dropdown-item text-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-2"></i> Delete
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-outline-primary" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i> Print
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Voucher</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setTransactionProofFile(null);
                  }}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Amount *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="paid_amount"
                        value={editFormData.paid_amount || ''}
                        onChange={handleEditInputChange}
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Currency</label>
                      <select
                        className="form-select"
                        name="currency"
                        value={editFormData.currency || 'INR'}
                        onChange={handleEditInputChange}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>



                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-select"
                        name="payment_method"
                        value={editFormData.payment_method || ''}
                        onChange={handleEditInputChange}
                      >
                        <option value="Direct Deposit">Direct Deposit</option>
                        <option value="Online Payment">Online Payment</option>
                        <option value="Credit/Debit Card">Credit/Debit Card</option>
                        <option value="Demand Draft">Demand Draft</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Voucher Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="receipt_date"
                        value={editFormData.receipt_date || ''}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bank_name"
                        value={editFormData.bank_name || ''}
                        onChange={handleEditInputChange}
                        placeholder="Bank Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Transaction Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="transaction_date"
                        value={editFormData.transaction_date || ''}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Transaction Proof Document Section */}
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Transaction Proof Document</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <small className="text-muted">
                        {transactionProofFile ? transactionProofFile.name : 'No file chosen'}
                      </small>
                      
                      {/* Show selected file info */}
                      {transactionProofFile && (
                        <div className="mt-2">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-success me-2">
                              <i className="bi bi-file-earmark-check"></i>
                            </span>
                            <span className="small">
                              {transactionProofFile.name} 
                              ({Math.round(transactionProofFile.size / 1024)} KB)
                            </span>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={handleRemoveFile}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Show existing file if available */}
                   {receipt.transaction_proof_filename && !transactionProofFile && (
  <div className="mt-2">
    <div className="d-flex align-items-center">
      <span className="badge bg-info me-2">
        <i className="bi bi-file-earmark-text"></i>
      </span>
      <span className="small">
        Current file: 
      </span>
      <button 
  type="button" 
  className="btn btn-sm btn-outline-primary ms-2"
  onClick={() => handleDownloadProof(false)}
>
  <i className="bi bi-download me-1"></i> Download
</button>
<button 
  type="button" 
  className="btn btn-sm btn-outline-success ms-1"
  onClick={() => handleDownloadProof(true)}
>
  <i className="bi bi-eye me-1"></i> View
</button>
    </div>
  </div>
)}
                      
                      {/* File requirements */}
                      {/* <div className="form-text">
                        <small>
                          <i className="bi bi-info-circle me-1"></i>
                          Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                        </small>
                      </div> */}
                    </div>
                  </div>
             

            
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Reconciliation Option</label>
                      <select
                        className="form-select"
                        name="reconciliation_option"
                        value={editFormData.reconciliation_option || 'Do Not Reconcile'}
                        onChange={handleEditInputChange}
                      >
                        <option value="Do Not Reconcile">Do Not Reconcile</option>
                        <option value="Customer Reconcile">Customer Reconcile</option>
                      </select>
                    </div>
                  </div>
                </div>
 <div className="row mb-3">
  <div className="col-md-6">
    <div className="mb-3">
      <label className="form-label">Invoice Number *</label>
      <select
        className="form-select"
        name="invoiceNumber"
        value={editFormData.invoiceNumber || ''}
        onChange={handleEditInputChange}
        required
      >
        <option value="">Select Invoice Number</option>
        {invoices.map((invoice) => (
          <option key={invoice.VoucherID} value={invoice.InvoiceNumber || invoice.InvoiceNumber}>
            {/* Show both InvoiceNumber and VchNo if available */}
            {invoice.InvoiceNumber} 
            {invoice.VchNo && ` (Vch: ${invoice.VchNo})`}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Note</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="note"
                        value={editFormData.note || ''}
                        onChange={handleEditInputChange}
                        placeholder="Additional notes..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setTransactionProofFile(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateReceipt}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Voucher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this receipt?</p>
                <p><strong>Voucher Number:</strong> {receipt.receipt_number}</p>
                <p><strong>Amount:</strong> ₹ {parseFloat(receipt.paid_amount || 0).toLocaleString('en-IN')}</p>
                <p className="text-danger"><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Voucher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your receipt view JSX remains the same */}
      <div className="receipt-container">
        <div className="receipt-paper">
          <div className="receipt-header">
            <h1 className="receipt-main-title">View Voucher</h1>
            <div className="receipt-customer-section">
              <h2 className="receipt-customer-title">Supplier: {receipt.payee_name || 'N/A'}</h2>
            </div>
            <hr className="receipt-divider" />
          </div>

          <div className="receipt-company-info">
            <h3 className="company-name">
              {retailerDetails?.business_name || receipt.retailer_business_name || 'Market Experts'}
            </h3>
            <div className="company-details">
              <p><strong>Phone:</strong> {retailerDetails?.mobile_number || receipt.retailer_mobile || '91 7360705070'}</p>
              <p><strong>Email:</strong> {retailerDetails?.email || receipt.retailer_email || 'sales.taa@apache.com'}</p>
              <p><strong>GST:</strong> {retailerDetails?.gstin || receipt.retailer_gstin || '29A4JCC420501ZX'}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="receipt-payment-info">
            <div className="payup-section">
              <strong>Payup:</strong>
              <span className="payup-amount">₹ {parseFloat(receipt.paid_amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* voucher Details */}
          <div className="receipt-details">
            <div className="receipt-meta">
              <p><strong>RECEIPT Date:</strong> {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('en-IN') : 'N/A'}</p>
              <p><strong>Created by:</strong> IIIQ bets</p>
            </div>
          </div>

          {/* Product Description */}
          <div className="receipt-product-section">
            <h4>Product Description:</h4>
            <table className="receipt-product-table">
              <thead>
                <tr>
                  <th className="text-start">Product Name</th>
                  <th className="text-start">Product Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Received from {receipt.PartyName || 'N/A'} of {numberToWords(receipt.paid_amount)}</td>
                  <td>TOTAL</td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <strong>₹ {parseFloat(receipt.paid_amount || 0).toLocaleString('en-IN')}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="receipt-footer">
            <div className="authorized-signatory">
              <p>For NBRRA MIND CORPORATION PRIVATE LIMITED</p>
              <p className="signature-line">Authorized Signatory</p>
            </div>
            <div className="receipt-note">
              <p className="computer-generated"> Thank you!</p>
            </div>
          </div>

          {/* Additional Information */}
        <div className="receipt-additional-info">
  <div className="row">
    {/* First Row - Two Columns */}
    <div className="col-md-6">
      <p><strong>Payment Method:</strong> {receipt.payment_method || 'N/A'}</p>
    </div>
    <div className="col-md-6">
      <p><strong>Currency:</strong> {receipt.currency || 'INR'}</p>
    </div>
  </div>

  {/* Second Row - Two Columns */}
  <div className="row">
    <div className="col-md-6">
      {receipt.bank_name && <p><strong>Bank Name:</strong> {receipt.bank_name}</p>}
    </div>


    <div className="col-md-6">
    <p><strong>Voucher Number:</strong> {receipt.VchNo || 'N/A'}</p>
    </div>
  </div>

  {/* Third Row - Two Columns */}
  <div className="row">
    <div className="col-md-6">
      {receipt.transaction_date && (
        <p><strong>Transaction Date:</strong> {new Date(receipt.transaction_date).toLocaleDateString('en-IN')}</p>
      )}
    </div>

  </div>
  <div className="row">
    <div className="col-md-6">
  <p><strong>Invoice Number :</strong> {receipt.invoiceNumber || receipt.InvoiceNumber  || 'Not available'}</p>
</div>

</div>

  {/* Fourth Row - Full Width for Transaction Proof */}
  <div className="row">
    <div className="col-md-12">
      {receipt.transaction_proof_filename && (
        <p>
          <strong>Transaction Proof:</strong> 
          <span className="ms-2">
            {receipt.transaction_proof_filename}
            <button 
              className="btn btn-sm btn-outline-primary me-1 ms-2"
              onClick={() => handleDownloadProof(false)}
            >
              <i className="bi bi-download me-1"></i> Download
            </button>
            <button 
              className="btn btn-sm btn-outline-success"
              onClick={() => handleDownloadProof(true)}
            >
              <i className="bi bi-eye me-1"></i> View
            </button>
          </span>
        </p>
      )}
    </div>
  </div>

  {/* Notes Row - Full Width */}
  {receipt.note && (
    <div className="row">
      <div className="col-md-12">
        <div className="receipt-notes">
          <p><strong>Notes:</strong> {receipt.note}</p>
        </div>
      </div>
    </div>
  )}
</div>
           
        </div>
      </div>
    </div>
  );
};

export default VoucherView;