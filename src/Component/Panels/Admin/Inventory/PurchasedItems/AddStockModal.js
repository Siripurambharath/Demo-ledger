import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";

const AddStockModal = ({ show, onClose,  onSave, selectedProductId }) => {
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch batches when modal opens and productId is available
  useEffect(() => {
    if (show && selectedProductId) {
      fetchBatches();
    }
  }, [show, selectedProductId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${baseurl}/batch/product/${selectedProductId}`);
      setBatches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError("Failed to load batches");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedBatch && batches.length > 0) {
      setError("Please select a batch");
      return;
    }

    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    onSave({ 
      quantity: parseInt(quantity), 
      remark,
      date,
      batchId: selectedBatch
    });
    
    // Reset form
    setQuantity("");
    setRemark("");
    setSelectedBatch("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setQuantity("");
    setRemark("");
    setSelectedBatch("");
    setError("");
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="md">
      <Modal.Header closeButton>
        <Modal.Title>Add Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
<Row className="mb-3">
  <Col md={6}>
    <strong>Current Stock</strong>
    {batches.length > 0 ? (
      <div className="mt-2">
        {batches.map((batch) => (
          <div key={batch.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
            <span className="fw-medium">{batch.batch_number}</span>
            <span className="text-primary fw-bold">{batch.quantity}</span>
          </div>
        ))}
        {/* Total Stock */}
        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <strong>Total Stock:</strong>
          <strong className="text-success">{batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0)}</strong>
        </div>
      </div>
    ) : (
      <div className="text-primary fw-bold mt-1">{}</div>
    )}
  </Col>
  <Col md={6}>
    <strong>Date</strong>
    <div className="mt-1">{date}</div>
  </Col>
</Row>

{/* Batches Dropdown */}
<Form.Group className="mb-3">
  <Form.Label>
    Batch Number {batches.length > 0 && "*"}
    {loading && <small className="text-muted ms-2">(Loading...)</small>}
  </Form.Label>
  {batches.length > 0 ? (
    <Form.Select
      value={selectedBatch}
      onChange={(e) => setSelectedBatch(e.target.value)}
      className={error && !selectedBatch ? 'border-danger' : ''}
    >
      <option value="">Select Batch</option>
      {batches.map((batch) => (
        <option key={batch.id} value={batch.id}>
          {batch.batch_number}
          {batch.expiry_date && ` (Exp: ${new Date(batch.expiry_date).toLocaleDateString()})`}
        </option>
      ))}
    </Form.Select>
  ) : (
    <div>
      <Form.Control
        type="text"
        placeholder="No batches available. Enter new batch number"
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
      />
      <Form.Text className="text-muted">
        {loading ? "Loading batches..." : "Enter new batch number or create batches first"}
      </Form.Text>
    </div>
  )}
</Form.Group>

        {/* Quantity Input */}
        <Form.Group className="mb-3">
          <Form.Label>Quantity to Add *</Form.Label>
          <Form.Control
            type="number"
            min="1"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={error && !quantity ? 'border-danger' : ''}
          />
        </Form.Group>

        {/* Remark */}
        <Form.Group className="mb-3">
          <Form.Label>Remark (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Reason for adding stock"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Loading..." : "Confirm Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddStockModal;