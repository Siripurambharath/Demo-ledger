// AddCompanyModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";

const AddCompanyModal = ({ show, onClose, onSave }) => {
  const [companyName, setCompanyName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

 // AddCompanyModal.js
const handleSave = async () => {
  if (companyName.trim() === "") return;
  
  setIsSaving(true);
  try {
    const response = await axios.post(`${baseurl}/companies`, {
      company_name: companyName
    });
    onSave(response.data); // Pass the full saved company object
    setCompanyName("");
    onClose();
  } catch (error) {
    console.error("Error saving company:", error);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
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
        <Button variant="info" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Body>
    </Modal>
  );
};
export default AddCompanyModal;