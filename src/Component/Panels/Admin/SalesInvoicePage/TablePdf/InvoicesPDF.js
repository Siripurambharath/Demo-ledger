import React from 'react';

const InvoicesPDF = React.forwardRef(({ invoices, startDate, endDate, month, year, title = 'Sales Invoices Report' }, ref) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '₹ 0.00';
    const numericAmount = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^0-9.-]/g, '')) 
      : parseFloat(amount || 0);
    return `₹ ${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    } else if (month && year) {
      return `${month} ${year}`;
    }
    return 'All Time';
  };

const sortedInvoices = [...invoices].sort((a, b) => {
  const invoiceA = a.number || a.invoice_number || a.InvoiceNo || '';
  const invoiceB = b.number || b.invoice_number || b.InvoiceNo || '';
  return invoiceA.localeCompare(invoiceB, undefined, { numeric: true, sensitivity: 'base' });
});

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
        borderRadius: '5px'
      }}>
        <div>
          <strong>Total Invoices:</strong> {sortedInvoices.length}
        </div>
        <div>
          <strong>Total Amount:</strong> {
            formatAmount(sortedInvoices.reduce((sum, inv) => {
              const amount = typeof inv.totalAmount === 'string'
                ? parseFloat(inv.totalAmount.replace(/[^0-9.-]/g, ''))
                : parseFloat(inv.totalAmount || 0);
              return sum + amount;
            }, 0))
          }
        </div>
      </div>

      {/* Invoices Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontSize: '12px',
        lineHeight: '1.2',
        marginBottom: '30px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', fontWeight: '600', width: '5%' }}>S.No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '15%' }}>Invoice No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '20%' }}>Retailer Name</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'right', width: '12%' }}>Total Amount</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Payment Status</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Created Date</th>
          </tr>
        </thead>
        
        <tbody>
          {sortedInvoices.length > 0 ? (
            sortedInvoices.map((invoice, index) => (
              <tr 
                key={invoice.id || index} 
                style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}
              >
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {invoice.number || invoice.invoice_number || invoice.InvoiceNo || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {invoice.customerName || invoice.retailerName || invoice.PartyName || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                  {formatAmount(invoice.totalAmount || invoice.amount || 0)}
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
                No invoices found for the selected period
              </td>
            </tr>
          )}
        </tbody>
        
        {/* Table Footer with Totals */}
        {sortedInvoices.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
              <td colSpan="3" style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                Total:
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                {formatAmount(sortedInvoices.reduce((sum, inv) => {
                  const amount = typeof inv.totalAmount === 'string'
                    ? parseFloat(inv.totalAmount.replace(/[^0-9.-]/g, ''))
                    : parseFloat(inv.totalAmount || 0);
                  return sum + amount;
                }, 0))}
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
        <p>© {new Date().getFullYear()} SHREE SHASHWAT RAJ AGRO PVT.LTD. All rights reserved.</p>
      </div>

    </div>
  );
});

export default InvoicesPDF;