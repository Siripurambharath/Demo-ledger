import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaStar,
  FaUsers,
  FaUserTie,
  FaChartBar,
  FaBoxes,
  FaTags,
  FaMoneyBill,
  FaFileAlt,
  FaKey,
  FaBars,
  FaTimes,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaBookOpen,
  FaShoppingCart,
  FaChartLine,
  FaBox,
  FaHandHoldingUsd,
  FaReceipt,
  FaFileInvoice,
  FaFileContract,
  FaTruck,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaFileInvoice as FaPurchaseInvoice,
  FaClipboardCheck,
  FaStickyNote,
  FaFileExport,
  FaMoneyBillWave,
  FaRuler,
  FaCalendarAlt,
  FaHourglass,
} from "react-icons/fa";
import { FiHome } from 'react-icons/fi';

import "./AdminSidebar.css";
import UserCard from "../../Panels/UserCard/UserCard";

function AdminSidebar({ isCollapsed, setIsCollapsed, onToggleMobile }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth <= 1024 && window.innerWidth > 768
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width <= 1024 && width > 768;

      setIsMobile(mobile);
      setIsTablet(tablet);

      if (!mobile && !tablet) setIsMobileOpen(false);
      if (tablet && isCollapsed === undefined) setIsCollapsed(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  // Handle mobile toggle
  useEffect(() => {
    if (onToggleMobile !== undefined) setIsMobileOpen(onToggleMobile);
  }, [onToggleMobile]);

  // Keep dropdown open when route matches
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/sales/")) return setOpenDropdown("Sales");
    if (path.startsWith("/purchase/")) return setOpenDropdown("Purchase");

    if (
      path.startsWith("/sale_items") ||
      path.startsWith("/purchased_items") ||
      path.startsWith("/category") ||
      path.startsWith("/company") ||
      path.startsWith("/units")
    ) return setOpenDropdown("Inventory");

    if (path.startsWith("/retailersscore") || path.startsWith("/salesmanscore"))
      return setOpenDropdown("Scores");

    // Check for Kacha Sales paths
    if (
      path.startsWith("/kachinvoicetable") ||
      path.startsWith("/kachareceipts") ||
      path.startsWith("/kachacreditenotetable") ||
      path.startsWith("/kachacreditenote") ||
      path.startsWith("/kacha_sales")
    ) {
      return setOpenDropdown("Kacha Sales");
    }

    // Check for Kacha Purchase paths
    if (
      path.startsWith("/kachapurchaseinvoicetable") ||
      path.startsWith("/kachaPurchasevoucher") ||
      path.startsWith("/kachadebitnotetable") ||
      path.startsWith("/kachaPurchase") ||
      path.startsWith("/kachapurchase")
    ) {
      return setOpenDropdown("Kacha Purchase");
    }

  }, [location.pathname]);


  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleLogoClick = () => {
    if (isTablet) setIsCollapsed((prev) => !prev);
    else if (isMobile) setIsMobileOpen((prev) => !prev);
  };

  const menuItems = [
    { path: "/admindashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/retailers", name: "Contacts", icon: <FaUsers /> },
    { path: "/staff", name: "Staff", icon: <FaUserTie /> },
    { path: "/sales_visit", name: "Sales Visit", icon: <FaClipboardList /> },
    { path: "/credit-period", name: "Credit Period Fix", icon: <FaCalendarAlt /> },
    {
      path: "/period",
      name: "Order List",
      icon: <FaHourglass />
    },
    {
      name: "Scores",
      icon: <FaStar />,
      subMenu: [
        { path: "/retailersscore", name: "Retailer Score", icon: <FaStar /> },
        { path: "/salesmanscore", name: "Salesperson Score", icon: <FaStar /> },
      ],
    },
    {
      name: "Inventory",
      icon: <FaHandHoldingUsd />,
      subMenu: [
        { path: "/sale_items", name: "Sales Catalogue", icon: <FaBookOpen /> },
        { path: "/purchased_items", name: "Purchased Items", icon: <FaShoppingCart /> },
        { path: "/category", name: "Category", icon: <FaTags /> },
        { path: "/company", name: "Company", icon: <FaBoxes /> },
        { path: "/units", name: "Units", icon: <FaRuler /> },
      ],
    },
    {
      name: "Sales",
      icon: <FaChartLine />,
      subMenu: [
        { path: "/sales/invoices", name: "Invoices", icon: <FaFileInvoice /> },
        { path: "/sales/receipts", name: "Receipts", icon: <FaReceipt /> },
        { path: "/sales/credit_note", name: "Credit Note", icon: <FaCreditCard /> },
      ],
    },
    {
      name: "Purchase",
      icon: <FaBox />,
      subMenu: [
        { path: "/purchase/purchase-invoice", name: "Purchase Invoice", icon: <FaPurchaseInvoice /> },
        { path: "/purchase/voucher", name: "Voucher", icon: <FaStickyNote /> },
        { path: "/purchase/debit-note", name: "Debit Note", icon: <FaFileExport /> },
      ],
    },
    {
      name: "Kacha Sales",
      icon: <FaChartLine />,
      subMenu: [
        { path: "/kachinvoicetable", name: "Kacha Sales Invoices", icon: <FaFileInvoice /> },
        { path: "/kachareceipts", name: "Kacha Receipts", icon: <FaReceipt /> },
        { path: "/kachacreditenotetable", name: "Kacha Credit Note", icon: <FaCreditCard /> },
      ],
    },
    {
      name: "Kacha Purchase",
      icon: <FaBox />,
      subMenu: [
        { path: "/kachapurchaseinvoicetable", name: "Kacha Purchase", icon: <FaPurchaseInvoice /> },
        { path: "/kachaPurchasevoucher", name: "Kacha Purchase Voucher", icon: <FaStickyNote /> },
        { path: "/kachadebitnotetable", name: "Kacha Debit Note", icon: <FaFileExport /> },
      ],
    },
    { path: "/admin_expensive", name: "Expense Requests", icon: <FaMoneyBillWave /> },
    { path: "/ledger", name: "Ledger", icon: <FiHome /> },
    { path: "/expenses", name: "Expenses", icon: <FaMoneyBill /> },
    { path: "/admin/marketing/offers-postings", name: "Offers & Marketing", icon: <FaTags /> },
    { path: "/reports", name: "Reports", icon: <FaFileAlt /> },
    { path: "/roleaccess", name: "Role Access", icon: <FaKey /> },
  ];

  const handleOverlayClick = () => setIsMobileOpen(false);
  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);

  const isPurchaseActive = location.pathname.startsWith("/purchase/");
  
  // Check if current path is a Kacha Sales page
  const isKachaSalesActive = 
    location.pathname.startsWith("/kachinvoicetable") ||
    location.pathname.startsWith("/kachareceipts") ||
    location.pathname.startsWith("/kachacreditenotetable") ||
    location.pathname.startsWith("/kachacreditenote") ||
    location.pathname.startsWith("/kacha_sales");
  
  // Check if current path is a Kacha Purchase page
  const isKachaPurchaseActive = 
    location.pathname.startsWith("/kachapurchaseinvoicetable") ||
    location.pathname.startsWith("/kachaPurchasevoucher") ||
    location.pathname.startsWith("/kachadebitnotetable") ||
    location.pathname.startsWith("/kachaPurchase") ||
    location.pathname.startsWith("/kachapurchase");

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle" onClick={handleMobileToggle}>
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {isMobileOpen && isMobile && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "open" : ""
          } ${isMobile ? "mobile" : ""} ${isTablet ? "tablet" : ""}`}
      >
        <div className="sidebar-header">
          <h2
            className="logo"
            onClick={handleLogoClick}
            style={{ cursor: isTablet ? "pointer" : "default" }}
          >
            {isCollapsed || isMobile || isTablet ? "RP" : "RetailPro"}
          </h2>

          {!isMobile && !isTablet && (
            <button
              className="sidebar-collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <FaBars />
            </button>
          )}

          {isMobile && isMobileOpen && (
            <button className="sidebar-close-btn" onClick={handleMobileToggle}>
              <FaTimes />
            </button>
          )}
        </div>

        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.subMenu ? (
                  <>
                    <button
                      className={`dropdown-btn-link ${openDropdown === item.name ? "open" : ""
                        } ${(item.name === "Inventory" &&
                          (location.pathname.startsWith("/sale_items") ||
                            location.pathname.startsWith("/purchased_items") ||
                            location.pathname.startsWith("/category") ||
                            location.pathname.startsWith("/company") ||
                            location.pathname.startsWith("/units"))) ||
                          (item.name === "Sales" &&
                            location.pathname.startsWith("/sales/")) ||
                          (item.name === "Purchase" && isPurchaseActive) ||
                          (item.name === "Kacha Sales" && isKachaSalesActive) ||
                          (item.name === "Kacha Purchase" && isKachaPurchaseActive)
                          ? "active"
                          : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(item.name);
                      }}
                    >
                      <span className="icon">{item.icon}</span>
                      {!isMobile && !isTablet && !isCollapsed && (
                        <>
                          <span className="link-text">{item.name}</span>
                          <span className="dropdown-arrow">
                            {openDropdown === item.name ? (
                              <FaChevronUp size={12} />
                            ) : (
                              <FaChevronDown size={12} />
                            )}
                          </span>
                        </>
                      )}
                    </button>

                    {openDropdown === item.name && (
                      <ul className="submenu">
                        {item.subMenu.map((sub) => (
                          <li
                            key={sub.path}
                            className={
                              location.pathname === sub.path ? "active" : ""
                            }
                          >
                            <NavLink
                              to={sub.path}
                              className="submenu-link"
                              onClick={() => {
                                if (isMobile) {
                                  setIsMobileOpen(false);
                                }
                              }}
                              end
                            >
                              <span className="submenu-icon">{sub.icon}</span>
                              {!isMobile && (!isCollapsed || !isTablet) && (
                                <span className="submenu-text">{sub.name}</span>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                    onClick={() => {
                      if (isMobile) setIsMobileOpen(false);
                    }}
                    end
                  >
                    <span className="icon">{item.icon}</span>
                    {!isMobile && (!isCollapsed || !isTablet) && (
                      <span className="link-text">{item.name}</span>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <UserCard isCollapsed={isCollapsed || isTablet || isMobile} />
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;