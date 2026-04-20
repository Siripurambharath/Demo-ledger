import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";

const UserCard = ({ isCollapsed = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isRetailer");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    
    // Navigate to home page
    navigate("/");
    
    console.log("User logged out");
  };

  return (
    <div className={`user-card ${isCollapsed ? "collapsed" : ""}`}>
      {/* User Info - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="user-info">
          <span className="user-name">Admin User</span>
          <span className="user-email">admin@gmail.com</span>
        </div>
      )}

      {/* Logout Icon - Always show but adjust based on collapsed state */}
      <button 
        className={`logout-btn ${isCollapsed ? "icon-only" : ""}`} 
        onClick={handleLogout}
        title={isCollapsed ? "Logout" : ""}
      >
        <FaSignOutAlt className="logout-icon" />
      </button>
    </div>
  );
};

export default UserCard;