// frontend/src/components/Sales/Receipts/ReceiptsPDF.js
import React, { forwardRef } from 'react';

const ReceiptsPDF = forwardRef(({ receipts, startDate, endDate, month, year, title = 'Receipts Report' }, ref) => {
  // Calculate totals
  const totalAmount = receipts.reduce((sum, receipt) => {
    const amount = parseFloat(receipt.paid_amount || receipt.amount || 0);
    return sum + amount;
  }, 0);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: '0', fontSize: '24px', color: '#333' }}>{title}</h1>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          {month && year ? `${month} ${year}` : `From ${formatDate(startDate)} To ${formatDate(endDate)}`}
        </p>
        <p style={{ margin: '5px 0', fontSize: '10px', color: '#666' }}>
          Generated on: {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
          <span>Total Receipts: <strong>{receipts.length}</strong></span>
          <span>Total Amount: <strong>{formatCurrency(totalAmount)}</strong></span>
        </div>
      </div>

      {/* Table */}
    <table style={{ 
    width: '100%', 
    borderCollapse: 'collapse', 
    fontSize: '12px',
    lineHeight: '1.2'
}}>
    <thead>
        <tr style={{ backgroundColor: '#4a90e2', color: 'white' }}>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', fontWeight: '600', width: '5%' }}>S.No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '12%' }}>Receipt No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '20%' }}>Retailer Name</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'right', width: '12%' }}>Amount</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Payment Method</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Invoice No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Date</th>
        </tr>
    </thead>

    <tbody>
        {receipts.map((receipt, index) => (
            <tr 
                key={receipt.VoucherID || receipt.id || index} 
                style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}
            >
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{index + 1}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {receipt.VchNo || receipt.VoucherID || receipt.receipt_number || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {receipt.PartyName || receipt.payee || receipt.retailerName || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatCurrency(parseFloat(receipt.paid_amount || receipt.amount || 0))}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {receipt.payment_method || receipt.PaymentMethod || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {receipt.invoice_number || receipt.InvoiceNumber || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {formatDate(receipt.Date || receipt.receipt_date || receipt.created)}
                </td>
            </tr>
        ))}
    </tbody>

    <tfoot>
        <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
            <td colSpan="3" style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                Total:
            </td>
            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                {formatCurrency(totalAmount)}
            </td>
            <td colSpan="3" style={{ padding: '10px', border: '1px solid #ddd' }}></td>
        </tr>
    </tfoot>
</table>

      {/* Footer */}
      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
        <p>© {new Date().getFullYear()} SHREE SHASHWAT RAJ AGRO PVT.LTD. All rights reserved.</p>
      </div>
    </div>
  );
});

ReceiptsPDF.displayName = 'ReceiptsPDF';

export default ReceiptsPDF;  // Add this line