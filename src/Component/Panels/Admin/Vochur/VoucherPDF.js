// frontend/src/components/Purchase/Voucher/VoucherPDF.js
import React, { forwardRef } from 'react';

const VoucherPDF = forwardRef(({ vouchers, startDate, endDate, month, year, title = 'Purchase Vouchers Report' }, ref) => {
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
  const totalAmount = vouchers.reduce((sum, voucher) => {
    const amount = voucher.paid_amount || voucher.amount || 0;
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
          <strong>Total Vouchers:</strong> {vouchers.length}
        </div>
        <div>
          <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Vouchers Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontSize: '12px',
        lineHeight: '1.2',
        marginBottom: '30px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#4a90e2', color: 'white' }}>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', fontWeight: '600', width: '4%' }}>S.No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '12%' }}>Voucher No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '18%' }}>Supplier Name</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'right', width: '10%' }}>Amount</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '12%' }}>Payment Method</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '12%' }}>Invoice No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '12%' }}>Date</th>
          </tr>
        </thead>
        
        <tbody>
          {vouchers.length > 0 ? (
            vouchers.map((voucher, index) => (
              <tr 
                key={voucher.VoucherID || voucher.id || index} 
                style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}
              >
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {voucher.VchNo || voucher.VoucherID || voucher.voucher_number || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {voucher.payee || voucher.supplier?.business_name || voucher.supplierName || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                  {formatCurrency(voucher.paid_amount || voucher.amount || 0)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {voucher.payment_method || voucher.PaymentMethod || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {voucher.invoice_numbers || voucher.InvoiceNumber || voucher.invoice_no || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {formatDate(voucher.Date || voucher.receipt_date || voucher.created_at || voucher.created)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontStyle: 'italic',
                border: '1px solid #ddd'
              }}>
                No purchase vouchers found for the selected period
              </td>
            </tr>
          )}
        </tbody>
        
        {/* Table Footer with Totals */}
        {vouchers.length > 0 && (
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

VoucherPDF.displayName = 'VoucherPDF';

export default VoucherPDF;