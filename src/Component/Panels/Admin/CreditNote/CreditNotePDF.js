// frontend/src/components/Sales/CreditNote/CreditNotePDF.js
import React, { forwardRef } from 'react';

const CreditNotePDF = forwardRef(({ creditNotes, startDate, endDate, month, year, title = 'Credit Notes Report' }, ref) => {
  
  // Calculate totals
  const totalAmount = creditNotes.reduce((sum, note) => {
    const amount = note.creditAmount || note.amount || 0;
    const numericAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
      : parseFloat(amount || 0);
    return sum + numericAmount;
  }, 0);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0.00';
    const numericAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
      : parseFloat(amount || 0);
    return `₹ ${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date with better handling for different formats
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      // Check if date is in DD/MM/YYYY format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 4 ? parts[2] : `20${parts[2]}`;
          
          // Create date in YYYY-MM-DD format to avoid timezone issues
          const formattedDate = `${year}-${month}-${day}`;
          const date = new Date(formattedDate);
          
          // Check if date is valid
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        }
      }
      
      // Try parsing as regular date string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      // If all parsing fails, return the original string
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format date range parameters
  const formatRangeDate = (dateString) => {
    if (!dateString) return '';
    return formatDate(dateString);
  };

  // Get date range text
  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${formatRangeDate(startDate)} to ${formatRangeDate(endDate)}`;
    } else if (month && year) {
      return `${month} ${year}`;
    }
    return 'All Time';
  };

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
          <strong>Total Credit Notes:</strong> {creditNotes.length}
        </div>
        <div>
          <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Credit Notes Table */}
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
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '15%' }}>Credit Note No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '20%' }}>Customer Name</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Invoice No</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'right', width: '12%' }}>Amount</th>
            <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'center', width: '15%' }}>Date</th>
          </tr>
        </thead>
        
        <tbody>
          {creditNotes.length > 0 ? (
            creditNotes.map((note, index) => (
              <tr 
                key={note.id || index} 
                style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}
              >
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '12px' }}>{index + 1}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '12px' }}>
                  {note.noteNumber || note.creditNoteNumber || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                  {note.customerName || note.PartyName || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '12px' }}>
                  {note.document || note.invoiceNumber || note.InvoiceNo || '-'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500', fontSize: '12px' }}>
                  {formatCurrency(note.creditAmount || note.amount || 0)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '12px' }}>
                  {formatDate(note.created || note.date || note.createdAt)}
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
                border: '1px solid #ddd',
                fontSize: '12px'
              }}>
                No credit notes found for the selected period
              </td>
            </tr>
          )}
        </tbody>
        
        {/* Table Footer with Totals */}
        {creditNotes.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
              <td colSpan="4" style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontSize: '12px' }}>
                Total:
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontSize: '12px' }}>
                {formatCurrency(totalAmount)}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}></td>
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
        <p style={{ margin: 0, fontSize: '10px' }}>© {new Date().getFullYear()} SHREE SHASHWAT RAJ AGRO PVT.LTD. All rights reserved.</p>
      </div>
    </div>
  );
});

CreditNotePDF.displayName = 'CreditNotePDF';

export default CreditNotePDF;