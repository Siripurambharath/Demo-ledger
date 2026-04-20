import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./Staff_Add_expensive.css";
import { useNavigate } from "react-router-dom";
import { baseurl } from "../../../../BaseURL/BaseURL";

const Staff_Add_expensive = () => {
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    category: "",
    amount: "",
    date: "",
    note: "",
    staff_id: userId,
    staff_name: userName,
    status: "Pending",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseurl}/accounts`);
        const expenseCategories = response.data.filter(
          (item) => item.group && item.group.includes("Expenses")
        );
        setCategories(expenseCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If category dropdown changed, set both id and name
    if (name === "category_id") {
      const selectedCategory = categories.find((cat) => cat.id === parseInt(value));
      setFormData({
        ...formData,
        category_id: value,
        category: selectedCategory ? selectedCategory.name : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseurl}/expensive`, formData);
      console.log("Expense saved:", response.data);
      alert("Expense added successfully!");

      // Reset form but keep staff info
      setFormData({
        category_id: "",
        category: "",
        amount: "",
        date: "",
        note: "",
        staff_id: userId,
        staff_name: userName,
        status: "Pending",
      });
       navigate("/staff_expensive");
    } catch (error) {
      console.error("Error adding expense:", error.response?.data || error.message);
      alert(`Failed to add expense: ${error.response?.data?.error || error.message}`);
    }
  };

  const getTitle = () => "Add Expense";

  return (
    <StaffMobileLayout>
      <div className="staff_add_expense">
        <h1>{getTitle()}</h1>
        <p>Fill in the details to add an expense</p>
      </div>
      <div className="Staff_add_expense-container">
        <div className="Staff_add_expense-card">
          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Note */}
            <div className="form-group">
              <label>Note</label>
              <textarea
                name="note"
                placeholder="Enter note"
                value={formData.note}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="staff_add_expensive-cancel-save">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffMobileLayout>
  );
};

export default Staff_Add_expensive;
