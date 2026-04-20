import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { baseurl } from '../../../BaseURL/BaseURL';
import './DebitView.css';

const KachaPurchaseDebitView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creditNote, setCreditNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCreditNote();
  }, [id]);

  const fetchCreditNote = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseurl}/api/debitnotes/${id}`);
      
      if (response.ok) {
        const data = await response.json(); 
        setCreditNote(data); 
        
        // Fetch customer details
        const customerId = data.PartyID;
        if (customerId) {
          fetchCustomerDetails(customerId);
        }
      } else {
        setError('Failed to load Debit Note');
      }
    } catch (err) {
      console.error('Error fetching Debit Note:', err);
      setError('Error loading Debit Note');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/kachadebitnotetable');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    setShowDropdown(false);
    navigate(`/kachaeditdebitenote/${id}`);
  };

  // Fixed handleDelete function with your API
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete Debit Note ${creditNote?.VchNo || 'unknown'}?`)) {
      try {
        setIsSubmitting(true);
        console.log('Delete Debit Note ID:', id);
        
        // Using your existing transactions API
        const response = await fetch(`${baseurl}/transactions/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            alert('Debit Note deleted successfully!');
            navigate('/kachadebitnotetable');
          } else {
            alert('Failed to delete Debit Note: ' + (result.message || 'Unknown error'));
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete Debit Note');
        }
      } catch (err) {
        console.error('Error deleting Debit Note:', err);
        alert('Error deleting Debit Note. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (creditNote) {
      const customerId = creditNote.PartyID;
      if (customerId) {
        fetchCustomerDetails(customerId);
      }
    }
  }, [creditNote]);

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await fetch(`${baseurl}/accounts/${customerId}`);
      if (response.ok) {
        const customerData = await response.json();
        setCustomerDetails(customerData);
      } else {
        await fetchAllAccountsAndFindCustomer(customerId);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      await fetchAllAccountsAndFindCustomer(customerId);
    }
  };

  const fetchAllAccountsAndFindCustomer = async (customerId) => {
    try {
      const response = await fetch(`${baseurl}/accounts`);
      if (response.ok) {
        const allAccounts = await response.json();
        const foundCustomer = allAccounts.find(account => account.id == customerId);
        if (foundCustomer) {
          setCustomerDetails(foundCustomer);
        }
      }
    } catch (err) {
      console.error('Error fetching all accounts:', err);
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
      <div className="creditnote-view-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Debit Note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="creditnote-view-container">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Debit Notes
          </button>
        </div>
      </div>
    );
  }

  if (!creditNote) {
    return (
      <div className="creditnote-view-container">
        <div className="alert alert-warning text-center">
          <h4>Debit Note Not Found</h4>
          <p>The requested Debit Note could not be found.</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Debit Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="creditnote-view-container">
      {/* Header Actions */}
      <div className="creditnote-view-header">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i> Back to Debit Notes
        </button>
        <div className="creditnote-view-actions">
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
                <button className="dropdown-item text-danger" onClick={handleDelete} disabled={isSubmitting}>
                  <i className="bi bi-trash me-2"></i> {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-outline-primary" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i> Print
          </button>
        </div>
      </div>



    

      {/* Debit Note View */}
      <div className="creditnote-container">
        <div className="creditnote-paper">
          <div className="creditnote-header">
            <h1 className="creditnote-main-title">Debit Note</h1>
                  <div className="creditnote-customer-section">
  <h2 className="creditnote-customer-title">Customer: {creditNote.payee_name || 'N/A'}</h2>
</div>
            <hr className="creditnote-divider" />
          </div>

          <div className="creditnote-company-info">
            <h3 className="company-name">
              {customerDetails?.business_name || creditNote.retailer_business_name || 'Market Experts'}
            </h3>
            <div className="company-details">
              <p><strong>Phone:</strong> {customerDetails?.mobile_number || creditNote.retailer_mobile || '91 7360705070'}</p>
              <p><strong>Email:</strong> {customerDetails?.email || creditNote.retailer_email || 'sales.taa@apache.com'}</p>
              <p><strong>GST:</strong> {customerDetails?.gstin || creditNote.retailer_gstin || '29A4JCC420501ZX'}</p>
            </div>
          </div>

          {/* Amount Information */}
          <div className="creditnote-amount-info">
            <div className="amount-section">
              <strong>Credit Amount:</strong>
              <span className="amount-value">₹ {parseFloat(creditNote.TotalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <hr className="creditnote-divider" />

          {/* Debit Note Details */}
          <div className="creditnote-details">
            <div className="creditnote-meta">
              <p><strong>Debit Note Date:</strong> {creditNote.Date ? new Date(creditNote.Date).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
          </div>

          {/* Product Description */}
          <div className="creditnote-product-section">
            <h4>Description:</h4>
            <table className="creditnote-product-table">
              <thead>
                <tr>
                  <th className="text-start">Description</th>
                  <th className="text-start">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Credit issued to {creditNote.PartyName || 'N/A'} of {numberToWords(creditNote.TotalAmount)}</td>
                  <td>TOTAL</td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <strong>₹ {parseFloat(creditNote.TotalAmount || 0).toLocaleString('en-IN')}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="creditnote-footer">
            <div className="authorized-signatory">
              <p>For NBRRA MIND CORPORATION PRIVATE LIMITED</p>
              <p className="signature-line">Authorized Signatory</p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="creditnote-additional-info">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Debit Note Number:</strong> {creditNote.VchNo || 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Voucher ID:</strong> {creditNote.VoucherID || 'N/A'}</p>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                {creditNote.BankName && <p><strong>Bank Name:</strong> {creditNote.BankName}</p>}
              </div>
              <div className="col-md-6">
                <p><strong>Transaction Type:</strong> {creditNote.TransactionType || 'CreditNote'}</p>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <p><strong>Invoice Number:</strong> {creditNote.InvoiceNumber || 'Not available'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Entry Date:</strong> {creditNote.EntryDate ? new Date(creditNote.EntryDate).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
            </div>

            {creditNote.PaymentTerms && (
              <div className="row">
                <div className="col-md-12">
                  <div className="creditnote-notes">
                    <p><strong>Payment Terms:</strong> {creditNote.PaymentTerms}</p>
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

export default KachaPurchaseDebitView;