import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../../../Shared/AdminSidebar/AdminHeader";
import RegularOffersList from "./RegularOffersList";
import FlashSalesList from "./FlashSalesList";
import CreateRegularOffer from "./CreateRegularOffer";
import CreateFlashSale from "./CreateFlashSale";
import "./OffersPostings.css";

function OffersPostings() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("regular");
  const [currentView, setCurrentView] = useState("list"); 
  const [editingOffer, setEditingOffer] = useState(null);
  const [editingFlashSale, setEditingFlashSale] = useState(null);
  const [regularSearchTerm, setRegularSearchTerm] = useState("");
  const [flashSearchTerm, setFlashSearchTerm] = useState("");
  const [regularFilterType, setRegularFilterType] = useState("All");

  // Handle navigation between views
  const handleShowCreateForm = () => {
    setCurrentView("create");
    setEditingOffer(null);
    setEditingFlashSale(null);
  };

  const handleShowEditForm = (item, type) => {
    if (type === "regular") {
      setEditingOffer(item);
      setEditingFlashSale(null);
    } else {
      setEditingFlashSale(item);
      setEditingOffer(null);
    }
    setCurrentView("create");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingOffer(null);
    setEditingFlashSale(null);
  };

  const handleCreateSuccess = () => {
    handleBackToList();
  };

  // Handle search term changes per tab
  const handleRegularSearchChange = (term) => {
    setRegularSearchTerm(term);
  };

  const handleFlashSearchChange = (term) => {
    setFlashSearchTerm(term);
  };

  const handleRegularFilterChange = (type) => {
    setRegularFilterType(type);
  };

  // Render current view based on state
  const renderCurrentView = () => {
    if (currentView === "list") {
      if (activeTab === "regular") {
        return (
          <RegularOffersList
            searchTerm={regularSearchTerm}
            filterType={regularFilterType}
            onSearchChange={handleRegularSearchChange}
            onFilterChange={handleRegularFilterChange}
            onAddNew={handleShowCreateForm}
            onEditItem={(offer) => handleShowEditForm(offer, "regular")}
          />
        );
      } else {
        return (
          <FlashSalesList
            searchTerm={flashSearchTerm}
            onSearchChange={handleFlashSearchChange}
            onAddNew={handleShowCreateForm}
            onEditItem={(sale) => handleShowEditForm(sale, "flash")}
          />
        );
      }
    } else if (currentView === "create") {
      if (activeTab === "regular") {
        return (
          <CreateRegularOffer
            editingOffer={editingOffer}
            onBack={handleBackToList}
            onSuccess={handleCreateSuccess}
          />
        );
      } else {
        return (
          <CreateFlashSale
            editingFlashSale={editingFlashSale}
            onBack={handleBackToList}
            onSuccess={handleCreateSuccess}
          />
        );
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset search terms and filters when switching tabs
    if (tab === "regular") {
      setFlashSearchTerm("");
    } else {
      setRegularSearchTerm("");
      setRegularFilterType("All");
    }
  };

  return (
    <div className="offers-postings-page">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`offers-postings-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="offers-postings-container">
          {/* Header Section */}
          <div className="offers-postings-header">
            <div className="offers-header-left">
              {currentView === "list" ? (
                <h1 className="offers-main-title">Offers & Flash Sales</h1>
              ) : (
                <div className="offers-create-header">
                  <button 
                    className="offers-back-btn"
                    onClick={handleBackToList}
                  >
                    ← Back to {activeTab === "regular" ? "Offers" : "Flash Sales"}
                  </button>
                  <h1 className="offers-main-title">
                    {editingOffer || editingFlashSale 
                      ? `Edit ${activeTab === "regular" ? "Offer" : "Flash Sale"}` 
                      : `Create New ${activeTab === "regular" ? "Offer" : "Flash Sale"}`
                    }
                  </h1>
                </div>
              )}
            </div>
            
            {currentView === "list" && (
              <button 
                className="offers-add-btn"
                onClick={handleShowCreateForm}
              >
                + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
              </button>
            )}
          </div>

          {/* Tab Navigation - Only show in list view */}
          {currentView === "list" && (
            <div className="offers-tab-navigation">
              <button 
                className={`offers-tab-btn ${activeTab === "regular" ? "offers-tab-active" : ""}`}
                onClick={() => handleTabChange("regular")}
              >
                Regular Offers
              </button>
              <button 
                className={`offers-tab-btn ${activeTab === "flash" ? "offers-tab-active" : ""}`}
                onClick={() => handleTabChange("flash")}
              >
                Flash Sales
              </button>
            </div>
          )}

          {/* Render the current view */}
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}

export default OffersPostings;