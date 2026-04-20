import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "./../../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import "./Salesitems_productsdetails.css";

const Salesitems_productsdetails = ({ user }) => {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productData, setProductData] = useState(null);
  const [voucherData, setVoucherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voucherError, setVoucherError] = useState(null);
  const [stockAlerts, setStockAlerts] = useState([]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/products/${id}/with-batches`);
   console.log("Product Data from API:", response.data); // ADD THIS LINE
      setProductData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Failed to load product details. Please try again.");
      setLoading(false);
    }
  };

  const fetchVouchersByProduct = async (productId) => {
    try {
      setVoucherLoading(true);
      setVoucherError(null);
      const response = await axios.get(`${baseurl}/vouchers/by-product/${productId}`);
      setVoucherData(response.data);
      setVoucherLoading(false);
    } catch (error) {
      console.error("Error fetching voucher data:", error);
      setVoucherError("Failed to load sales transactions.");
      setVoucherLoading(false);
    }
  };

  const checkBatchStockAlerts = () => {
    if (!productData || !productData.batches) return;

    const alerts = [];
    const minAlert = parseFloat(productData.min_stock_alert) || 0;
    const maxAlert = parseFloat(productData.max_stock_alert) || 0;

    productData.batches.forEach(batch => {
      const batchQuantity = parseFloat(batch.current_stock || batch.quantity) || 0;
      const batchNumber = batch.batch_number || 'N/A';

      if (minAlert > 0 && batchQuantity <= minAlert) {
        alerts.push({
          type: 'min_stock',
          message: `⚠️ Low Stock Alert! Batch ${batchNumber} of ${productData.goods_name} has only ${batchQuantity} units (Min: ${minAlert})`,
          level: 'danger',
          batchNumber: batchNumber
        });
      }

      if (maxAlert > 0 && batchQuantity >= maxAlert) {
        alerts.push({
          type: 'max_stock',
          message: `📦 High Stock Alert! Batch ${batchNumber} of ${productData.goods_name} has ${batchQuantity} units (Max: ${maxAlert})`,
          level: 'warning',
          batchNumber: batchNumber
        });
      }
    });

    setStockAlerts(alerts);

    if (alerts.length > 0) {
      setTimeout(() => {
        setStockAlerts([]);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (productData && productData.id) {
      fetchVouchersByProduct(productData.id);
      setTimeout(() => {
        checkBatchStockAlerts();
      }, 500);
    }
  }, [productData]);

  // Simplified function to get batch stock values
  const getBatchStockValues = (batch) => {
    return {
      opening_stock: parseFloat(batch.opening_stock) || 0,
      stock_in: parseFloat(batch.stock_in) || 0,
      stock_out: parseFloat(batch.stock_out) || 0,
      // Use current_stock directly since it's provided in the API
      balance_stock: parseFloat(batch.current_stock || batch.quantity) || 0,
      latest_date: batch.updated_at || batch.created_at,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="salesitems-wrapper">
        <div className={`admin-sidebar-container ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminSidebar user={user} collapsed={sidebarCollapsed} />
        </div>
        <div className={`salesitems-content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            user={user}
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="salesitems-main-content">
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="salesitems-wrapper">
        <div className={`admin-sidebar-container ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminSidebar user={user} collapsed={sidebarCollapsed} />
        </div>
        <div className={`salesitems-content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            user={user}
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="salesitems-main-content">
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle text-danger"></i>
              </div>
              <p className="error-message">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchProduct();
                }}
                className="btn btn-primary"
              >
                <i className="fas fa-redo me-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salesitems-wrapper">
      <div className={`admin-sidebar-container ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminSidebar user={user} collapsed={sidebarCollapsed} />
      </div>
      <div className={`salesitems-content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          user={user}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {stockAlerts.length > 0 && (
          <div className="stock-alerts-container">
            {stockAlerts.map((alert, index) => (
              <div
                key={index}
                className={`alert ${alert.level === 'danger' ? 'alert-danger' : 'alert-warning'} stock-alert`}
              >
                <div className="d-flex align-items-center">
                  <i className={`fas ${alert.type === 'min_stock' ? 'fa-exclamation-triangle' : 'fa-boxes'} me-2`}></i>
                  <span>{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="salesitems-main-content">
          <div className="container-fluid">
            
            {/* Header Section */}
            <div className="page-header mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
<h1 className="page-title text-primary fw-bold">
  {productData.goods_name} ({productData.product_type || 'N/A'})
</h1>                  <p className="page-subtitle text-muted">Product Details & Inventory Management</p>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Product Information Card */}
              <div className="col-xl-4 col-lg-5">
                <div className="card product-info-card h-100">
                  <div className="card-header bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="card-title mb-0">
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        Product Information
                      </h4>
                      <span className="badge bg-primary">SKU: {productData.sku}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Unit of Measure</label>
                        <span className="value">{productData.unit}</span>
                      </div>
                      <div className="info-item">
                        <label>HSN Code</label>
                        <span className="value">{productData.hsn_code}</span>
                      </div>
                      <div className="info-item">
                        <label>GST Rate</label>
                        <span className="value badge bg-light text-dark">{productData.gst_rate}%</span>
                      </div>
                      <div className="info-item">
                        <label>Cess Rate</label>
                        <span className="value badge bg-light text-dark">{productData.cess_rate}%</span>
                      </div>
                      <div className="info-item">
                        <label>Selling Price</label>
                        <span className="value text-success fw-bold">{formatCurrency(productData.price)}</span>
                      </div>
                      <div className="info-item">
                        <label>Net Price</label>
                        <span className="value">{formatCurrency(productData.net_price)}</span>
                      </div>
                      <div className="info-item">
                        <label>Cess Amount</label>
                        <span className="value">{formatCurrency(productData.cess_amount)}</span>
                      </div>
                      <div className="info-item">
                        <label>Tax Status</label>
                        <span className="value">
                          <span className={`badge ${productData.non_taxable ? 'bg-warning' : 'bg-info'}`}>
                            {productData.non_taxable ? 'Non-Taxable' : 'Taxable'}
                          </span>
                        </span>
                      </div>
                      <div className="info-item full-width">
                        <label>Product Description</label>
                        <span className="value description-text">{productData.description || 'No description available'}</span>
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* Stock Information */}
                    <h6 className="section-title mb-3">
                      <i className="fas fa-boxes me-2 text-secondary"></i>
                      Stock Information
                    </h6>
                    <div className="stock-stats">
                      <div className="stock-stat-item">
                        <div className="stat-label">Opening Stock</div>
                        <div className="stat-value">
                          {productData.batches?.reduce((sum, batch) => sum + (parseFloat(batch.opening_stock) || 0), 0) || 0}
                        </div>
                      </div>
                      <div className="stock-stat-item">
                        <div className="stat-label">Current Stock</div>
                        <div className="stat-value text-primary fw-bold">
                          {productData.batches?.reduce((sum, batch) => sum + (parseFloat(batch.current_stock || batch.quantity) || 0), 0) || 0}
                        </div>
                      </div>
                      <div className="stock-stat-item">
                        <div className="stat-label">Min Stock Alert</div>
                        <div className="stat-value text-warning">{productData.min_stock_alert}</div>
                      </div>
                      <div className="stock-stat-item">
                        <div className="stat-label">Max Stock Alert</div>
                        <div className="stat-value text-info">{productData.max_stock_alert}</div>
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* Audit Information */}
                    <h6 className="section-title mb-3">
                      <i className="fas fa-history me-2 text-secondary"></i>
                      Audit Information
                    </h6>
                    <div className="audit-info">
                      <div className="audit-item">
                        <label>Created On</label>
                        <span>{formatDate(productData.opening_stock_date)}</span>
                      </div>
                      <div className="audit-item">
                        <label>Last Updated</label>
                        <span>{formatDate(productData.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Stock & Transaction Details */}
              <div className="col-xl-8 col-lg-7">
                
                {/* Stock Details Card */}
                <div className="card stock-details-card mb-4">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="fas fa-chart-line me-2 text-primary"></i>
                      {productData.maintain_batch ? "Batch-wise Stock Details" : "Stock Movement Details"}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Batch Number</th>
                            <th>Opening Stock</th>
                            <th>Stock In</th>
                            <th>Stock Out</th>
                            <th>Current Stock</th>
                            <th>Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productData.batches && productData.batches.length > 0 ? (
                            productData.batches.map((batch) => {
                              const batchStock = getBatchStockValues(batch);
                              const batchQuantity = parseFloat(batch.current_stock || batch.quantity) || 0;
                              const minAlert = parseFloat(productData.min_stock_alert) || 0;
                              const maxAlert = parseFloat(productData.max_stock_alert) || 0;
                              const isLowStock = minAlert > 0 && batchQuantity <= minAlert;
                              const isHighStock = maxAlert > 0 && batchQuantity >= maxAlert;

                              return (
                                <tr key={batch.id} className={isLowStock ? 'table-warning' : isHighStock ? 'table-info' : ''}>
                                  <td>
                                    <div className="product-name-cell">
                                      <span className="product-name">{productData.goods_name}</span>
                                      {isLowStock && (
                                        <span className="badge bg-danger ms-2">
                                          <i className="fas fa-exclamation-circle me-1"></i>
                                          Low Stock
                                        </span>
                                      )}
                                      {isHighStock && (
                                        <span className="badge bg-warning ms-2">
                                          <i className="fas fa-box me-1"></i>
                                          High Stock
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="price-value">
                                      {formatCurrency(batch.selling_price || productData.price)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="batch-number">{batch.batch_number}</span>
                                  </td>
                                  <td>
                                    <span className="stock-value">{batchStock.opening_stock}</span>
                                  </td>
                                  <td>
                                    <span className="stock-in text-success fw-bold">
                                      +{batchStock.stock_in}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="stock-out text-danger fw-bold">
                                      -{batchStock.stock_out}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="balance-stock fw-bold">
                                      {batchStock.balance_stock}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="date-value">
                                      {formatDate(batchStock.latest_date)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-inbox fa-2x text-muted mb-3"></i>
                                  <p className="text-muted">No batches found for this product.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Sales Transactions */}
                <div className="card sales-transactions-card mb-4">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">
                        <i className="fas fa-receipt me-2 text-success"></i>
                        Recent Sales Transactions
                      </h5>
                      {voucherData && (
                        <span className="badge bg-primary">
                          <i className="fas fa-chart-bar me-1"></i>
                          Total: {voucherData.totalVouchers || 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    {voucherLoading ? (
                      <div className="loading-state">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading sales transactions...</p>
                      </div>
                    ) : voucherError ? (
                      <div className="error-state">
                        <i className="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                        <p className="text-danger mb-3">{voucherError}</p>
                        <button
                          onClick={() => fetchVouchersByProduct(productData.id)}
                          className="btn btn-outline-primary"
                        >
                          <i className="fas fa-redo me-2"></i>
                          Retry
                        </button>
                      </div>
                    ) : voucherData && voucherData.vouchers && voucherData.vouchers.length > 0 ? (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Invoice No</th>
                              <th>Date</th>
                              <th>Customer</th>
                              <th>Quantity</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {voucherData.vouchers.map((voucher) => (
                              <tr key={voucher.VoucherID}>
                                <td>
                                  <strong className="invoice-number">{voucher.InvoiceNumber || 'N/A'}</strong>
                                </td>
                                <td>
                                  <span className="date-value">{formatDate(voucher.Date)}</span>
                                </td>
                                <td>
                                  <span className="customer-name">{voucher.PartyName || voucher.AccountName || 'N/A'}</span>
                                </td>
                                <td>
                                  <span className="quantity-badge">
                                    {voucher.TotalQty || voucher.totalQuantity || 0}
                                  </span>
                                </td>
                                <td>
                                  <strong className="amount-value">
                                    {formatCurrency(voucher.TotalAmount || voucher.totalAmount)}
                                  </strong>
                                </td>
                                <td>
                                  <span
                                    className={`status-badge ${
                                      voucher.status === 'Paid'
                                        ? 'status-paid'
                                        : voucher.status === 'Pending'
                                        ? 'status-pending'
                                        : 'status-unknown'
                                    }`}
                                  >
                                    <i className={`fas ${
                                      voucher.status === 'Paid' ? 'fa-check-circle' :
                                      voucher.status === 'Pending' ? 'fa-clock' : 'fa-question-circle'
                                    } me-1`}></i>
                                    {voucher.status || 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <i className="fas fa-shopping-cart fa-2x text-muted mb-3"></i>
                        <p className="text-muted">No sales transactions found for this product.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Purchases */}
                <div className="card purchases-card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="fas fa-shopping-bag me-2 text-info"></i>
                      Recent Purchases
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Purchase Invoice</th>
                            <th>Invoice Date</th>
                            <th>Supplier Name</th>
                            <th>Stock Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                            <td>
                              <span className="stock-value">{productData.unit}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salesitems_productsdetails;