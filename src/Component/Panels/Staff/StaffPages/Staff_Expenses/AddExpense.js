import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./AddExpense.css";

function AddExpense() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    expenseDate: "",
    description: "",
    receipt: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        receipt: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Expense submitted:", formData);
    // After successful submission, navigate back
    navigate("/staff/expenses");
  };

  const handleCancel = () => {
    navigate("/staff/expences");
  };

  return (
    <StaffMobileLayout>
      <div className="add-expense-mobile">
        <header className="form-header">
          <h1>Add New Expense</h1>
          <p>Submit your expense for approval</p>
        </header>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>
              <option value="Marketing">Marketing</option>
              <option value="Travel">Travel</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Meals & Entertainment">Meals & Entertainment</option>
              <option value="Transportation">Transportation</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount (e.g., ¥ 103,944)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expenseDate">Expense Date *</label>
            <input
              type="date"
              id="expenseDate"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the expense purpose"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="receipt">Receipt (Optional)</label>
            <div className="file-upload">
              <input
                type="file"
                id="receipt"
                name="receipt"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="file-input"
              />
              <label htmlFor="receipt" className="file-label">
                {formData.receipt ? formData.receipt.name : "Choose file"}
              </label>
            </div>
            <small className="file-hint">Supported formats: JPG, PNG, PDF (Max 5MB)</small>
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Submit Expense
            </button>
          </div>
        </form>
      </div>
    </StaffMobileLayout>
  );
}

export default AddExpense;