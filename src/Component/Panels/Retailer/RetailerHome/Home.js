import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHistory,
  FaTags,
  FaUser,
  FaSignOutAlt,
  FaStar,
  FaRupeeSign,
  FaShoppingCart,
  FaTag,
  FaArrowUp,
  FaClock
} from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const location = useLocation();

 

  // Sample data for offers
  const offers = [
    {
      title: "Electronics Festival",
      description: "Get 15% extra on all purchases",
      timeLeft: null
    },
    {
      title: "Flash Sale",
      description: "Limited time offer - 2 hours left",
      timeLeft: "2 hours left"
    }
  ];

  // Sample data for transactions
  const transactions = [
    {
      product: "Samsung TV Purchase",
      time: "Today, 2:30 PM",
      amount: "₹8,500",
      status: "Kaccha",
      statusType: "pending"
    },
    {
      product: "Mobile Accessories",
      time: "Yesterday, 11:15 AM",
      amount: "₹2,300",
      status: "Pakka",
      statusType: "completed"
    }
  ];

  return (
    <div className="retailer-mobile-container">
     

      {/* Main Content */}
      <main className="retailer-mobile-main">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome, Rajesh Kumar</h1>
          <div className="store-info">
            <span className="store-name">ABC Electronics Store</span>
          </div>
        </div>

        {/* Score Card */}
        <div className="score-card">
          <div className="score-header">
            <span>Your Score</span>
            <div className="score-improvement">
              <FaArrowUp className="improvement-icon" />
              <span>+25 this month</span>
            </div>
          </div>
          <div className="score-main">
            <div className="score-value">850</div>
            <div className="score-rating">
              <FaStar className="star-icon" />
              <span>Excellent Rating</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <FaRupeeSign />
            </div>
            <div className="stat-info">
              <div className="stat-value">45,230</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaShoppingCart />
            </div>
            <div className="stat-info">
              <div className="stat-value">12</div>
              <div className="stat-label">Transactions</div>
            </div>
          </div>
        </div>

        {/* Active Offers Section */}
        <div className="section-container">
          <h2 className="section-title">Active Offers</h2>
          <div className="offers-list">
            {offers.map((offer, index) => (
              <div key={index} className="offer-item">
                <div className="offer-content">
                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-description">{offer.description}</p>
                  {offer.timeLeft && (
                    <div className="time-left">
                      <FaClock className="clock-icon" />
                      <span>{offer.timeLeft}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="section-container">
          <h2 className="section-title">Recent Transactions</h2>
          <div className="transactions-list">
            {transactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <h3 className="transaction-product">{transaction.product}</h3>
                  <p className="transaction-time">{transaction.time}</p>
                </div>
                <div className="transaction-details">
                  <div className="transaction-amount">{transaction.amount}</div>
                  <div className={`transaction-status ${transaction.statusType}`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

    
    </div>
  );
};

export default Home;