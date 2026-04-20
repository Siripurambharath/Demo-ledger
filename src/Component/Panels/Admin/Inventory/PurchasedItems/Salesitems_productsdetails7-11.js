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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/products/${id}/with-batches`);
      setProductData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Failed to load product details. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Function to get stock data for a specific batch
  const getStockDataForBatch = (batchNumber) => {
    if (!productData.stock || productData.stock.length === 0) return null;
    return productData.stock.find(stock => stock.batch_number === batchNumber);
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
            <div className="salesitems-loading">Loading product details...</div>
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
            <div className="salesitems-error">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchProduct();
                }}
                className="salesitems-retry-btn"
              >
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
        <div className="salesitems-main-content">
          <div className="container-fluid mt-3">
            <div className="card p-3">
              <h1 className="mb-4 fw-bold text-primary">{productData.goods_name}</h1>

              <div className="row">
                {/* LEFT COLUMN: PRODUCT DETAILS */}
                <div className="col-md-4">
                  <div className="card mb-3 p-3 bg-light shadow-sm border-0">
                    <h4 className="text-secondary">Product Details</h4>
                    <hr className="my-2" />
                    <p><strong>Units:</strong> {productData.unit}</p>
                    <p><strong>HSN:</strong> {productData.hsn_code}</p>
                    <p><strong>GST:</strong> {productData.gst_rate}</p>
                    <p><strong>Cess:</strong> {productData.cess_rate}</p>
                    <p><strong>SKU:</strong> {productData.sku}</p>
                    <p><strong>Description:</strong> {productData.description}</p>
                    <p><strong>Non-Taxable:</strong> {productData.non_taxable ? "Yes" : "No"}</p>
                    <p><strong>Net Price:</strong> ₹{productData.net_price}</p>
                    <p><strong>Cess Amount:</strong> ₹{productData.cess_amount}</p>
                    <p><strong>Maintain Batch:</strong> {productData.maintain_batch ? "Yes" : "No"}</p>
                    <p><strong>Can Be Sold:</strong> {productData.can_be_sold ? "Yes" : "No"}</p>
                    <p><strong>Created By:</strong> N/A</p>
                    <p>
                      <strong>Created On:</strong>{" "}
                      {new Date(productData.opening_stock_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p><strong>Last Updated By:</strong> N/A</p>
                    <p>
                      <strong>Last Updated On:</strong>{" "}
                      {new Date(productData.updated_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="col-md-8">
                  {/* Product Batch Stock Details - Shows all batches as rows */}
                  <div className="card mb-4 p-3 shadow-sm border-0">
                    <h5 className="fw-semibold text-secondary">Product Batch Stock Details</h5>
                    <hr className="my-2" />
                    <div className="table-responsive">
                      <table className="salesitems-table">
                        <thead className="table-light">
                          <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Batch Number</th>
                            <th>Batch Quantity</th>
                            <th>Opening Stock</th>
                            <th>Stock In</th>
                            <th>Stock Out</th>
                            <th>Balance Stock</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productData.batches && productData.batches.length > 0 ? (
                            productData.batches.map((batch) => {
                              const stockData = getStockDataForBatch(batch.batch_number);
                              return (
                                <tr key={batch.id}>
                                  <td>{productData.goods_name}</td>
                                  <td>₹{productData.price}</td>
                                  <td>{batch.batch_number}</td>
                                  <td>{batch.quantity}</td>
                                  <td>{stockData ? stockData.opening_stock : batch.quantity}</td>
                                  <td style={{ color: 'green', fontWeight: '600' }}>
                                    {stockData ? stockData.stock_in : 0}
                                  </td>
                                  <td style={{ color: 'red', fontWeight: '600' }}>
                                    {stockData ? stockData.stock_out : 0}
                                  </td>
                                  <td style={{ fontWeight: '600' }}>
                                    {stockData ? stockData.balance_stock : batch.quantity}
                                  </td>
                                  <td>
                                    {stockData && stockData.date 
                                      ? new Date(stockData.date).toLocaleDateString("en-IN")
                                      : "N/A"}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="9" className="text-center text-muted">
                                No batches found for this product.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                
                  {/* <div className="card mb-4 p-3 shadow-sm border-0">
                    <h5 className="fw-semibold text-secondary">Recent Sales</h5>
                    <hr className="my-2" />
                    <div className="table-responsive">
                      <table className="salesitems-table">
                        <thead className="table-light">
                          <tr>
                            <th>Invoice</th>
                            <th>Invoice Date</th>
                            <th>Customer Name</th>
                            <th>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan="4" className="text-center text-muted">
                              No sales recorded for this product.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div> */}

                 
                  {/* <div className="card mb-4 p-3 shadow-sm border-0">
                    <h5 className="fw-semibold text-secondary">Recent Purchases</h5>
                    <hr className="my-2" />
                    <div className="table-responsive">
                      <table className="salesitems-table">
                        <thead className="table-light">
                          <tr>
                            <th>Purchase Invoice</th>
                            <th>Invoice Date</th>
                            <th>Supplier Name</th>
                            <th>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>01/01/1970</td>
                            <td>—</td>
                            <td>—</td>
                            <td>{productData.unit}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div> */}

                  {/* Audit Log */}
                  {/* <div className="card p-3 shadow-sm border-0">
                    <h5 className="fw-semibold text-secondary">Audit Log</h5>
                    <hr className="my-2" />
                    <p className="text-muted mb-0">
                      Last entry recorded on{" "}
                      {new Date(productData.opening_stock_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div> */}
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