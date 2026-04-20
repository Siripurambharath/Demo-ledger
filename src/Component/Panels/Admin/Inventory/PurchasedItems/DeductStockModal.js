import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { baseurl } from "../../../../BaseURL/BaseURL";
import axios from "axios";

const DeductStockModal = ({ show, onClose, currentStock = 0, onSave, selectedProductId }) => {
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && selectedProductId) {
      fetchBatches();
      // Reset form when modal opens
      setQuantity("");
      setRemark("");
      setSelectedBatch("");
      setError("");
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
    // Validation
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    if (!selectedBatch) {
      alert("Please select a batch");
      return;
    }

    const deductionQuantity = parseInt(quantity);
    
    // Find the selected batch to check available quantity
    const selectedBatchData = batches.find(batch => batch.id.toString() === selectedBatch);
    if (!selectedBatchData) {
      alert("Selected batch not found");
      return;
    }

    const batchCurrentStock = parseFloat(selectedBatchData.quantity) || 0;
    
    if (deductionQuantity > batchCurrentStock) {
      alert(`Deduction amount cannot exceed current stock for this batch. Available: ${batchCurrentStock}`);
      return;
    }

    // Call the onSave function with batch information
    onSave({
      quantity: deductionQuantity,
      remark: remark.trim(),
      batchId: selectedBatch
    });
    
    // Reset form and close modal
    setQuantity("");
    setRemark("");
    setSelectedBatch("");
    onClose();
  };

  // Calculate total stock from all batches
  const totalStock = batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="md">
      <Modal.Header closeButton>
        <Modal.Title>Deduct Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Current Stock</strong>
            {batches.length > 0 ? (
              <div className="mt-2">
                {batches.map((batch) => (
                  <div 
                    key={batch.id} 
                    className={`d-flex justify-content-between align-items-center mb-2 p-2 border rounded ${
                      selectedBatch === batch.id.toString() ? 'bg-light border-primary' : ''
                    }`}
                  >
                    <span className="fw-medium">{batch.batch_number}</span>
                    <span className="text-primary fw-bold">{batch.quantity}</span>
                  </div>
                ))}
                {/* Total Stock */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <strong>Total Stock:</strong>
                  <strong className="text-success">{totalStock}</strong>
                </div>
              </div>
            ) : (
              <div className="text-muted mt-1">No batches available</div>
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
            Batch Number *
            {loading && <small className="text-muted ms-2">(Loading...)</small>}
          </Form.Label>
          {batches.length > 0 ? (
            <Form.Select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              required
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
                placeholder="No batches available"
                disabled
              />
              <Form.Text className="text-danger">
                No batches available for this product. Please add stock first.
              </Form.Text>
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Quantity to Deduct *</Form.Label>
          <Form.Control
            type="number"
            min="1"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          {selectedBatch && (
            <Form.Text className="text-muted">
              Maximum available in selected batch: {
                batches.find(b => b.id.toString() === selectedBatch)?.quantity || 0
              }
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Reason for Deduction (Optional)</Form.Label> {/* Changed label */}
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Enter reason for stock deduction (optional)"
            value={remark}
            onChange={(e) => setRemark(e.target.value)} 
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleSave}
          disabled={!selectedBatch || !quantity || batches.length === 0} 
        >
          Confirm Deduction
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeductStockModal;