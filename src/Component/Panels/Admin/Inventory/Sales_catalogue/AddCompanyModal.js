// AddCompanyModal.js (Alternative version)
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "./../../../../BaseURL/BaseURL";

const AddCompanyModal = ({ show, onClose, onSave }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyDiscount, setCompanyDiscount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (companyName.trim() === "") return;
    
    setIsSaving(true);
    try {
      const response = await axios.post(`${baseurl}/companies`, {
        company_name: companyName,
        discount: parseFloat(companyDiscount) || 0
      });
      onSave(response.data);
      setCompanyName("");
      setCompanyDiscount(0);
      onClose();
    } catch (error) {
      console.error("Error saving company:", error);
      alert('Failed to add company. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCompanyName("");
    setCompanyDiscount(0);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add Company Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Discount (%)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="Enter discount percentage"
            value={companyDiscount}
            onChange={(e) => setCompanyDiscount(e.target.value)}
          />
          <Form.Text className="text-muted">
            Enter 0 for no discount
          </Form.Text>
        </Form.Group>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={isSaving || companyName.trim() === ""}
          >
            {isSaving ? 'Saving...' : 'Save Company'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddCompanyModal;