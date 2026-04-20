import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Products.css";

function Products() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  // Sample product data
  const productsData = [
    {
      id: 1,
      serial: 1,
      image: "1",
      product: "Example Product",
      category: "Category A",
      price: "$199",
      stock: 50,
      description: "Sample description goes here.",
    },
    // Add more products as needed
  ];

  // Table columns configuration
  const columns = [
    {
      key: "serial",
      title: "#",
      style: { width: "60px", textAlign: "center" }
    },
    {
      key: "image",
      title: "Image",
      style: { width: "80px", textAlign: "center" },
      render: (item) => (
        <div className="product-image">
          {item.image}
        </div>
      ),
    },
    {
      key: "product",
      title: "Product",
      render: (item) => <div className="product-name">{item.product}</div>
    },
    {
      key: "category",
      title: "Category",
      render: (item) => <span className="category-badge">{item.category}</span>
    },
    {
      key: "price",
      title: "Price",
      render: (item) => <div className="product-price">{item.price}</div>
    },
    {
      key: "stock",
      title: "Stock",
      render: (item) => (
        <span className={`stock-badge ${item.stock < 20 ? "low-stock" : ""}`}>
          {item.stock}
        </span>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (item) => (
        <div className="description-cell">
          {item.description}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (item) => (
        <div className="action-buttons">
          <button className="btn-edit">Edit</button>
          <button className="btn-delete">Delete</button>
        </div>
      ),
      style: { width: "150px" }
    },
  ];

  return (
    <div className="products-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area with Header */}
      <div className={`products-content-with-header ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="products-main-content">
          <div className="products-container">
            
            {/* Page Header */}
            <div className="page-header-section">
              <h1 className="page-title">Product Management</h1>
            </div>

            {/* Controls Section */}
            <div className="products-controls-section">
              <div className="search-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="action-controls">
                <button className="add-product-btn" onClick={handleAddProduct}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14m-7-7h14" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Product
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
              <ReusableTable
                data={productsData}
                columns={columns}
                searchPlaceholder="Search products..."
                initialEntriesPerPage={10}
                showSearch={false}
                showEntriesSelector={true}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;