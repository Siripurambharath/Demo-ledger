import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHistory,
  FaTags,
  FaUser,
  FaSignOutAlt,
  FaArrowRight,
  FaClock
} from "react-icons/fa";
import "./Offers.css";

const Offers = () => {
 


  const offers = [
    {
      id: 1,
      title: "Electronics Festival",
      discount: "15% OFF",
      description: "Get 15% extra margin on all electronics purchases above ₹10,000",
      category: "Electronics",
      validity: "Dec 31, 2024",
      timeLeft: null,
      badge: "Featured"
    },
    {
      id: 2,
      title: "Mobile Flash Sale",
      discount: "20% OFF",
      description: "Limited time offer on all mobile phones and accessories",
      category: "Mobile",
      validity: "2 hours left",
      timeLeft: "2 hours left",
      badge: "Flash"
    },
    {
      id: 3,
      title: "Home Appliances Bonanza",
      discount: "12% OFF",
      description: "Special rates on refrigerators, washing machines, and ACs",
      category: "Home Appliances",
      validity: "Jan 15, 2025",
      timeLeft: null,
      badge: "Popular"
    },
    {
      id: 4,
      title: "Bulk Purchase Reward",
      discount: "5% EXTRA",
      description: "Additional 5% margin on orders above ₹50,000",
      category: "All Categories",
      validity: "Ongoing",
      timeLeft: null,
      badge: "Regular"
    }
  ];

  return (
    <div className="retailer-mobile-container">
      {/* Top Navigation Bar */}
      {/* <header className="retailer-top-nav">
        <div className="nav-logo">
          <h2>RetailPro</h2>
          <span>Retailer Portal</span>
        </div>
        
      </header> */}

      {/* Main Content */}
      <main className="retailer-mobile-main">
        {/* Header Section */}
        <div className="offers-header">
          <h1>Offers & Deals</h1>
          <p className="offers-subtitle">Exclusive offers just for you</p>
          <div className="divider"></div>
        </div>

        {/* Offers List */}
        <div className="offers-list">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              {/* Offer Header */}
              <div className="offer-header">
                <h2 className="offer-title">{offer.title}</h2>
                {offer.badge && (
                  <span className={`offer-badge ${offer.badge.toLowerCase()}`}>
                    {offer.badge}
                  </span>
                )}
              </div>
              
              {/* Discount Badge */}
              <div className="discount-badge">
                {offer.discount}
              </div>
              
              {/* Offer Description */}
              <p className="offer-description">{offer.description}</p>
              
              {/* Offer Details */}
              <div className="offer-details">
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <strong className="detail-value">{offer.category}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Valid until:</span>
                  <span className="detail-value">
                    {offer.timeLeft ? (
                      <span className="time-warning">
                        <FaClock className="clock-icon" />
                        {offer.validity}
                      </span>
                    ) : (
                      offer.validity
                    )}
                  </span>
                </div>
              </div>
              
              {/* View Details Button */}
              <button className="view-details-btn">
                View Details
                <FaArrowRight className="arrow-icon" />
              </button>
              
              <div className="offer-divider"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Offers;