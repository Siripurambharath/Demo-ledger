import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import axios from "axios";
import "./Staff_expensive.css";
import { baseurl } from "../../../../BaseURL/BaseURL";

function Staff_expensive() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [retailersData, setRetailersData] = useState([]);

  // Get logged-in user from localStorage
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  useEffect(() => {
    const fetchExpensiveData = async () => {
      try {
        const response = await axios.get(`${baseurl}/expensive`); // your API endpoint
        // Filter by logged-in staff
        const filteredData = response.data.filter(
          (item) => item.staff_id === userId && item.staff_name === userName
        );
        setRetailersData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchExpensiveData();
  }, [userId, userName]);

  // Filter for search
  const filteredRetailers = retailersData.filter(
    (retailer) =>
      retailer.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRetailer = () => {
    navigate("/staff_add_expensive");
  };

  return (
    <StaffMobileLayout>
      <div className="my-retailers-mobile">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Expenses</h1>
              <p>Manage retailer relationships and track performance</p>
            </div>
            <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
              + Add Expense
            </button>
          </div>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search retailers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="retailers-section">
          <div className="section-header">
            <h2>Expense ({filteredRetailers.length})</h2>
            <p>Track retailer performance and manage relationships</p>
          </div>

          <div className="retailers-list">
            {filteredRetailers.map((retailer) => (
              <div key={retailer.id} className="retailer-card">
                <div className="retailer-header">
                  <h3>{retailer.category}</h3>
                  <span className="retailer-id">ID: {retailer.id}</span>
                </div>

                <div className="retailer-contact">
                  <div className="contact-phone">Amount: ₹ {retailer.amount}</div>
                  <div className="contact-email">Date: {new Date(retailer.date).toLocaleDateString()}</div>
                </div>

                <div className="retailer-details">
               
                  <p>Note: {retailer.note}</p>
                </div>

                <div className="retailer-status">
                  <span className={`status-badge ${retailer.status.toLowerCase()}`}>
                    {retailer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default Staff_expensive;
