// History.js
import React from 'react';
import './History.css';

const History = () => {
  // Sample transaction data with all 6 products
  const transactions = [
    {
      id: 'TXN001',
      name: 'Product 1',
      date: 'Dec 19, 2024 • 2:30 PM',
      amount: '8,500',
      type: 'Kaccha',
      status: 'Completed'
    },
    {
      id: 'TXN002',
      name: 'Product 2',
      date: 'Dec 18, 2024 • 11:15 AM',
      amount: '15,200',
      type: 'Pakka',
      status: 'Completed'
    },
    {
      id: 'TXN003',
      name: 'Product 3',
      date: 'Dec 17, 2024 • 4:45 PM',
      amount: '12,500',
      type: 'Kaccha',
      status: 'Completed'
    },
    {
      id: 'TXN004',
      name: 'Product 4',
      date: 'Dec 16, 2024 • 9:20 AM',
      amount: '9,800',
      type: 'Pakka',
      status: 'Pending'
    },
    {
      id: 'TXN005',
      name: 'Product 5',
      date: 'Dec 15, 2024 • 3:10 PM',
      amount: '7,200',
      type: 'Kaccha',
      status: 'Completed'
    },
    {
      id: 'TXN006',
      name: 'Product 6',
      date: 'Dec 14, 2024 • 1:30 PM',
      amount: '18,400',
      type: 'Pakka',
      status: 'Completed'
    }
  ];

  return (
    <div className="history-container">
      
      <div className="history-header">
        <h2 className="transaction-history-title">Transaction History</h2>
        <p className="transaction-history-subtitle">View all your purchase records</p>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card total-card">
          <div className="card-content">
            <h3>Total This Month</h3>
            <p className="amount">58,150</p>
          </div>
        </div>
        
        <div className="summary-row">
          <div className="summary-card half-card">
            <div className="card-content">
              <h3>Kaccha Total</h3>
              <p className="amount">11,650</p>
            </div>
          </div>
          
          <div className="summary-card half-card">
            <div className="card-content">
              <h3>Pakka Total</h3>
              <p className="amount">46,500</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search transactions..." 
          className="search-input"
        />
      </div>
      
      <div className="transactions-list">
        {transactions.map(transaction => (
          <div key={transaction.id} className="transaction-card">
            <div className="transaction-main">
              <div className="transaction-info">
                <h3 className="product-name">{transaction.name}</h3>
                <p className="transaction-date">{transaction.date}</p>
                <p className="transaction-id">ID: {transaction.id}</p>
              </div>
              
              <div className="transaction-amount-section">
                <p className="transaction-amount">{transaction.amount}</p>
                <div className="transaction-type-status">
                  <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                    {transaction.type}
                  </span>
                  <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="transaction-actions">
              <button className="view-details-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;