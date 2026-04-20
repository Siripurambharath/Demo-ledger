import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";

const StockDetailsModal = ({ show, onClose, stockData, context = "sales" }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    id: productId,
    goods_name = "N/A",
    opening_stock = "0",
    balance_stock = "0",
    price = "0",
    gst = "0%",
    description = "N/A",
  } = stockData || {};

  useEffect(() => {
    if (productId) fetchBatches();
  }, [productId]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseurl}/products/${productId}/batches`);
      setBatches(res.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {context === "sales" ? "Sales" : "Purchase"} Stock Details - {goods_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="stock-details-grid mb-3">
          <div><strong>Product Name:</strong> {goods_name}</div>
          <div><strong>Price:</strong> ₹{price}</div>
          <div><strong>GST Rate:</strong> {gst}</div>
          <div><strong>Description:</strong> {description}</div>
        </div>

        <hr />

        <h5>Batches:</h5>
        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : batches.length === 0 ? (
          <p>No batches found for this product.</p>
        ) : (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {batches.map((batch) => (
              <div key={batch.id} className="mb-2 p-2 border rounded">
                <div><strong>Batch Number:</strong> {batch.batch_number}</div>
                <div><strong>Group:</strong> {batch.group_by}</div>
                <div><strong>MFG Date:</strong> {formatDate(batch.mfg_date)}</div>
                <div><strong>EXP Date:</strong> {formatDate(batch.exp_date)}</div>
                {/* <div><strong>Current Quantity:</strong> {batch.quantity}</div> */}
                
                <div><strong>Opening Stock:</strong> {batch.opening_stock || "0"}</div>
                <div><strong>Stock In:</strong> {batch.stock_in || "0"}</div>
                <div><strong>Stock Out:</strong> {batch.stock_out || "0"}</div>
                <div><strong>Current Stock:</strong> {batch.current_stock || batch.quantity}</div>

                <div><strong>Cost Price:</strong> ₹{batch.cost_price}</div>
                <div><strong>Selling Price:</strong> ₹{batch.selling_price}</div>
                {/* <div><strong>Purchase Price:</strong> ₹{batch.purchase_price}</div> */}
                <div><strong>MRP:</strong> ₹{batch.mrp}</div>
                <div><strong>Batch Price:</strong> ₹{batch.batch_price}</div>
                <div><strong>Barcode:</strong> {batch.barcode}</div>
                <div><strong>Created At:</strong> {new Date(batch.created_at).toLocaleString()}</div>
                <div><strong>Updated At:</strong> {new Date(batch.updated_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

export default StockDetailsModal;