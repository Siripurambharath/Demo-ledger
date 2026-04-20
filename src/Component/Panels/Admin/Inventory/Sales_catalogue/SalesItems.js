import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaMinusCircle,
  FaEye,
  FaShoppingBag,
  FaSearch,
  FaImages,
} from "react-icons/fa";
import AdminSidebar from "./../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "./../../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "./../../../../Layouts/TableLayout/ReusableTable";
import AddServiceModal from "../PurchasedItems/AddServiceModal";
import AddStockModal from "../PurchasedItems/AddStockModal";
import DeductStockModal from "../PurchasedItems/DeductStockModal";
import StockDetailsModal from "../PurchasedItems/StockDetailsModal";
import { baseurl } from "../../../../BaseURL/BaseURL";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./salesitems.css";
import ProductImagesModal from "./ProductImagesModal"; // We'll create this modal

const SalesItems = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false); // New state for images modal
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductImages, setSelectedProductImages] = useState([]); // New state for product images
  const [selectedProductName, setSelectedProductName] = useState(""); // New state for product name
  const [currentStockData, setCurrentStockData] = useState({
    opening_stock: 0,
    stock_in: 0,
    stock_out: 0,
    balance_stock: 0,
  });
  const [stockData, setStockData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/products`);
      const formatted = response.data
        .filter((item) => item.group_by === "Salescatalog")
        .map((item) => ({
          id: item.id,
          goods_name: item.goods_name,
          price: item.price,
          description: item.description,
          gst_rate: item.gst_rate,
          updatedBy: "System",
          updatedOn: new Date(item.updated_at).toLocaleDateString(),
          opening_stock: item.opening_stock || 0,
          stock_in: item.stock_in || 0,
          stock_out: item.stock_out || 0,
          balance_stock: item.balance_stock || 0,
          category_id: item.category_id,
          company_id: item.company_id,
          inclusive_gst: item.inclusive_gst,
          non_taxable: item.non_taxable,
          net_price: item.net_price,
          hsn_code: item.hsn_code,
          unit: item.unit,
          cess_rate: item.cess_rate,
          cess_amount: item.cess_amount,
          sku: item.sku,
          opening_stock_date: item.opening_stock_date,
          min_stock_alert: item.min_stock_alert,
          max_stock_alert: item.max_stock_alert,
          can_be_sold: item.can_be_sold,
          maintain_batch: item.maintain_batch,
          images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [], // Parse images
        }));
      setItems(formatted);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ✅ Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${baseurl}/products/${productId}`);
      setItems((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error.response || error.message);
      alert("Failed to delete product");
    }
  };

  // ✅ View Product Images
  const handleViewImages = async (productId, productName) => {
    try {
      setSelectedProductId(productId);
      setSelectedProductName(productName);
      
      // Get product details to fetch images
      const response = await axios.get(`${baseurl}/products/${productId}`);
      const product = response.data;
      
      let images = [];
      if (product.images) {
        images = typeof product.images === 'string' 
          ? JSON.parse(product.images) 
          : product.images;
      }
      
      setSelectedProductImages(Array.isArray(images) ? images : []);
      setShowImagesModal(true);
    } catch (error) {
      console.error("Error fetching product images:", error);
      alert("Failed to load product images");
    }
  };

  const handleAddStock = async (stockData) => {
    try {
      const { quantity, remark, batchId } = stockData;
      
      console.log('Sending request with:', {
        productId: selectedProductId,
        quantity: quantity, 
        remark: remark || '',
        batchId: batchId
      });

      await axios.post(`${baseurl}/stock/${selectedProductId}`, {
        quantity: quantity,
        remark: remark || '',
        batchId: batchId
      });
      
      fetchProducts();
      alert("Stock added successfully!");
    } catch (error) {
      console.error('Error adding stock:', error);
      alert("Failed to add stock: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Deduct Stock
  const handleDeductStock = async (stockData) => {
    try {
      const { quantity, remark, batchId } = stockData;
      
      console.log('Sending deduct stock request:', {
        productId: selectedProductId,
        quantity: quantity,
        remark: remark || '',
        batchId: batchId,
      });

      await axios.post(`${baseurl}/stock-deducted/${selectedProductId}`, {
        quantity: quantity,
        remark: remark || '',
        batchId: batchId,
      });
      
      fetchProducts();
      alert("Stock deducted successfully!");
    } catch (error) {
      console.error('Error deducting stock:', error);
      alert("Failed to deduct stock: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Edit Product
  const handleEditClick = (product) => {
    navigate(`/salesitemspage/${product.id}`);
  };

  // ✅ Search Filter
  const filteredItems = items.filter(
    (item) =>
      item.goods_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.gst_rate?.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.updatedBy?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Table Columns
  const columns = [
    {
      key: "goods_name",
      title: "Product Name",
      render: (_, record) => (
        <div>
          <FaShoppingBag className="me-2 text-info" />
          <Link
            to={`/salesitems_productdetails/${record.id}`}
            className="text-primary text-decoration-none fw-semibold"
          >
            {record.goods_name}
          </Link>
          <br />
          <span className="text-muted">RS. {record.price}</span>
          {record.images && record.images.length > 0 && (
            <div className="mt-1">
              <small className="text-success">
                <FaImages className="me-1" size={12} />
                {record.images.length} image{record.images.length !== 1 ? 's' : ''}
              </small>
            </div>
          )}
        </div>
      ),
    },
    { key: "description", title: "Description" },
    { key: "gst_rate", title: "GST Rate" },
    { key: "updatedBy", title: "Updated By" },
    {
      key: "actions",
      title: "Action",
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <FaEdit
            className="text-success me-2 action-icon"
            onClick={() => handleEditClick(record)}
            title="Edit Product"
          />
          <FaTrash
            className="text-danger me-2 action-icon"
            onClick={() => handleDeleteProduct(record.id)}
            title="Delete Product"
          />
          <FaPlusCircle
            className="text-warning me-2 action-icon"
            onClick={() => {
              setSelectedProductId(record.id);
              setCurrentStockData(record);
              setShowStockModal(true);
            }}
            title="Add Stock"
          />
          <FaMinusCircle
            className="text-danger me-2 action-icon"
            onClick={() => {
              setSelectedProductId(record.id);
              setCurrentStockData(record);
              setShowDeductModal(true);
            }}
            title="Deduct Stock"
          />
          <FaImages
            className="text-info me-2 action-icon"
            onClick={() => handleViewImages(record.id, record.goods_name)}
            title="View Images"
            style={{ 
              cursor: 'pointer',
              opacity: record.images && record.images.length > 0 ? 1 : 0.5 
            }}
          />
          <FaEye
            className="text-primary action-icon"
            onClick={() => {
              setStockData(record);
              setShowViewModal(true);
            }}
            title="View Stock Details"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          user={user}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <div className="container-fluid mt-3 sales-items-wrapper">
          <div className="d-flex justify-content-between mb-3 flex-wrap">
            {/* Left: Search Box */}
            <div className="sales-items-search-container me-3 flex-grow-1">
              <div className="sales-items-search-box position-relative">
                <input
                  type="text"
                  placeholder="Search sales items..."
                  className="sales-items-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FaSearch className="sales-items-search-icon" size={18} />
              </div>
            </div>


{/* Right: Buttons */}
<div className="d-flex gap-2 flex-shrink-0 mt-0">
  {/* Sales Catalogue Dropdown */}
  <div className="dropdown">
    <button
      className="btn btn-info dropdown-toggle d-flex align-items-center"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i className="bi bi-list me-2"></i> Sales Catalogue
    </button>
    <ul className="dropdown-menu">
      <li>
        <a className="dropdown-item" href="/sale_items">
          Sales Catalogue
        </a>
      </li>
      <li>
        <a className="dropdown-item" href="/purchased_items">
          Purchased Items
        </a>
      </li>
    </ul>
  </div>

  {/* Import Button */}
{/* 
 <div className="dropdown">
  <button
    className="btn btn-primary dropdown-toggle d-flex align-items-center justify-content-center"
    type="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i className="bi bi-download me-2"></i>
    Bulk
  </button>

  <ul className="dropdown-menu">
    <li>
      <button
        className="dropdown-item d-flex align-items-center justify-content-center"
        onClick={() => navigate("/export-sales")}
      >
        <i className="bi bi-box-arrow-down me-2"></i>
        Export
      </button>
    </li>
    <li>
      <button
        className="dropdown-item d-flex align-items-center justify-content-center"
        onClick={() => navigate("/import-sales")}
      >
        <i className="bi bi-box-arrow-up me-2"></i>
        Import
      </button>
    </li>
  </ul>
</div> */}

  <button
    className="btn btn-primary d-flex align-items-center justify-content-center"
        onClick={() => navigate("/import-sales")}
      >
        <i className="bi bi-box-arrow-up me-2"></i>
        Import
      </button>
    

  {/* ADD Dropdown */}
  <div className="dropdown">
    <button
      className="btn btn-success dropdown-toggle d-flex align-items-center"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i className="bi bi-plus-circle me-2"></i> ADD
    </button>
    <ul className="dropdown-menu">
      <li>
        <button
          className="dropdown-item"
          onClick={() => navigate("/salesitemspage")}
        >
          Products
        </button>
      </li>
      <li>
        <button
          className="dropdown-item"
          onClick={() => setShowServiceModal(true)}
        >
          Services
        </button>
      </li>
    </ul>
  </div>
</div>
          </div>

          {/* ✅ Table */}
          <ReusableTable
            data={filteredItems}
            columns={columns}
            initialEntriesPerPage={10}
            showSearch={false}
            showPagination={true}
          />
        </div>
      </div>

      {/* ✅ Modals */}
      <AddServiceModal
        show={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        groupType="Salescatalog"
      />
      <AddStockModal
        show={showStockModal}
        onClose={() => setShowStockModal(false)}
        currentStock={currentStockData.balance_stock}
        onSave={handleAddStock}
        selectedProductId={selectedProductId} 
      />
      <DeductStockModal
        show={showDeductModal}
        onClose={() => setShowDeductModal(false)}
        currentStock={currentStockData.balance_stock}
        onSave={handleDeductStock}
        selectedProductId={selectedProductId} 
      />
      <StockDetailsModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        stockData={stockData}
        context="sales"
      />
      
      {/* Product Images Modal */}
      <ProductImagesModal
        show={showImagesModal}
        onClose={() => setShowImagesModal(false)}
        productName={selectedProductName}
        images={selectedProductImages}
        productId={selectedProductId}
        onImageDeleted={() => {
          fetchProducts(); // Refresh the products list
        }}
      />
    </div>
  );
};

export default SalesItems;