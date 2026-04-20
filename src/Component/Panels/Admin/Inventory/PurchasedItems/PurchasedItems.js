import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlusCircle, FaMinusCircle, FaEye, FaSearch, FaShoppingBag } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
import ReusableTable from "../../../../Layouts/TableLayout/ReusableTable";
import AddServiceModal from "./AddServiceModal";
import AddStockModal from "./AddStockModal";
import DeductStockModal from "./DeductStockModal";
import StockDetailsModal from "./StockDetailsModal";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./PurchasedItems.css";
import { FaImages } from "react-icons/fa";
import ProductImagesModal from "./ProductImagesModal";
import AdminHeader from "../../../../Shared/AdminSidebar/AdminHeader";

const PurchasedItems = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [currentStockData, setCurrentStockData] = useState({
    opening_stock: 0,
    stock_in: 0,
    stock_out: 0,
    balance_stock: 0,
  });

  const [showImagesModal, setShowImagesModal] = useState(false); // For images modal
  const [selectedProductImages, setSelectedProductImages] = useState([]); // For product images
  const [selectedProductName, setSelectedProductName] = useState(""); // For product name

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/products`);
      const formatted = response.data
        .filter((item) => item.group_by === "Purchaseditems")
        .map((item) => ({
          id: item.id,
          goods_name: item.goods_name,
          price: item.price,
          description: item.description,
          gst: item.gst_rate,
          updatedBy: 'System',
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
          // ADD THIS LINE for images:
          images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
        }));
      setItems(formatted);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${baseurl}/products/${id}`);
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleEditClick = (product) => {
    navigate(`/AddProductPage/${product.id}`);
  };

  const handleAddStock = async (stockData) => {
    try {
      const { quantity, remark, batchId } = stockData;

      await axios.post(`${baseurl}/stock/${selectedProductId}`, {
        quantity,
        remark: remark || '',
        batchId
      });

      fetchProducts();
      alert("Stock added successfully!");
      setSelectedProductId(null); // reset after save
    } catch (error) {
      console.error('Error adding stock:', error);
      alert("Failed to add stock: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeductStock = async (stockData) => {
    try {
      const { quantity, remark, batchId } = stockData;

      await axios.post(`${baseurl}/stock-deducted/${selectedProductId}`, {
        quantity,
        remark: remark || '',
        batchId
      });

      fetchProducts();
      alert("Stock deducted successfully!");
      setSelectedProductId(null); // reset after save
    } catch (error) {
      console.error('Error deducting stock:', error);
      alert("Failed to deduct stock: " + (error.response?.data?.message || error.message));
    }
  };

  // ADD THIS FUNCTION:
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



  const filteredItems = items.filter((item) =>
    item.goods_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase()) ||
    item.gst?.toString().toLowerCase().includes(search.toLowerCase()) ||
    item.updatedBy?.toLowerCase().includes(search.toLowerCase()) ||
    item.updatedOn?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "goods_name",
      title: "Product Name",
      render: (_, item) => (
        <div className="product-name-cell">
          <FaShoppingBag className="me-2 text-info" />
          <Link
            to={`/salesitems_productdetails/${item?.id ?? 0}`}
            className="product-name-link"
          >
            {item?.goods_name || "N/A"}
          </Link>
          <br />
          <span className="text-muted">Rs. {item?.price ?? 0}</span>
          {item.images && item.images.length > 0 && (
            <div className="mt-1">
              <small className="text-success">
                <FaImages className="me-1" size={12} />
                {item.images.length} image{item.images.length !== 1 ? 's' : ''}
              </small>
            </div>
          )}
        </div>
      ),
    },
    { key: "description", title: "Description" },
    { key: "gst", title: "GST Rate" },
    { key: "updatedBy", title: "Updated By" },
    { key: "updatedOn", title: "Updated On" },
    {
      key: "action",
      title: "Action",
      render: (_, item) => (
        <>
          {item && (
            <>
              <FaEdit
                className="text-success me-2 action-icon"
                title="Edit"
                onClick={() => handleEditClick(item)}
              />
              <FaTrash
                className="text-danger me-2 action-icon"
                title="Delete"
                onClick={() => handleDeleteProduct(item.id)}
              />
              <FaPlusCircle
                className="text-warning me-2 action-icon"
                title="Add Stock"
                onClick={() => {
                  setSelectedProductId(item.id);
                  setCurrentStockData(item);
                  setShowStockModal(true);
                }}
              />
              <FaMinusCircle
                className="text-danger me-2 action-icon"
                title="Deduct Stock"
                onClick={() => {
                  setSelectedProductId(item.id);
                  setCurrentStockData(item);
                  setShowDeductModal(true);
                }}
              />
              <FaImages
                className="text-info me-2 action-icon"
                title="View Images"
                onClick={() => handleViewImages(item.id, item.goods_name)}
                style={{
                  cursor: 'pointer',
                  opacity: item.images && item.images.length > 0 ? 1 : 0.5
                }}
              />
              <FaEye
                className="text-primary action-icon"
                title="View Details"
                onClick={() => {
                  setSelectedItem(item);
                  setShowViewModal(true);
                }}
              />
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <div className="container-fluid mt-3 purchased-items-wrapper">
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <div className="purchase-items-search-container flex-grow-1 me-3">
              <div className="purchase-items-search-box position-relative">
                <input
                  type="text"
                  placeholder="Search purchased items..."
                  className="purchase-items-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FaSearch className="purchase-items-search-icon" size={18} />
              </div>
            </div>
            <div className="d-flex gap-2 flex-shrink-0 mt-2 mt-md-0">
              <div className="dropdown">
                <button
                  className="btn btn-info dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-list me-2"></i> Purchased Items
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="/purchased_items">
                      Purchased Items
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/sale_items">
                      Sales Catalog
                    </a>
                  </li>
                </ul>
              </div>

               <div className="dropdown">
  {/* <button
    className="btn btn-primary dropdown-toggle d-flex align-items-center justify-content-center"
    type="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i className="bi bi-download me-2"></i>
    Bulk
  </button> */}

  {/* <ul className="dropdown-menu">
    <li>
      <button
        className="dropdown-item d-flex align-items-center justify-content-center"
        onClick={() => navigate("/export-sales")}
      >
        <i className="bi bi-box-arrow-down me-2"></i>
        Export
      </button>
    </li>
    <li> */}
      <button
    className="btn btn-primary d-flex align-items-center justify-content-center"
        onClick={() => navigate("/import_purchase")}
      >
        <i className="bi bi-box-arrow-up me-2"></i>
        Import
      </button>
    {/* </li> */}
  {/* </ul> */}
</div>
              <div className="dropdown">
                <button
                  className="btn btn-success dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-plus-circle me-2"></i> ADD
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/AddProductPage")}
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
          <ReusableTable
            data={filteredItems}
            columns={columns}
            initialEntriesPerPage={10}
            showSearch={false}
            showEntriesSelector={true}
            showPagination={true}
          />
        </div>
      </div>
      <AddServiceModal show={showServiceModal} onClose={() => setShowServiceModal(false)} groupType="Purchaseditems" />
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
        onClose={() => { setShowViewModal(false); setSelectedItem(null); }}
        stockData={selectedItem}
        batches={selectedItem?.batches || []}
        context="purchase"
      />
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

export default PurchasedItems;