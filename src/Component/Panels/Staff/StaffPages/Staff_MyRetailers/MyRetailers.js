import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./MyRetailers.css";

function MyRetailers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const retailersData = [
    {
      id: 1,
      name: "Sharma Electronics",
      contact: "+91 98765 43210",
      email: "sharma@email.com",
      type: "Electronics",
      location: "Delhi",
      performance: "7.85 / 10",
      sales: "₹ 125,000",
      status: "Active"
    },
    {
      id: 2,
      name: "Gupta General Store",
      contact: "+91 98765 43211",
      email: "gupta@email.com",
      type: "General Store",
      location: "Mumbai",
      performance: "7.72 / 10",
      sales: "₹ 89,000",
      status: "Active"
    },
    {
      id: 3,
      name: "Khan Textiles",
      contact: "+91 98765 43212",
      email: "khan@email.com",
      type: "Textiles",
      location: "Bangalore",
      performance: "7.91 / 10",
      sales: "₹ 156,000",
      status: "Active"
    }
  ];

  const filteredRetailers = retailersData.filter(retailer =>
    retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRetailer = () => {
    navigate("/staff/add-retailer");
  };

  return (
    <StaffMobileLayout>
      <div className="my-retailers-mobile">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>My Retailers</h1>
              <p>Manage retailer relationships and track performance</p>
            </div>
            <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
              + Add Retailer
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
            <h2>Retailers ({filteredRetailers.length})</h2>
            <p>Track retailer performance and manage relationships</p>
          </div>

          <div className="retailers-list">
            {filteredRetailers.map(retailer => (
              <div key={retailer.id} className="retailer-card">
                <div className="retailer-header">
                  <h3>{retailer.name}</h3>
                  <span className="retailer-id">ID: {retailer.id}</span>
                </div>
                
                <div className="retailer-contact">
                  <div className="contact-phone">{retailer.contact}</div>
                  <div className="contact-email">{retailer.email}</div>
                </div>

                <div className="retailer-details">
                  <div className="type-location">
                    <span className="retailer-type">{retailer.type}</span>
                    <span className="retailer-location">{retailer.location}</span>
                  </div>
                </div>

                <div className="retailer-performance">
                  <div className="performance-score">
                    <span className="score-icon">▼</span>
                    {retailer.performance}
                  </div>
                  <div className="sales-amount">{retailer.sales}</div>
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

export default MyRetailers;