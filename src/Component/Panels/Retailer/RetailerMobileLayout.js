import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHistory,
  FaTags,
  FaUser,
  FaSignOutAlt,
  FaShoppingCart
} from "react-icons/fa";
import "./RetailerMobileLayout.css";

function RetailerMobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/retailer-home", icon: <FaHome />, label: "Home" },
    { path: "/retailer-offers", icon: <FaTags />, label: "Offers" },
    { path: "/retailer-orders", icon: <FaShoppingCart />, label: "Orders" },
    { path: "/retailer-history", icon: <FaHistory />, label: "History" },
    { path: "/retailer-profile", icon: <FaUser />, label: "Profile" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout clicked");
    navigate("/");
  };

  return (
    <div className="retailer-mobile-container">
      {/* Top Navigation Bar */}
      <header className="retailer-top-nav">
        <div className="nav-logo">
          <h2>RetailPro</h2>
          <span>Retailer Portal</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="retailer-mobile-main">{children}</main>

      {/* Bottom Navigation */}
      <nav className="retailer-bottom-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default RetailerMobileLayout;