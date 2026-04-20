import React from 'react';

const LedgerPDF = React.forwardRef(({ filteredLedger, getPartyOpeningBalance, orderModeFilter = "ALL" }, ref) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString("en-IN", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const calculateRunningBalance = (transactions, openingBalanceNum, openingBalanceType) => {
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateA - dateB;
    });

    let runningBalance = openingBalanceNum;
    
    if (openingBalanceType === 'Credit') {
      runningBalance = -openingBalanceNum; 
    }

    return sortedTransactions.map(tx => {
      const amount = parseFloat(tx.Amount || 0);
      const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();

      if (openingBalanceType === 'Debit') {
        if (dc === "D") {
          runningBalance = runningBalance + amount;
        } else if (dc === "C") {
          runningBalance = runningBalance - amount;
        }
      } else if (openingBalanceType === 'Credit') {
        if (dc === "D") {
          runningBalance = runningBalance + amount;
        } else if (dc === "C") {
          runningBalance = runningBalance - amount;
        }
      } else {
        if (dc === "D") {
          runningBalance = runningBalance + amount;
        } else if (dc === "C") {
          runningBalance = runningBalance - amount;
        }
      }

      return {
        ...tx,
        runningBalance
      };
    });
  };

  // Determine if we should hide balance column
  const shouldHideBalance = orderModeFilter !== "ALL";

  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Report Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        borderBottom: '2px solid #333'
      }}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>Ledger Report</h1>
        <p style={{ margin: '10px 0 0', color: '#666' }}>
          Generated on: {new Date().toLocaleString('en-IN')}
          {orderModeFilter !== "ALL" && ` • Filter: ${orderModeFilter}`}
        </p>
      </div>

      {filteredLedger.map((ledger, index) => {
        const openingBalanceData = getPartyOpeningBalance(ledger.partyID);
        const openingBalanceNum = openingBalanceData.balance;
        const openingBalanceType = openingBalanceData.type;
        
        const openingBalanceDisplay = openingBalanceType 
          ? `₹${openingBalanceNum.toFixed(2)} ${openingBalanceType === 'Debit' ? 'Dr' : 'Cr'}`
          : `₹${openingBalanceNum.toFixed(2)}`;

        const transactionsWithBalance = calculateRunningBalance(
          ledger.transactions, 
          openingBalanceNum, 
          openingBalanceType
        );
        
        return (
          <div key={index} style={{ 
            marginBottom: '40px',
            pageBreakInside: 'avoid'
          }}>
            <div style={{
              backgroundColor: '#f2f2f2',
              padding: '10px 15px',
              marginBottom: '10px',
              fontWeight: 'bold',
              fontSize: '14px',
              borderLeft: '4px solid #007bff',
              color: '#333'
            }}>
            {ledger.partyName} (ID: {ledger.partyID}) —
{orderModeFilter === "ALL" && (
  <> Opening Balance: {openingBalanceDisplay} |</>
)}{" "}
Balance: {formatAmount(Math.abs(ledger.balance))}{" "}
<span style={{ color: ledger.balance >= 0 ? '#28a745' : '#dc3545' }}>
  {ledger.balance >= 0 ? 'Cr' : 'Dr'}
</span>
               
            </div>

            {/* Transaction Table or No Data Message */}
            {transactionsWithBalance.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                color: '#666',
                fontStyle: 'italic',
                marginBottom: '20px'
              }}>
                No transactions match the selected filter
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#28a745',
                    borderBottom: '2px solid #ccc',
                    color: 'white'
                  }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>TRANSACTION DATE</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>TRANSACTION TYPE</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>REC/VOU NO</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>CREDIT</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>DEBIT</th>
                    {!shouldHideBalance && (
                      <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>BALANCE</th>
                    )}
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>CREATED ON</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsWithBalance.map((tx, idx) => {
                    const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();
                    const runningBalance = tx.runningBalance || 0;
                    
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #e0e0e0'
                      }}>
                        <td style={{ padding: '8px' }}>
                          {tx.date ? formatDate(tx.date) : "-"}
                        </td>
                        <td style={{ padding: '8px' }}>{tx.trantype || "-"}</td>
                        <td style={{ padding: '8px' }}>{tx.voucherID || "-"}</td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'right',
                          color: dc === "C" ? '#28a745' : '#333',
                          fontWeight: dc === "C" ? 'bold' : 'normal'
                        }}>
                          {dc === "C" ? formatAmount(tx.Amount) : "-"}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'right',
                          color: dc === "D" ? '#dc3545' : '#333',
                          fontWeight: dc === "D" ? 'bold' : 'normal'
                        }}>
                          {dc === "D" ? formatAmount(tx.Amount) : "-"}
                        </td>
                        {!shouldHideBalance && (
                          <td style={{ 
                            padding: '8px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#333'
                          }}>
                            {formatAmount(Math.abs(runningBalance))} {runningBalance >= 0 ? 'Dr' : 'Cr'}
                          </td>
                        )}
                        <td style={{ padding: '8px' }}>
                          {tx.created_at ? formatDateTime(tx.created_at) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '10px',
        color: '#666',
        borderTop: '1px solid #dee2e6',
        marginTop: '40px'
      }}>
      </div>
    </div>
  );
});

export default LedgerPDF;