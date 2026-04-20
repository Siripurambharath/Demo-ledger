import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBullseye,
  FaClipboardList,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaMoneyBillWave 
} from "react-icons/fa";
import "./StaffMobileLayout.css";

function StaffMobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/staffdashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/staff/retailers", icon: <FaBullseye />, label: "Retailers" },
    { path: "/staff/sales-visits", icon: <FaClipboardList />, label: "Sales Visits" },
    // { path: "/staff/expences", icon: <FaChartLine />, label: "Expenses" },
    { path: "/staff/offers", icon: <FaUser />, label: "Offers" },
    { path: "/staff_expensive", icon: <FaMoneyBillWave />, label: "Expenses" },
  ];

  const isActive = (path) => location.pathname === path;

 const handleLogout = () => {
  // Clear staff-related localStorage items
  localStorage.removeItem("user");
  localStorage.removeItem("isStaff");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loginTime");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  
  // Navigate to home page
  navigate("/");
  
  console.log("Staff logged out");
};

  return (
    <div className="staff-mobile-container">
      {/* Top Navigation Bar */}
      <header className="staff-top-nav">
        <div className="nav-logo">
          <h2>RetailPro</h2>
          <span>Staff Dashboard</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          {/* <span>Logout</span> */}
        </button>
      </header>

      {/* Main Content */}
      <main className="staff-mobile-main">{children}</main>

      {/* Bottom Navigation */}
      <nav className="staff-bottom-nav">
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

export default StaffMobileLayout;