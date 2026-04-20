import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./StaffExpenses.css";

function StaffExpenses() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const expensesData = [
    {
      id: "EXP005",
      category: "Marketing",
      date: "2025-09-19",
      submittedDate: "2025-09-18",
      amount: "¥ 103,944",
      description: "Digital marketing campaign for new product launch",
      status: "Pending"
    }
  ];

  const filteredExpenses = expensesData.filter(expense =>
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExpense = () => {
    navigate("/staff/add-expense");
  };

  return (
    <StaffMobileLayout>
      <div className="staff-expenses-mobile">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>My Expenses</h1>
              <p>Track your submitted expenses and status</p>
            </div>
            <button className="add-expense-btn" onClick={handleAddExpense}>
              + Add Expense
            </button>
          </div>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="expenses-section">
          <div className="section-header">
            <h2>Expenses ({filteredExpenses.length})</h2>
            <p>Track your expense submissions and approval status</p>
          </div>

          <div className="expenses-list">
            {filteredExpenses.map(expense => (
              <div key={expense.id} className="expense-card">
                <div className="expense-header">
                  <div className="expense-id">{expense.id}</div>
                  <span className={`status-badge ${expense.status.toLowerCase()}`}>
                    {expense.status}
                  </span>
                </div>
                
                <div className="expense-category-date">
                  <div className="category-badge">{expense.category}</div>
                  <div className="date-info">
                    <span className="date-label">Submitted: {expense.submittedDate}</span>
                    <span className="date-label">Expense Date: {expense.date}</span>
                  </div>
                </div>

                <div className="expense-amount">
                  {expense.amount}
                </div>

                <div className="expense-description">
                  {expense.description}
                </div>

                <div className="expense-actions">
                  <button className="view-details-btn">View Details</button>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
            ))}
          </div>

          {filteredExpenses.length === 0 && (
            <div className="no-expenses">
              <p>No expenses found. Add your first expense to get started.</p>
            </div>
          )}
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffExpenses;