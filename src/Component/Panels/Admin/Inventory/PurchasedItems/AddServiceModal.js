// AddServiceModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";

const AddServiceModal = ({ show, onClose, groupType }) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    group_by: groupType,
    service_name: "",
    price: "",
    inclusive_gst: "Inclusive of GST",
    gst_rate: "GST Rate to be Applied",
    net_price: "",
    sac_code: "",
    cess_rate: "",
    cess_amount: "",
    non_taxable: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting service data:", formData);

    try {
      const response = await axios.post(`${baseurl}/services`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("✅ Service added successfully!");
      console.log("Response:", response.data);
      onClose(); // Close the modal on success
      alert("submitted sucessfully");
      // Reset form after successful submission
      setFormData({
        group_by: groupType,
        service_name: "",
        price: "",
        inclusive_gst: "Inclusive of GST",
        gst_rate: "GST Rate to be Applied",
        net_price: "",
        sac_code: "",
        cess_rate: "",
        cess_amount: "",
        non_taxable: "",
        description: ""
      });
    } catch (error) {
      console.error("❌ Failed to add service.");

      if (error.response) {
        console.error("Status Code:", error.response.status);
        console.error("Message:", error.response.data?.message || "Server error");
        if (error.response.data?.errors) {
          console.error("Validation Errors:", error.response.data.errors);
        }
      } else if (error.request) {
        console.error("No response from server. Please check your network or server status.");
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
           Add Services {groupType === "Salescatalog" ? "Sales Catalogue" : "Purchased Items"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <Form.Control 
                placeholder="Service Name" 
                name="service_name"
                value={formData.service_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <Form.Control 
                placeholder="Price" 
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <Form.Select
                name="inclusive_gst"
                value={formData.inclusive_gst}
                onChange={handleChange}
              >
                <option value="Inclusive">Inclusive of GST</option>
                <option value="Exclusive">Exclusive of GST</option>
              </Form.Select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <Form.Select
                name="gst_rate"
                value={formData.gst_rate}
                onChange={handleChange}
              >
                <option>GST Rate to be Applied</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </Form.Select>
            </div>
            <div className="col">
              <Form.Control 
                placeholder="Net Price | GST" 
                name="net_price"
                type="number"
                value={formData.net_price}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <Form.Control 
                placeholder="SAC Code" 
                name="sac_code"
                value={formData.sac_code}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <Form.Control 
                placeholder="CESS Rate%" 
                name="cess_rate"
                type="number"
                value={formData.cess_rate}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <Form.Control 
                placeholder="CESS Amount" 
                name="cess_amount"
                type="number"
                value={formData.cess_amount}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <Form.Control 
                placeholder="Non Taxable" 
                name="non_taxable"
                type="text"
                value={formData.non_taxable}
                onChange={handleChange}
              />
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddServiceModal;