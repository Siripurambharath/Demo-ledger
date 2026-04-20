// frontend/src/components/Purchase/PurchaseInvoice/PurchaseInvoicePDF.js
import React, { forwardRef } from 'react';

const PurchaseInvoicePDF = forwardRef(({ invoices, startDate, endDate, month, year, title = 'Purchase Invoices Report' }, ref) => {
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0.00';
    const numericAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
      : parseFloat(amount || 0);
    return `₹ ${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get date range text
  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    } else if (month && year) {
      return `${month} ${year}`;
    }
    return 'All Time';
  };

  // Calculate totals
  const totalAmount = invoices.reduce((sum, invoice) => {
    const amount = invoice.totalAmount || invoice.amount || 0;
    const numericAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
      : parseFloat(amount || 0);
    return sum + numericAmount;
  }, 0);

  return (
    <div ref={ref} style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      {/* Report Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        borderBottom: '2px solid #333'
      }}>
        <h1 style={{ margin: '0', fontSize: '28px', color: '#333' }}>{title}</h1>
        <p style={{ margin: '10px 0 5px', color: '#666', fontSize: '14px' }}>
          Period: {getDateRangeText()}
        </p>
        <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>
          Generated on: {new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>

      {/* Summary Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div>
          <strong>Total Invoices:</strong> {invoices.length}
        </div>
        <div>
          <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Purchase Invoices Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontSize: '12px',
        lineHeight: '1.2',
        marginBottom: '30px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#4a90e2', color: 'white' }}>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', fontWeight: '600', width: '5%' }}>S.No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '15%' }}>Invoice No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '20%' }}>Supplier Name</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'right', width: '12%' }}>Total Amount</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Payment Status</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Created Date</th>
          </tr>
        </thead>
        
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice, index) => (
              <tr 
                key={invoice.id || index} 
                style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}
              >
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {invoice.pinvoice || invoice.invoice_number || invoice.InvoiceNo || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {invoice.supplier || invoice.supplierName || invoice.PartyName || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                  {formatCurrency(invoice.totalAmount || invoice.amount || 0)}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  textAlign: 'center',
                  color: invoice.status === 'Paid' ? '#28a745' : 
                         invoice.status === 'Pending' ? '#ffc107' : 
                         invoice.status === 'Overdue' ? '#dc3545' : '#6c757d',
                  fontWeight: '500'
                }}>
                  {invoice.status || invoice.payment_status || 'Pending'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {formatDate(invoice.created || invoice.createdAt || invoice.date)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontStyle: 'italic',
                border: '1px solid #ddd'
              }}>
                No purchase invoices found for the selected period
              </td>
            </tr>
          )}
        </tbody>
        
        {/* Table Footer with Totals */}
        {invoices.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
              <td colSpan="3" style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                Total:
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                {formatCurrency(totalAmount)}
              </td>
              <td colSpan="2" style={{ padding: '10px', border: '1px solid #ddd' }}></td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '10px',
        color: '#666',
        borderTop: '1px solid #dee2e6',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} SHREE SHASHWAT RAJ AGRO PVT.LTD. All rights reserved.</p>
      </div>
    </div>
  );
});

PurchaseInvoicePDF.displayName = 'PurchaseInvoicePDF';

export default PurchaseInvoicePDF;